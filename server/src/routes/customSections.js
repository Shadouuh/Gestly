import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

const TYPES = new Set(['text', 'number', 'date', 'boolean']);
const idOf = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const businessIdOf = (req) => idOf(req.user?.businessId);

const findTable = async (tableId, businessId) => {
  const [rows] = await pool.query(
    'SELECT id, business_id AS businessId, title, subtitle, created_at AS createdAt, updated_at AS updatedAt FROM custom_tables WHERE id = ? AND business_id = ?',
    [tableId, businessId]
  );
  return rows[0] || null;
};

const normalizeValues = (input, columns) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Los datos de la fila deben ser un objeto');
  const allowed = new Map(columns.map((column) => [String(column.id), column]));
  const normalized = {};
  for (const [key, raw] of Object.entries(input)) {
    const column = allowed.get(key);
    if (!column) throw new Error(`Columna desconocida: ${key}`);
    if (raw === null || raw === '') { normalized[key] = null; continue; }
    if (column.dataType === 'text') {
      if (typeof raw !== 'string' || raw.length > 2000) throw new Error(`${column.name}: texto inválido o demasiado largo`);
      normalized[key] = raw.trim();
    } else if (column.dataType === 'number') {
      const value = Number(raw);
      if (typeof raw === 'boolean' || !Number.isFinite(value)) throw new Error(`${column.name}: número inválido`);
      normalized[key] = value;
    } else if (column.dataType === 'date') {
      const parsedDate = typeof raw === 'string' ? new Date(`${raw}T00:00:00Z`) : null;
      if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== raw) {
        throw new Error(`${column.name}: fecha inválida`);
      }
      normalized[key] = raw;
    } else if (column.dataType === 'boolean') {
      if (typeof raw !== 'boolean') throw new Error(`${column.name}: valor verdadero/falso inválido`);
      normalized[key] = raw;
    }
  }
  return normalized;
};

router.get('/', async (req, res) => {
  const businessId = businessIdOf(req);
  if (!businessId) return res.status(403).json({ message: 'Negocio no disponible' });
  try {
    const [rows] = await pool.query(
      'SELECT id, title, subtitle FROM custom_tables WHERE business_id = ? ORDER BY id',
      [businessId]
    );
    res.json(rows);
  } catch (error) {
    console.error('customSections list:', error);
    res.status(500).json({ message: 'No se pudieron cargar las secciones' });
  }
});

router.post('/', async (req, res) => {
  const businessId = businessIdOf(req);
  const title = String(req.body?.title || '').trim();
  const subtitle = String(req.body?.subtitle || '').trim();
  if (!businessId) return res.status(403).json({ message: 'Negocio no disponible' });
  if (!title || title.length > 120 || subtitle.length > 255) {
    return res.status(400).json({ message: 'Ingresá un título (máximo 120 caracteres) y un subtítulo de hasta 255 caracteres' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO custom_tables (business_id, title, subtitle) VALUES (?, ?, ?)',
      [businessId, title, subtitle]
    );
    res.status(201).json(await findTable(result.insertId, businessId));
  } catch (error) {
    console.error('customSections create:', error);
    res.status(500).json({ message: 'No se pudo crear la sección' });
  }
});

router.get('/:tableId', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  if (!businessId || !tableId) return res.status(404).json({ message: 'Sección no encontrada' });
  try {
    const table = await findTable(tableId, businessId);
    if (!table) return res.status(404).json({ message: 'Sección no encontrada' });
    const [columns] = await pool.query(
      'SELECT id, name, data_type AS dataType, position FROM custom_columns WHERE table_id = ? ORDER BY position, id',
      [tableId]
    );
    const [rows] = await pool.query(
      'SELECT id, values_json AS `values`, created_at AS createdAt, updated_at AS updatedAt FROM custom_rows WHERE table_id = ? ORDER BY id DESC',
      [tableId]
    );
    res.json({ ...table, columns, rows: rows.map((row) => ({
      ...row,
      values: typeof row.values === 'string' ? JSON.parse(row.values) : row.values,
    })) });
  } catch (error) {
    console.error('customSections detail:', error);
    res.status(500).json({ message: 'No se pudo cargar la sección' });
  }
});

