import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { normalizeRowFilterOverrides, parseConfig, populateComputed, referenceExists, relationOptions, validateConfig } from '../services/customFields.js';

const router = Router();
router.use(authMiddleware);

const TYPES = new Set(['text', 'number', 'date', 'boolean', 'relation', 'aggregate']);
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

const normalizeValues = async (input, columns, businessId) => {
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
    } else if (column.dataType === 'relation') {
      const rowId = idOf(raw);
      if (!rowId || !(await referenceExists(pool, businessId, column.config, rowId))) throw new Error(`${column.name}: fila relacionada no encontrada`);
      normalized[key] = rowId;
    } else if (column.dataType === 'aggregate') {
      throw new Error(`${column.name}: el total se calcula automáticamente`);
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

router.get('/metadata/tables', async (req, res) => {
  const businessId = businessIdOf(req);
  if (!businessId) return res.status(403).json({ message: 'Negocio no disponible' });
  try {
    const [tables] = await pool.query('SELECT id, node_id AS nodeId, title FROM custom_tables WHERE business_id = ? ORDER BY id', [businessId]);
    const [columns] = await pool.query(
      'SELECT c.id, c.table_id AS tableId, c.name, c.data_type AS dataType, c.config_json AS config FROM custom_columns c JOIN custom_tables t ON t.id = c.table_id WHERE t.business_id = ? ORDER BY c.position, c.id',
      [businessId]
    );
    res.json(tables.map((table) => ({ ...table, columns: columns.filter((column) => column.tableId === table.id).map((column) => ({ ...column, config: parseConfig(column.config) })) })));
  } catch (error) {
    console.error('customSections metadata:', error);
    res.status(500).json({ message: 'No se pudieron cargar las tablas disponibles' });
  }
});

router.post('/', async (req, res) => {
  const businessId = businessIdOf(req);
  const nodeId = idOf(req.body?.nodeId);
  const title = String(req.body?.title || '').trim();
  const subtitle = String(req.body?.subtitle || '').trim();
  if (!businessId) return res.status(403).json({ message: 'Negocio no disponible' });
  if (!nodeId) return res.status(400).json({ message: 'Elegí una sección para la tabla' });
  if (!title || title.length > 120 || subtitle.length > 255) {
    return res.status(400).json({ message: 'Ingresá un título (máximo 120 caracteres) y un subtítulo de hasta 255 caracteres' });
  }
  try {
    const [nodes] = await pool.query('SELECT id FROM custom_nodes WHERE id = ? AND business_id = ?', [nodeId, businessId]);
    if (!nodes.length) return res.status(404).json({ message: 'Sección no encontrada' });
    const [result] = await pool.query(
      'INSERT INTO custom_tables (business_id, node_id, title, subtitle) VALUES (?, ?, ?, ?)',
      [businessId, nodeId, title, subtitle]
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
      'SELECT id, name, data_type AS dataType, position, config_json AS config FROM custom_columns WHERE table_id = ? ORDER BY position, id',
      [tableId]
    );
    const [rows] = await pool.query(
      'SELECT id, values_json AS `values`, filters_json AS filters, created_at AS createdAt, updated_at AS updatedAt FROM custom_rows WHERE table_id = ? ORDER BY id DESC',
      [tableId]
    );
    const parsedColumns = columns.map((column) => ({ ...column, config: parseConfig(column.config) }));
    const parsedRows = rows.map((row) => ({
      ...row,
      values: typeof row.values === 'string' ? JSON.parse(row.values) : row.values,
      filters: parseConfig(row.filters) || {},
    }));
    await populateComputed(pool, businessId, tableId, parsedColumns, parsedRows);
    res.json({ ...table, columns: parsedColumns, rows: parsedRows });
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
    let config;
    try { config = await validateConfig(pool, businessId, tableId, dataType, req.body?.config); }
    catch (validationError) { return res.status(400).json({ message: validationError.message }); }
    const [result] = await pool.query(
      'INSERT INTO custom_columns (table_id, name, data_type, position, config_json) VALUES (?, ?, ?, ?, ?)',
      [tableId, name, dataType, existing.length, config ? JSON.stringify(config) : null]
    );
    res.status(201).json({ id: result.insertId, name, dataType, position: existing.length, config });
  } catch (error) {
    console.error('customSections add column:', error);
    res.status(500).json({ message: 'No se pudo agregar la columna' });
  }
});

router.get('/:tableId/columns/:columnId/options', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  const columnId = idOf(req.params.columnId);
  if (!businessId || !tableId || !columnId) return res.status(404).json({ message: 'Columna no encontrada' });
  try {
    if (!(await findTable(tableId, businessId))) return res.status(404).json({ message: 'Columna no encontrada' });
    const [columns] = await pool.query('SELECT data_type AS dataType, config_json AS config FROM custom_columns WHERE id = ? AND table_id = ?', [columnId, tableId]);
    if (!columns.length || columns[0].dataType !== 'relation') return res.status(404).json({ message: 'Columna de relación no encontrada' });
    res.json(await relationOptions(pool, businessId, parseConfig(columns[0].config)));
  } catch (error) {
    console.error('customSections relation options:', error);
    res.status(500).json({ message: 'No se pudieron cargar las opciones' });
  }
});

