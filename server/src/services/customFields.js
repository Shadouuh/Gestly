const idOf = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const parseConfig = (raw) => raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;

const sourceTable = async (db, tableId, businessId) => {
  const [rows] = await db.query('SELECT id, title FROM custom_tables WHERE id = ? AND business_id = ?', [tableId, businessId]);
  return rows[0] || null;
};

const sourceColumn = async (db, tableId, columnId) => {
  const [rows] = await db.query('SELECT id, name, data_type AS dataType, config_json AS config FROM custom_columns WHERE id = ? AND table_id = ?', [columnId, tableId]);
  return rows[0] ? { ...rows[0], config: parseConfig(rows[0].config) } : null;
};

const FILTERS = {
  sales: { status: 'text', branch_id: 'number', payment_method: 'text', customer_id: 'number', created_at: 'date' },
  cash: { type: 'text', category: 'text', branch_id: 'number', created_at: 'date' },
};

const RELATION_TABLES = new Set(['products', 'customers', 'suppliers', 'branches']);

const validDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const getFilters = (config) => {
  if (Array.isArray(config?.filters)) return config.filters;
  if (!config?.matchMode || config.matchMode === 'all') return [];
  return [{
    field: String(config.filterField), operator: 'eq',
    valueMode: config.matchMode === 'column' ? 'column' : config.matchMode,
    value: config.filterValue ?? null, columnId: config.matchColumnId ?? null,
  }];
};

async function validateFilter(db, businessId, currentTableId, sourceType, sourceTableId, raw) {
  const field = String(raw?.field || '');
  const operator = String(raw?.operator || 'eq');
  const valueMode = String(raw?.valueMode || 'fixed');
  if (!['eq', 'gte', 'lte'].includes(operator)) throw new Error('Operador de filtro inválido');
  if (!['fixed', 'column', 'row'].includes(valueMode)) throw new Error('Origen del filtro inválido');
  let fieldType;
  let sourceField;
  if (sourceType === 'custom') {
    sourceField = await sourceColumn(db, sourceTableId, idOf(field));
    if (!sourceField || sourceField.dataType === 'aggregate') throw new Error('Columna de filtro no encontrada');
    fieldType = sourceField.dataType;
  } else {
    fieldType = FILTERS[sourceType]?.[field];
    if (!fieldType) throw new Error('Campo de filtro no permitido');
  }
  if (operator !== 'eq' && !['date', 'number'].includes(fieldType)) throw new Error('El rango requiere una fecha o un número');
  if (valueMode === 'row') {
    if (sourceType !== 'custom' || operator !== 'eq' || sourceField.dataType !== 'relation' ||
      sourceField.config?.targetType !== 'custom' || Number(sourceField.config?.targetTableId) !== currentTableId) {
      throw new Error('La relación por fila debe apuntar a esta tabla');
    }
    return { field, operator, valueMode };
  }
  if (valueMode === 'column') {
    const columnId = idOf(raw?.columnId);
    const local = await sourceColumn(db, currentTableId, columnId);
    if (!local || local.dataType === 'aggregate') throw new Error('Columna local de comparación no encontrada');
    if (fieldType === 'date' && local.dataType !== 'date') throw new Error('La fecha de origen debe compararse con una fecha de esta tabla');
    if (fieldType === 'number' && !['number', 'relation'].includes(local.dataType)) throw new Error('El número de origen debe compararse con un número o relación');
    if (fieldType === 'relation' && local.dataType !== 'relation') throw new Error('La relación de origen debe compararse con una relación de esta tabla');
    if (['text', 'boolean'].includes(fieldType) && local.dataType !== fieldType) throw new Error('El tipo de la columna local debe coincidir con el filtro');
    return { field, operator, valueMode, columnId };
  }
  const value = String(raw?.value ?? '').trim();
  if (!value || value.length > 120) throw new Error('Ingresá un valor de filtro válido');
  if (fieldType === 'date' && !validDate(value)) throw new Error('Fecha de filtro inválida');
  if (fieldType === 'number' && !Number.isFinite(Number(value))) throw new Error('Número de filtro inválido');
  return { field, operator, valueMode, value };
}