router.patch('/:tableId', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  if (!businessId || !tableId) return res.status(404).json({ message: 'Sección no encontrada' });
  const title = String(req.body?.title || '').trim();
  const subtitle = String(req.body?.subtitle || '').trim();
  if (!title || title.length > 120 || subtitle.length > 255) return res.status(400).json({ message: 'Título o subtítulo inválido' });
  try {
    if (!(await findTable(tableId, businessId))) return res.status(404).json({ message: 'Sección no encontrada' });
    await pool.query('UPDATE custom_tables SET title = ?, subtitle = ? WHERE id = ?', [title, subtitle, tableId]);
    res.json(await findTable(tableId, businessId));
  } catch (error) {
    console.error('customSections update:', error);
    res.status(500).json({ message: 'No se pudo actualizar la sección' });
  }
});

router.post('/:tableId/columns', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  if (!businessId || !tableId) return res.status(404).json({ message: 'Sección no encontrada' });
  const name = String(req.body?.name || '').trim();
  const dataType = String(req.body?.dataType || 'text');
  if (!name || name.length > 80 || !TYPES.has(dataType)) return res.status(400).json({ message: 'Nombre o tipo de columna inválido' });
  try {
    if (!(await findTable(tableId, businessId))) return res.status(404).json({ message: 'Sección no encontrada' });
    const [existing] = await pool.query('SELECT id, name FROM custom_columns WHERE table_id = ? ORDER BY position, id', [tableId]);
    if (existing.length >= 30) return res.status(400).json({ message: 'Máximo 30 columnas por sección' });
    if (existing.some((column) => column.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      return res.status(409).json({ message: 'Ya existe una columna con ese nombre' });
    }
    const [result] = await pool.query(
      'INSERT INTO custom_columns (table_id, name, data_type, position) VALUES (?, ?, ?, ?)',
      [tableId, name, dataType, existing.length]
    );
    res.status(201).json({ id: result.insertId, name, dataType, position: existing.length });
  } catch (error) {
    console.error('customSections add column:', error);
    res.status(500).json({ message: 'No se pudo agregar la columna' });
  }
});

router.post('/:tableId/rows', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  if (!businessId || !tableId) return res.status(404).json({ message: 'Sección no encontrada' });
  try {
    if (!(await findTable(tableId, businessId))) return res.status(404).json({ message: 'Sección no encontrada' });
    const [columns] = await pool.query('SELECT id, name, data_type AS dataType FROM custom_columns WHERE table_id = ?', [tableId]);
    if (columns.length === 0) return res.status(400).json({ message: 'Agregá una columna antes de insertar filas' });
    const values = normalizeValues(req.body?.values, columns);
    const [result] = await pool.query('INSERT INTO custom_rows (table_id, values_json) VALUES (?, ?)', [tableId, JSON.stringify(values)]);
    res.status(201).json({ id: result.insertId, values });
  } catch (error) {
    if (error.message && /inválid|columna|objeto|largo/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    console.error('customSections add row:', error);
    res.status(500).json({ message: 'No se pudo guardar la fila' });
  }
});

router.patch('/:tableId/rows/:rowId', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  const rowId = idOf(req.params.rowId);
  if (!businessId || !tableId || !rowId) return res.status(404).json({ message: 'Fila no encontrada' });
  try {
    if (!(await findTable(tableId, businessId))) return res.status(404).json({ message: 'Fila no encontrada' });
    const [columns] = await pool.query('SELECT id, name, data_type AS dataType FROM custom_columns WHERE table_id = ?', [tableId]);
    const values = normalizeValues(req.body?.values, columns);
    const [result] = await pool.query('UPDATE custom_rows SET values_json = ? WHERE id = ? AND table_id = ?', [JSON.stringify(values), rowId, tableId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Fila no encontrada' });
    res.json({ id: rowId, values });
  } catch (error) {
    if (error.message && /inválid|columna|objeto|largo/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    console.error('customSections update row:', error);
    res.status(500).json({ message: 'No se pudo actualizar la fila' });
  }
});

router.delete('/:tableId/rows/:rowId', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  const rowId = idOf(req.params.rowId);
  if (!businessId || !tableId || !rowId) return res.status(404).json({ message: 'Fila no encontrada' });
  try {
    if (!(await findTable(tableId, businessId))) return res.status(404).json({ message: 'Fila no encontrada' });
    const [result] = await pool.query('DELETE FROM custom_rows WHERE id = ? AND table_id = ?', [rowId, tableId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Fila no encontrada' });
    res.json({ success: true });
  } catch (error) {
    console.error('customSections delete row:', error);
    res.status(500).json({ message: 'No se pudo eliminar la fila' });
  }
});

export default router;
