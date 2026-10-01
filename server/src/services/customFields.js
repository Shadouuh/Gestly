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
  sales: new Set(['status', 'branch_id', 'payment_method']),
  cash: new Set(['type', 'category', 'branch_id']),
};

const RELATION_TABLES = new Set(['products', 'customers', 'suppliers', 'branches']);

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

  const matchMode = String(config.matchMode || 'all');
  if (!['all', 'fixed', 'column', 'row'].includes(matchMode)) throw new Error('Modo de filtro inválido');
  if (matchMode === 'row' && sourceType !== 'custom') throw new Error('La relación por fila requiere otra tabla personalizada');
  const filterField = matchMode === 'all' ? null : String(config.filterField || '');
  if (matchMode !== 'all') {
    if (sourceType === 'custom') {
      const filterColumn = await sourceColumn(db, sourceTableId, idOf(filterField));
      if (!filterColumn) throw new Error('Columna de filtro no encontrada');
      if (matchMode === 'row' && (filterColumn.dataType !== 'relation' || filterColumn.config?.targetType !== 'custom' || Number(filterColumn.config?.targetTableId) !== currentTableId)) {
        throw new Error('Para relacionar por fila, la columna de origen debe apuntar a esta tabla');
      }
    } else if (!FILTERS[sourceType].has(filterField)) {
      throw new Error('Filtro de origen inválido');
    }
  }
  const matchColumnId = matchMode === 'column' ? idOf(config.matchColumnId) : null;
  if (matchMode === 'column' && !(await sourceColumn(db, currentTableId, matchColumnId))) throw new Error('Columna local de comparación no encontrada');
  const filterValue = matchMode === 'fixed' ? String(config.filterValue ?? '').trim() : null;
  if (matchMode === 'fixed' && (!filterValue || filterValue.length > 120)) throw new Error('Ingresá un valor de filtro válido');
  return { sourceType, sourceTableId, valueColumnId, matchMode, filterField, matchColumnId, filterValue };
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
const matchingValue = (row, config) => {
  if (config.matchMode === 'fixed') return config.filterValue;
  if (config.matchMode === 'column') return valueOf(row, config.matchColumnId);
  if (config.matchMode === 'row') return row.id;
  return null;
};

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
    const { sourceType, matchMode, filterField } = config;
    if (sourceType === 'custom') {
      const source = await sourceTable(db, config.sourceTableId, businessId);
      if (!source) continue;
      const [sourceRows] = await db.query('SELECT values_json AS vals FROM custom_rows WHERE table_id = ?', [source.id]);
      const totals = new Map();
      for (const sourceRow of sourceRows) {
        const vals = parseConfig(sourceRow.vals) || {};
        const amount = Number(vals[String(config.valueColumnId)]);
        if (!Number.isFinite(amount)) continue;
        const key = matchMode === 'all' ? '*' : String(vals[String(filterField)] ?? '');
        totals.set(key, (totals.get(key) || 0) + amount);
      }
      for (const row of rows) {
        const key = matchMode === 'all' ? '*' : String(matchingValue(row, config) ?? '');
        row.computed ??= {};
        row.computed[column.id] = totals.get(key) || 0;
      }
    } else {
      const isSales = sourceType === 'sales';
      const sourceName = isSales ? 'sales' : 'cash_movements';
      const measure = isSales ? 'total' : 'amount';
      const distinct = new Map();
      for (const row of rows) {
        const key = matchMode === 'all' ? '*' : String(matchingValue(row, config) ?? '');
        if (!distinct.has(key)) distinct.set(key, []);
        distinct.get(key).push(row);
      }
      for (const [key, targetRows] of distinct) {
        let sql = `SELECT COALESCE(SUM(${measure}), 0) AS total FROM ${sourceName} WHERE business_id = ?`;
        const params = [businessId];
        if (isSales) sql += " AND COALESCE(status, '') <> 'voided'";
        if (matchMode !== 'all') {
          if (key === '') {
            for (const row of targetRows) { row.computed ??= {}; row.computed[column.id] = 0; }
            continue;
          }
          sql += ` AND ${filterField} = ?`;
          params.push(key);
        }
        const [result] = await db.query(sql, params);
        for (const row of targetRows) {
          row.computed ??= {};
          row.computed[column.id] = Number(result[0].total) || 0;
        }
      }
    }
  }
  return rows;
}