export async function validateConfig(db, businessId, currentTableId, dataType, config) {
  if (dataType !== 'relation' && dataType !== 'aggregate') return null;
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Configuración de columna inválida');

  if (dataType === 'relation') {
    const targetType = String(config.targetType || '');
    if (!['custom', 'sales', 'cash', ...RELATION_TABLES].includes(targetType)) throw new Error('Origen de relación inválido');
    const targetTableId = targetType === 'custom' ? idOf(config.targetTableId) : null;
    if (targetType === 'custom' && (!targetTableId || !(await sourceTable(db, targetTableId, businessId)))) {
      throw new Error('Tabla de destino no encontrada en este negocio');
    }
    return { targetType, targetTableId };
  }

  const sourceType = String(config.sourceType || '');
  if (!['custom', 'sales', 'cash'].includes(sourceType)) throw new Error('Origen del total inválido');
  const sourceTableId = sourceType === 'custom' ? idOf(config.sourceTableId) : null;
  const valueColumnId = sourceType === 'custom' ? idOf(config.valueColumnId) : null;
  if (sourceType === 'custom') {
    if (!sourceTableId || !(await sourceTable(db, sourceTableId, businessId))) throw new Error('Tabla de origen no encontrada en este negocio');
    const measure = await sourceColumn(db, sourceTableId, valueColumnId);
    if (!measure || measure.dataType !== 'number') throw new Error('Elegí una columna numérica de origen');
  }

  if (config.filters !== undefined && !Array.isArray(config.filters)) throw new Error('Lista de filtros inválida');

  const rawFilters = getFilters(config);
  if (rawFilters.length > 6) throw new Error('Máximo seis filtros por total');
  const filters = [];
  for (const raw of rawFilters) {
    filters.push(await validateFilter(db, businessId, currentTableId, sourceType, sourceTableId, raw));
  }
  return { sourceType, sourceTableId, valueColumnId, filters };
}

export function normalizeRowFilterOverrides(input, columns) {
  if (input === undefined || input === null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) throw new Error('Filtros de fila inválidos');
  const aggregateColumns = new Map(columns.filter((column) => column.dataType === 'aggregate').map((column) => [String(column.id), column]));
  const result = {};
  for (const [columnId, rawValues] of Object.entries(input)) {
    const column = aggregateColumns.get(columnId);
    if (!column || !rawValues || typeof rawValues !== 'object' || Array.isArray(rawValues)) throw new Error('Total de fila no encontrado');
    const filters = getFilters(column.config);
    const overrides = {};
    for (const [indexText, raw] of Object.entries(rawValues)) {
      const index = Number(indexText);
      const filter = filters[index];
      if (!Number.isInteger(index) || !filter || filter.valueMode === 'row') throw new Error('Filtro de fila no permitido');
      if (raw === null || raw === '') continue;
      const value = String(raw).trim();
      if (!value || value.length > 120) throw new Error('Valor de filtro de fila inválido');
      const sourceType = column.config?.sourceType;
      const fieldType = sourceType === 'custom' ? null : FILTERS[sourceType]?.[filter.field];
      if (fieldType === 'date' && !validDate(value)) throw new Error('Fecha de filtro de fila inválida');
      if (fieldType === 'number' && !Number.isFinite(Number(value))) throw new Error('Número de filtro de fila inválido');
      overrides[index] = value;
    }
    if (Object.keys(overrides).length) result[columnId] = overrides;
  }
  return result;
}

export async function referenceExists(db, businessId, config, rowId) {
  const target = config?.targetType;
  if (target === 'custom') {
    const [rows] = await db.query(
      'SELECT r.id FROM custom_rows r JOIN custom_tables t ON t.id = r.table_id WHERE r.id = ? AND t.id = ? AND t.business_id = ?',
      [rowId, config.targetTableId, businessId]
    );
    return rows.length > 0;
  }
  if (target === 'sales') {
    const [rows] = await db.query("SELECT id FROM sales WHERE id = ? AND business_id = ? AND COALESCE(status, '') <> 'voided'", [rowId, businessId]);
    return rows.length > 0;
  }
  if (target === 'cash') {
    const [rows] = await db.query('SELECT id FROM cash_movements WHERE id = ? AND business_id = ?', [rowId, businessId]);
    return rows.length > 0;
  }
  if (RELATION_TABLES.has(target)) {
    const extra = target === 'products' ? ' AND deleted_at IS NULL' : '';
    const [rows] = await db.query(`SELECT id FROM ${target} WHERE id = ? AND business_id = ?${extra}`, [rowId, businessId]);
    return rows.length > 0;
  }
  return false;
}

export async function relationOptions(db, businessId, config) {
  if (config?.targetType === 'custom') {
    const table = await sourceTable(db, idOf(config.targetTableId), businessId);
    if (!table) return [];
    const [columns] = await db.query("SELECT id FROM custom_columns WHERE table_id = ? AND data_type = 'text' ORDER BY position, id LIMIT 1", [table.id]);
    const labelColumnId = columns[0]?.id;
    const [rows] = await db.query('SELECT id, values_json AS vals FROM custom_rows WHERE table_id = ? ORDER BY id DESC LIMIT 500', [table.id]);
    return rows.map((row) => {
      const values = parseConfig(row.vals) || {};
      const label = labelColumnId ? String(values[String(labelColumnId)] || '').trim() : '';
      return { id: row.id, label: label ? `${label} (#${row.id})` : `Fila #${row.id}` };
    });
  }
  if (config?.targetType === 'sales') {
    const [rows] = await db.query("SELECT id, total FROM sales WHERE business_id = ? AND COALESCE(status, '') <> 'voided' ORDER BY id DESC LIMIT 500", [businessId]);
    return rows.map((row) => ({ id: row.id, label: `Venta #${row.id} · $${Number(row.total).toLocaleString('es-AR')}` }));
  }
  if (config?.targetType === 'cash') {
    const [rows] = await db.query('SELECT id, type, amount FROM cash_movements WHERE business_id = ? ORDER BY id DESC LIMIT 500', [businessId]);
    return rows.map((row) => ({ id: row.id, label: `${row.type === 'expense' ? 'Gasto' : 'Ingreso'} #${row.id} · $${Number(row.amount).toLocaleString('es-AR')}` }));
  }
  if (RELATION_TABLES.has(config?.targetType)) {
    const target = config.targetType;
    const extra = target === 'products' ? ' AND deleted_at IS NULL' : '';
    const [rows] = await db.query(`SELECT id, name FROM ${target} WHERE business_id = ?${extra} ORDER BY id DESC LIMIT 500`, [businessId]);
    return rows.map((row) => ({ id: row.id, label: `${row.name} (#${row.id})` }));
  }
  return [];
}