router.post('/:tableId/rows', async (req, res) => {
  const businessId = businessIdOf(req);
  const tableId = idOf(req.params.tableId);
  if (!businessId || !tableId) return res.status(404).json({ message: 'Sección no encontrada' });
  try {
    if (!(await findTable(tableId, businessId))) return res.status(404).json({ message: 'Sección no encontrada' });
    const [rawColumns] = await pool.query('SELECT id, name, data_type AS dataType, config_json AS config FROM custom_columns WHERE table_id = ?', [tableId]);
    const columns = rawColumns.map((column) => ({ ...column, config: parseConfig(column.config) }));
    if (columns.length === 0) return res.status(400).json({ message: 'Agregá una columna antes de insertar filas' });
    const values = await normalizeValues(req.body?.values, columns, businessId);
    const filters = normalizeRowFilterOverrides(req.body?.filters, columns);
    const [result] = await pool.query('INSERT INTO custom_rows (table_id, values_json, filters_json) VALUES (?, ?, ?)', [tableId, JSON.stringify(values), JSON.stringify(filters)]);
    res.status(201).json({ id: result.insertId, values, filters });
  } catch (error) {
    if (error.message && /inválid|columna|objeto|largo|relacionada|automáticamente|filtro|total de fila/i.test(error.message)) {
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
    const [rawColumns] = await pool.query('SELECT id, name, data_type AS dataType, config_json AS config FROM custom_columns WHERE table_id = ?', [tableId]);
    const columns = rawColumns.map((column) => ({ ...column, config: parseConfig(column.config) }));
    const values = await normalizeValues(req.body?.values, columns, businessId);
    const filters = normalizeRowFilterOverrides(req.body?.filters, columns);
    const [result] = await pool.query('UPDATE custom_rows SET values_json = ?, filters_json = ? WHERE id = ? AND table_id = ?', [JSON.stringify(values), JSON.stringify(filters), rowId, tableId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Fila no encontrada' });
    res.json({ id: rowId, values, filters });
  } catch (error) {
    if (error.message && /inválid|columna|objeto|largo|relacionada|automáticamente|filtro|total de fila/i.test(error.message)) {
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
    const [relationColumns] = await pool.query(
      "SELECT c.id, c.table_id AS tableId, c.config_json AS config FROM custom_columns c JOIN custom_tables t ON t.id = c.table_id WHERE t.business_id = ? AND c.data_type = 'relation'",
      [businessId]
    );
    for (const column of relationColumns) {
      const config = parseConfig(column.config);
      if (config?.targetType !== 'custom' || Number(config.targetTableId) !== tableId) continue;
      const [references] = await pool.query(
        'SELECT id FROM custom_rows WHERE table_id = ? AND JSON_UNQUOTE(JSON_EXTRACT(values_json, ?)) = ? LIMIT 1',
        [column.tableId, `$."${column.id}"`, String(rowId)]
      );
      if (references.length) return res.status(409).json({ message: 'Esta fila está relacionada desde otra tabla. Quitá esa relación antes de eliminarla.' });
    }
    const [result] = await pool.query('DELETE FROM custom_rows WHERE id = ? AND table_id = ?', [rowId, tableId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Fila no encontrada' });
    res.json({ success: true });
  } catch (error) {
    console.error('customSections delete row:', error);
    res.status(500).json({ message: 'No se pudo eliminar la fila' });
  }
});

export default router;
