import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

const positiveId = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
};
const businessIdOf = (req) => positiveId(req.user?.businessId);

const getNode = async (nodeId, businessId) => {
  const [nodes] = await pool.query(
    'SELECT id, business_id AS businessId, title, subtitle FROM custom_nodes WHERE id = ? AND business_id = ?',
    [nodeId, businessId]
  );
  return nodes[0] || null;
};

router.get('/', async (req, res) => {
  const businessId = businessIdOf(req);
  if (!businessId) return res.status(403).json({ message: 'Negocio no disponible' });
  try {
    const [nodes] = await pool.query('SELECT id, title, subtitle FROM custom_nodes WHERE business_id = ? ORDER BY id', [businessId]);
    res.json(nodes);
  } catch (error) {
    console.error('customNodes list:', error);
    res.status(500).json({ message: 'No se pudieron cargar las secciones' });
  }
});

router.post('/', async (req, res) => {
  const businessId = businessIdOf(req);
  const title = String(req.body?.title || '').trim();
  const subtitle = String(req.body?.subtitle || '').trim();
  const tableTitle = String(req.body?.tableTitle || 'Tabla principal').trim();
  if (!businessId) return res.status(403).json({ message: 'Negocio no disponible' });
  if (!title || title.length > 120 || subtitle.length > 255 || !tableTitle || tableTitle.length > 120) {
    return res.status(400).json({ message: 'Título o subtítulo inválido' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [node] = await connection.query(
      'INSERT INTO custom_nodes (business_id, title, subtitle) VALUES (?, ?, ?)',
      [businessId, title, subtitle]
    );
    const [table] = await connection.query(
      'INSERT INTO custom_tables (business_id, node_id, title, subtitle) VALUES (?, ?, ?, ?)',
      [businessId, node.insertId, tableTitle, '']
    );
    await connection.commit();
    res.status(201).json({ id: node.insertId, title, subtitle, tables: [{ id: table.insertId, title: tableTitle }] });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('customNodes create:', error);
    res.status(500).json({ message: 'No se pudo crear la sección' });
  } finally {
    connection?.release();
  }
});

router.get('/:nodeId', async (req, res) => {
  const businessId = businessIdOf(req);
  const nodeId = positiveId(req.params.nodeId);
  if (!businessId || !nodeId) return res.status(404).json({ message: 'Sección no encontrada' });
  try {
    const node = await getNode(nodeId, businessId);
    if (!node) return res.status(404).json({ message: 'Sección no encontrada' });
    const [tables] = await pool.query(
      'SELECT id, title, subtitle FROM custom_tables WHERE node_id = ? AND business_id = ? ORDER BY id',
      [nodeId, businessId]
    );
    res.json({ ...node, tables });
  } catch (error) {
    console.error('customNodes detail:', error);
    res.status(500).json({ message: 'No se pudo cargar la sección' });
  }
});

router.patch('/:nodeId', async (req, res) => {
  const businessId = businessIdOf(req);
  const nodeId = positiveId(req.params.nodeId);
  const title = String(req.body?.title || '').trim();
  const subtitle = String(req.body?.subtitle || '').trim();
  if (!businessId || !nodeId) return res.status(404).json({ message: 'Sección no encontrada' });
  if (!title || title.length > 120 || subtitle.length > 255) return res.status(400).json({ message: 'Título o subtítulo inválido' });
  try {
    if (!(await getNode(nodeId, businessId))) return res.status(404).json({ message: 'Sección no encontrada' });
    await pool.query('UPDATE custom_nodes SET title = ?, subtitle = ? WHERE id = ? AND business_id = ?', [title, subtitle, nodeId, businessId]);
    res.json({ id: nodeId, title, subtitle });
  } catch (error) {
    console.error('customNodes update:', error);
    res.status(500).json({ message: 'No se pudo editar la sección' });
  }
});

router.post('/:nodeId/tables', async (req, res) => {
  const businessId = businessIdOf(req);
  const nodeId = positiveId(req.params.nodeId);
  const title = String(req.body?.title || '').trim();
  if (!businessId || !nodeId) return res.status(404).json({ message: 'Sección no encontrada' });
  if (!title || title.length > 120) return res.status(400).json({ message: 'Nombre de tabla inválido' });
  try {
    if (!(await getNode(nodeId, businessId))) return res.status(404).json({ message: 'Sección no encontrada' });
    const [result] = await pool.query(
      'INSERT INTO custom_tables (business_id, node_id, title, subtitle) VALUES (?, ?, ?, ?)',
      [businessId, nodeId, title, '']
    );
    res.status(201).json({ id: result.insertId, title, subtitle: '' });
  } catch (error) {
    console.error('customNodes add table:', error);
    res.status(500).json({ message: 'No se pudo crear la tabla' });
  }
});

export default router;