const valueOf = (row, columnId) => row.values?.[String(columnId)] ?? null;

const filterValueForRow = (row, aggregateColumnId, filter, index) => {
  const override = row.filters?.[String(aggregateColumnId)]?.[String(index)];
  if (override !== undefined && override !== null && override !== '') return override;
  if (filter.valueMode === 'fixed') return filter.value;
  if (filter.valueMode === 'column') return valueOf(row, filter.columnId);
  if (filter.valueMode === 'row') return row.id;
  return null;
};

const compare = (actual, expected, operator) => {
  if (actual === null || actual === undefined || expected === null || expected === undefined || expected === '') return false;
  if (operator === 'eq') return String(actual) === String(expected);
  const a = Number(actual);
  const b = Number(expected);
  if (Number.isFinite(a) && Number.isFinite(b)) return operator === 'gte' ? a >= b : a <= b;
  return operator === 'gte' ? String(actual) >= String(expected) : String(actual) <= String(expected);
};

const resolvedFilters = (row, columnId, filters) => filters.map((filter, index) => ({
  ...filter,
  resolved: filterValueForRow(row, columnId, filter, index),
}));

export async function populateComputed(db, businessId, tableId, columns, rows) {
  for (const column of columns) {
    const config = column.config;
    if (column.dataType === 'relation') {
      const labels = new Map((await relationOptions(db, businessId, config)).map((option) => [Number(option.id), option.label]));
      for (const row of rows) {
        const linkedId = Number(valueOf(row, column.id));
        row.displayValues ??= {};
        row.displayValues[column.id] = linkedId ? (labels.get(linkedId) || `#${linkedId}`) : null;
      }
    }
    if (column.dataType !== 'aggregate' || !config) continue;
    const { sourceType } = config;
    const filters = getFilters(config);
    if (sourceType === 'custom') {
      const source = await sourceTable(db, config.sourceTableId, businessId);
      if (!source) continue;
      const [sourceRows] = await db.query('SELECT values_json AS vals FROM custom_rows WHERE table_id = ?', [source.id]);
      const parsedSource = sourceRows.map((sourceRow) => parseConfig(sourceRow.vals) || {});
      for (const row of rows) {
        const criteria = resolvedFilters(row, column.id, filters);
        let total = 0;
        if (criteria.every((filter) => filter.resolved !== null && filter.resolved !== undefined && filter.resolved !== '')) {
          for (const values of parsedSource) {
            if (!criteria.every((filter) => compare(values[String(filter.field)], filter.resolved, filter.operator))) continue;
            const rawAmount = values[String(config.valueColumnId)];
            if (rawAmount === null || rawAmount === undefined || rawAmount === '') continue;
            const amount = Number(rawAmount);
            if (Number.isFinite(amount)) total += amount;
          }
        }
        row.computed ??= {};
        row.computed[column.id] = total;
      }
    } else {
      const isSales = sourceType === 'sales';
      const sourceName = isSales ? 'sales' : 'cash_movements';
      const measure = isSales ? 'total' : 'amount';
      const queryCache = new Map();
      for (const row of rows) {
        row.computed ??= {};
        const criteria = resolvedFilters(row, column.id, filters);
        if (criteria.some((filter) => filter.resolved === null || filter.resolved === undefined || filter.resolved === '')) {
          row.computed[column.id] = 0;
          continue;
        }
        const key = JSON.stringify(criteria.map((filter) => filter.resolved));
        if (queryCache.has(key)) {
          row.computed[column.id] = queryCache.get(key);
          continue;
        }
        let sql = `SELECT COALESCE(SUM(${measure}), 0) AS total FROM ${sourceName} WHERE business_id = ?`;
        const params = [businessId];
        if (isSales) sql += " AND COALESCE(status, '') <> 'voided'";
        for (const filter of criteria) {
          const fieldSql = filter.field === 'created_at' ? 'DATE(created_at)' : filter.field;
          const operatorSql = filter.operator === 'gte' ? '>=' : filter.operator === 'lte' ? '<=' : '=';
          sql += ` AND ${fieldSql} ${operatorSql} ?`;
          params.push(filter.resolved);
        }
        const [result] = await db.query(sql, params);
        const total = Number(result[0].total) || 0;
        queryCache.set(key, total);
        row.computed[column.id] = total;
      }
    }
  }
  return rows;
}
