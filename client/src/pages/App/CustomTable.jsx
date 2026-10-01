import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Edit3, Info, LayoutGrid, List, Plus, Save, Search, Table2, Trash2, X } from 'lucide-react';
import api from '../../services/api';

const INPUT = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const PRIMARY = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50';
const SECONDARY = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800';
const TYPE_OPTIONS = [
  ['text', 'Texto'], ['number', 'Número'], ['date', 'Fecha'], ['boolean', 'Sí / No'],
  ['relation', 'Relación con otra tabla'], ['aggregate', 'Total calculado'],
];
const AGGREGATE_SOURCES = [['custom', 'Otra tabla personalizada'], ['sales', 'Ventas existentes'], ['cash', 'Movimientos de caja']];
const RELATION_SOURCES = [...AGGREGATE_SOURCES, ['products', 'Productos del catálogo'], ['customers', 'Clientes'], ['suppliers', 'Proveedores'], ['branches', 'Sucursales']];
const BUILTIN_FILTERS = {
  sales: [['status', 'Estado', 'text'], ['branch_id', 'Sucursal (ID)', 'number'], ['payment_method', 'Medio de pago', 'text'], ['customer_id', 'Cliente (ID)', 'number'], ['created_at', 'Fecha', 'date']],
  cash: [['type', 'Tipo (expense/income)', 'text'], ['category', 'Categoría', 'text'], ['branch_id', 'Sucursal (ID)', 'number'], ['created_at', 'Fecha', 'date']],
};
const filtersForColumn = (column) => {
  const config = column.config || {};
  if (Array.isArray(config.filters)) return config.filters;
  if (!config.matchMode || config.matchMode === 'all') return [];
  return [{ field: String(config.filterField), operator: 'eq', valueMode: config.matchMode === 'column' ? 'column' : config.matchMode, value: config.filterValue, columnId: config.matchColumnId }];
};
const errorText = (error) => error.response?.data?.message || 'No se pudo completar la operación. Revisá la conexión.';
const cleanValues = (values, columns) => Object.fromEntries(columns.filter((column) => column.dataType !== 'aggregate').map((column) => [String(column.id), values?.[String(column.id)] ?? '']));
const getCellValue = (row, column) => column.dataType === 'aggregate'
  ? row.computed?.[column.id]
  : column.dataType === 'relation' ? row.displayValues?.[column.id] : row.values?.[String(column.id)];
const formatValue = (value, type) => {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'boolean') return value ? 'Sí' : 'No';
  if (type === 'aggregate') return Number(value).toLocaleString('es-AR', { maximumFractionDigits: 2 });
  return String(value);
};

const BUILTIN_DESTINATIONS = {
  sales: { label: 'Ventas y Fiados', path: '/app/ventas' },
  cash: { label: 'Ventas y Fiados', path: '/app/ventas' },
  products: { label: 'Mi Catálogo', path: '/app/catalogo' },
  customers: { label: 'Clientes', path: '/app/clientes' },
  branches: { label: 'Sucursales', path: '/app/sucursales' },
  suppliers: { label: 'Proveedores', path: null },
};
const BUILTIN_FIELD_NAMES = { status: 'Estado', branch_id: 'Sucursal', payment_method: 'Medio de pago', customer_id: 'Cliente', created_at: 'Fecha', type: 'Tipo', category: 'Categoría' };

const aggregateDetailForRow = (row, column, sourceTable) => {
  const filters = filtersForColumn(column);
  if (!filters.length) return 'Suma todos los registros del origen';
  return filters.map((filter, index) => {
    const field = sourceTable?.columns.find((candidate) => String(candidate.id) === String(filter.field));
    const fieldName = field?.name || BUILTIN_FIELD_NAMES[filter.field] || filter.field;
    const override = row.filters?.[String(column.id)]?.[String(index)];
    const value = override || (filter.valueMode === 'row' ? 'esta fila' : filter.valueMode === 'column'
      ? row.values?.[String(filter.columnId)] : filter.value);
    const operator = filter.operator === 'gte' ? '≥' : filter.operator === 'lte' ? '≤' : '=';
    return `${fieldName} ${operator} ${value === null || value === undefined || value === '' ? 'sin dato' : value}`;
  }).join(' · ');
};

const relatedItemsForRow = (row, columns, availableTables) => columns.flatMap((column) => {
  const config = column.config;
  if (!config || !['relation', 'aggregate'].includes(column.dataType)) return [];
  if (column.dataType === 'relation' && !row.values?.[String(column.id)]) return [];
  const type = column.dataType === 'relation' ? config.targetType : config.sourceType;
  const target = type === 'custom'
    ? availableTables.find((item) => Number(item.id) === Number(column.dataType === 'relation' ? config.targetTableId : config.sourceTableId))
    : BUILTIN_DESTINATIONS[type];
  if (!target) return [];
  const label = type === 'custom' ? target.title : target.label;
  const path = type === 'custom' ? `/app/secciones/${target.nodeId}?tabla=${target.id}` : target.path;
  const detail = column.dataType === 'relation' ? row.displayValues?.[column.id] : aggregateDetailForRow(row, column, type === 'custom' ? target : null);
  return [{ key: column.id, column: column.name, label, path, detail }];
});

function RowRelationTooltip({ row, columns, availableTables }) {
  const items = relatedItemsForRow(row, columns, availableTables);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimer = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    if (!open) return undefined;
    const reposition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({
        top: rect.bottom + 8 + 220 > window.innerHeight ? Math.max(8, rect.top - 228) : rect.bottom + 8,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 312)),
      });
    };
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    const onPointerDown = (event) => {
      if (!buttonRef.current?.contains(event.target) && !popoverRef.current?.contains(event.target)) setOpen(false);
    };
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const keepOpen = () => clearTimeout(closeTimer.current);
  const closeSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpen(false), 180); };
  return <>
    <button ref={buttonRef} type="button" title="Ver relaciones y atajos" aria-label={`Ver relaciones de la fila ${row.id}`} aria-expanded={open} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-slate-800" onMouseEnter={() => { keepOpen(); setOpen(true); }} onMouseLeave={closeSoon} onFocus={() => setOpen(true)} onClick={() => setOpen(true)}><Info size={16} /></button>
    {open && createPortal(<div ref={popoverRef} role="dialog" aria-label={`Relaciones de la fila ${row.id}`} className="fixed z-[100] w-[304px] max-w-[calc(100vw-16px)] rounded-xl border border-indigo-100 bg-white p-3 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900" style={position} onMouseEnter={keepOpen} onMouseLeave={closeSoon}>
      <p className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-200">Relacionado con</p>
      {items.length ? <ul className="max-h-52 space-y-2 overflow-y-auto">{items.map((item) => <li key={item.key} className="text-xs leading-5 text-slate-600 dark:text-slate-300"><span className="font-semibold">{item.column}</span> → {item.path ? <Link to={item.path} className="font-bold text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-300" onClick={() => setOpen(false)}>{item.label}</Link> : <span>{item.label}</span>}{item.detail && <span className="block text-slate-500">{item.detail}</span>}</li>)}</ul> : <p className="text-xs text-slate-500">Esta fila todavía no tiene relaciones.</p>}
    </div>, document.body)}
  </>;
}

const chooseCardFields = (columns) => {
  const text = columns.filter((column) => column.dataType === 'text');
  const title = text.find((column) => /nombre|título|titulo|producto|concepto|descripci[oó]n|cliente|proveedor|material|art[ií]culo|item/i.test(column.name)) || text[0] || columns[0];
  const subtitle = columns.find((column) => column.id !== title?.id && /categor[ií]a|tipo|estado|marca|fecha|c[oó]digo|sku/i.test(column.name)) || text.find((column) => column.id !== title?.id);
  const featured = columns.filter((column) => column.id !== title?.id && column.id !== subtitle?.id && ['number', 'aggregate'].includes(column.dataType)).sort((a, b) => {
    const score = (name) => /total|precio|monto|importe|costo|gasto|venta|cantidad|stock/i.test(name) ? 1 : 0;
    return score(b.name) - score(a.name);
  }).slice(0, 2);
  return { title, subtitle, featured };
};

function ColumnBuilder({ table, availableTables, onSaved, onCancel }) {
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState('text');
  const [sourceType, setSourceType] = useState('custom');
  const [sourceTableId, setSourceTableId] = useState('');
  const [valueColumnId, setValueColumnId] = useState('');
  const [filters, setFilters] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sourceTable = availableTables.find((item) => String(item.id) === sourceTableId);
  const sourceColumns = sourceTable?.columns || [];
  const numberColumns = sourceColumns.filter((column) => column.dataType === 'number');
  const rowRelationColumns = sourceColumns.filter((column) => column.dataType === 'relation' && column.config?.targetType === 'custom' && Number(column.config?.targetTableId) === Number(table.id));
  const filterChoices = sourceType === 'custom'
    ? sourceColumns.filter((column) => column.dataType !== 'aggregate').map((column) => [String(column.id), column.name, column.dataType])
    : BUILTIN_FILTERS[sourceType];
  const localChoices = table.columns.filter((column) => !['aggregate'].includes(column.dataType));
  const effectiveValueColumnId = numberColumns.some((column) => String(column.id) === valueColumnId)
    ? valueColumnId : String(numberColumns[0]?.id || '');
  const updateFilter = (index, patch) => setFilters((previous) => previous.map((filter, position) => position === index ? { ...filter, ...patch } : filter));

  const preparedFilters = filters.map((filter) => {
    const choices = filter.valueMode === 'row' ? rowRelationColumns.map((column) => [String(column.id), column.name, 'relation']) : filterChoices;
    const field = choices.some(([id]) => id === filter.field) ? filter.field : choices[0]?.[0] || '';
    const fieldType = choices.find(([id]) => id === field)?.[2];
    const compatibleLocal = localChoices.filter((column) =>
      fieldType === 'date' ? column.dataType === 'date' :
        fieldType === 'number' ? ['number', 'relation'].includes(column.dataType) : column.dataType === fieldType
    );
    const columnId = compatibleLocal.some((column) => String(column.id) === String(filter.columnId))
      ? String(filter.columnId) : String(compatibleLocal[0]?.id || '');
    return { ...filter, field, fieldType, choices, compatibleLocal, columnId };
  });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      let config = null;
      if (dataType === 'relation') {
        config = { targetType: sourceType, targetTableId: sourceType === 'custom' ? Number(sourceTableId) : null };
      } else if (dataType === 'aggregate') {
        config = {
          sourceType,
          sourceTableId: sourceType === 'custom' ? Number(sourceTableId) : null,
          valueColumnId: sourceType === 'custom' ? Number(effectiveValueColumnId) : null,
          filters: preparedFilters.map((filter) => ({
            field: filter.field,
            operator: filter.operator,
            valueMode: filter.valueMode,
            ...(filter.valueMode === 'fixed' ? { value: filter.value } : {}),
            ...(filter.valueMode === 'column' ? { columnId: Number(filter.columnId) } : {}),
          })),
        };
      }
      await api.post(`/custom-sections/${table.id}/columns`, { name, dataType, config });
      await onSaved();
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setBusy(false); }
  };

  const needsSource = dataType === 'relation' || dataType === 'aggregate';
  const canSubmit = name.trim() && (!needsSource || sourceType !== 'custom' || sourceTableId) &&
    (dataType !== 'aggregate' || (sourceType !== 'custom' || effectiveValueColumnId)) &&
    preparedFilters.every((filter) => filter.field &&
      (filter.valueMode !== 'fixed' || String(filter.value || '').trim()) &&
      (filter.valueMode !== 'column' || filter.columnId));

  return <form onSubmit={submit} className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900 dark:text-white">Nueva columna</h3><button type="button" aria-label="Cerrar" onClick={onCancel}><X size={18} /></button></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nombre<input className={`${INPUT} mt-1`} value={name} maxLength={80} required onChange={(event) => setName(event.target.value)} placeholder="Ej: Proveedor, Costos" /></label>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo<select className={`${INPUT} mt-1`} value={dataType} onChange={(event) => { setDataType(event.target.value); setFilters([]); }}>{TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    {needsSource && <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Origen<select className={`${INPUT} mt-1`} value={sourceType} onChange={(event) => { setSourceType(event.target.value); setSourceTableId(''); setFilters([]); }}>{(dataType === 'relation' ? RELATION_SOURCES : AGGREGATE_SOURCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {sourceType === 'custom' && <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tabla de origen<select className={`${INPUT} mt-1`} value={sourceTableId} onChange={(event) => { setSourceTableId(event.target.value); setValueColumnId(''); setFilters([]); }} required><option value="">Elegir tabla...</option>{availableTables.map((item) => <option key={item.id} value={item.id}>{item.title}{Number(item.id) === Number(table.id) ? ' (esta tabla)' : ''}</option>)}</select></label>}
    </div>}
    {dataType === 'relation' && <p className="text-xs text-slate-500">Al insertar una fila podrás elegir un registro de esa tabla o de los datos existentes.</p>}
    {dataType === 'aggregate' && <>
      <p className="text-xs text-slate-500">El total se calcula al abrir la tabla. No se escribe manualmente ni modifica el origen.</p>
      {sourceType === 'custom' && <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Columna numérica que se suma<select className={`${INPUT} mt-1`} value={effectiveValueColumnId} onChange={(event) => setValueColumnId(event.target.value)} disabled={!sourceTableId}><option value="">Elegir columna...</option>{numberColumns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}</select></label>}
      <div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Condiciones · se cumplen todas</h4><button type="button" className={SECONDARY} disabled={filters.length >= 6} onClick={() => setFilters((previous) => [...previous, { field: '', operator: 'eq', valueMode: 'fixed', value: '', columnId: '' }])}><Plus size={15} />Condición</button></div>
        {preparedFilters.length === 0 && <p className="text-xs text-slate-500">Sin condiciones, se suma el origen completo. Podés combinar estado, sucursal y fechas.</p>}
        {preparedFilters.map((filter, index) => <div key={index} className="grid gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Campo de origen<select className={`${INPUT} mt-1`} value={filter.field} onChange={(event) => updateFilter(index, { field: event.target.value, operator: 'eq', columnId: '' })} disabled={sourceType === 'custom' && !sourceTableId}><option value="">Elegir...</option>{filter.choices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Comparación<select className={`${INPUT} mt-1`} value={filter.operator} onChange={(event) => updateFilter(index, { operator: event.target.value })}><option value="eq">Igual a</option>{['date', 'number'].includes(filter.fieldType) && <><option value="gte">Desde / mayor o igual</option><option value="lte">Hasta / menor o igual</option></>}</select></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tomar valor de<select className={`${INPUT} mt-1`} value={filter.valueMode} onChange={(event) => updateFilter(index, { valueMode: event.target.value, field: '', operator: 'eq' })}><option value="fixed">Valor fijo</option><option value="column">Columna de esta fila</option>{sourceType === 'custom' && rowRelationColumns.length > 0 && <option value="row">Relación con esta fila</option>}</select></label>
          <div className="flex items-end gap-1">{filter.valueMode === 'fixed' ? <input aria-label={`Valor de condición ${index + 1}`} className={INPUT} type={filter.fieldType === 'date' ? 'date' : filter.fieldType === 'number' ? 'number' : 'text'} value={filter.value || ''} onChange={(event) => updateFilter(index, { value: event.target.value })} placeholder="Ej: paid" /> : filter.valueMode === 'column' ? <select aria-label={`Columna local para condición ${index + 1}`} className={INPUT} value={filter.columnId} onChange={(event) => updateFilter(index, { columnId: event.target.value })}><option value="">Elegir columna...</option>{filter.compatibleLocal.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}</select> : <p className="w-full py-2 text-xs text-slate-500">ID de esta fila</p>}<button type="button" aria-label={`Quitar condición ${index + 1}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setFilters((previous) => previous.filter((_, position) => position !== index))}><X size={16} /></button></div>
        </div>)}
      </div>
    </>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex gap-2"><button type="submit" className={PRIMARY} disabled={busy || !canSubmit}><Plus size={16} />Agregar columna</button><button type="button" className={SECONDARY} onClick={onCancel}>Cancelar</button></div>
  </form>;
}

function RowEditor({ table, availableTables, initial, rowId, onSaved, onCancel }) {
  const [values, setValues] = useState(() => cleanValues(initial?.values, table.columns));
  const [filterOverrides, setFilterOverrides] = useState(() => initial?.filters || {});
  const [options, setOptions] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all(table.columns.filter((column) => column.dataType === 'relation').map(async (column) => {
      const { data } = await api.get(`/custom-sections/${table.id}/columns/${column.id}/options`);
      return [column.id, data];
    })).then((entries) => { if (!cancelled) setOptions(Object.fromEntries(entries)); })
      .catch((requestError) => { if (!cancelled) setError(errorText(requestError)); });
    return () => { cancelled = true; };
  }, [table]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const path = `/custom-sections/${table.id}/rows${rowId ? `/${rowId}` : ''}`;
      if (rowId) await api.patch(path, { values, filters: filterOverrides });
      else await api.post(path, { values, filters: filterOverrides });
      await onSaved();
    } catch (requestError) { setError(errorText(requestError)); }
    finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900 dark:text-white">{rowId ? 'Editar fila' : 'Insertar dato'}</h2><button type="button" aria-label="Cerrar" onClick={onCancel}><X size={18} /></button></div>
      <div className="space-y-3">{table.columns.filter((column) => column.dataType !== 'aggregate').map((column) => <label key={column.id} className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{column.name}
        {column.dataType === 'boolean' ? <select className={`${INPUT} mt-1`} value={values[String(column.id)] === true ? 'true' : values[String(column.id)] === false ? 'false' : ''} onChange={(event) => setValues((previous) => ({ ...previous, [column.id]: event.target.value === '' ? null : event.target.value === 'true' }))}><option value="">Sin dato</option><option value="true">Sí</option><option value="false">No</option></select>
          : column.dataType === 'relation' ? <select className={`${INPUT} mt-1`} value={values[String(column.id)] ?? ''} onChange={(event) => setValues((previous) => ({ ...previous, [column.id]: event.target.value }))}><option value="">Sin relación</option>{(options[column.id] || []).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}{values[String(column.id)] && !(options[column.id] || []).some((option) => String(option.id) === String(values[String(column.id)])) && <option value={values[String(column.id)]}>Registro #{values[String(column.id)]}</option>}</select>
            : <input className={`${INPUT} mt-1`} type={column.dataType === 'number' ? 'number' : column.dataType === 'date' ? 'date' : 'text'} step={column.dataType === 'number' ? 'any' : undefined} value={values[String(column.id)] ?? ''} onChange={(event) => setValues((previous) => ({ ...previous, [column.id]: event.target.value }))} />}
      </label>)}</div>
      {table.columns.filter((column) => column.dataType === 'aggregate' && filtersForColumn(column).some((filter) => filter.valueMode !== 'row')).map((column) => {
        const sourceTable = availableTables.find((item) => Number(item.id) === Number(column.config?.sourceTableId));
        return <details key={column.id} className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><summary className="text-sm font-bold text-slate-700 dark:text-slate-200">Personalizar filtros de «{column.name}» para esta fila</summary><p className="mt-2 text-xs text-slate-500">Dejá un campo vacío para usar la regla de la columna.</p><div className="mt-3 space-y-3">{filtersForColumn(column).map((filter, index) => {
          if (filter.valueMode === 'row') return null;
          const sourceField = sourceTable?.columns.find((item) => String(item.id) === String(filter.field));
          const fieldType = filter.field === 'created_at' || sourceField?.dataType === 'date' ? 'date' : sourceField?.dataType === 'number' || ['branch_id', 'customer_id'].includes(filter.field) ? 'number' : 'text';
          const localName = table.columns.find((item) => Number(item.id) === Number(filter.columnId))?.name;
          const defaultLabel = filter.valueMode === 'fixed' ? filter.value : `columna «${localName || 'sin nombre'}»`;
          return <label key={index} className="block text-xs font-semibold text-slate-600 dark:text-slate-300">{sourceField?.name || filter.field} · {filter.operator === 'gte' ? 'desde' : filter.operator === 'lte' ? 'hasta' : 'igual a'}<input className={`${INPUT} mt-1`} type={fieldType} value={filterOverrides[String(column.id)]?.[String(index)] ?? ''} placeholder={`Por defecto: ${defaultLabel}`} onChange={(event) => setFilterOverrides((previous) => ({ ...previous, [column.id]: { ...(previous[String(column.id)] || {}), [index]: event.target.value } }))} /></label>;
        })}</div></details>;
      })}
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-5 flex justify-end gap-2"><button type="button" className={SECONDARY} onClick={onCancel}>Cancelar</button><button type="submit" className={PRIMARY} disabled={busy}><Save size={16} />Guardar fila</button></div>
    </form>
  </div>;
}

const CustomTable = ({ tableId }) => {
  const [table, setTable] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState(() => localStorage.getItem(`custom-table-view-${tableId}`) || 'table');
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const [{ data }, { data: metadata }] = await Promise.all([
      api.get(`/custom-sections/${tableId}`), api.get('/custom-sections/metadata/tables'),
    ]);
    setTable(data);
    setAvailableTables(metadata);
  };

  useEffect(() => {
    let cancelled = false;
    setTable(null);
    setLoading(true);
    setSearch('');
    setShowColumnForm(false);
    setEditingRow(null);
    setView(localStorage.getItem(`custom-table-view-${tableId}`) || 'table');
    setError('');
    Promise.all([api.get(`/custom-sections/${tableId}`), api.get('/custom-sections/metadata/tables')])
      .then(([detail, metadata]) => { if (!cancelled) { setTable(detail.data); setAvailableTables(metadata.data); } })
      .catch((requestError) => { if (!cancelled) setError(errorText(requestError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tableId]);

  const filteredRows = useMemo(() => {
    if (!table) return [];
    const query = search.trim().toLocaleLowerCase();
    if (!query) return table.rows;
    return table.rows.filter((row) => table.columns.some((column) => formatValue(getCellValue(row, column), column.dataType).toLocaleLowerCase().includes(query)));
  }, [table, search]);
  const cardFields = useMemo(() => chooseCardFields(table?.columns || []), [table]);

  const changeView = (next) => { setView(next); localStorage.setItem(`custom-table-view-${tableId}`, next); };
  const deleteRow = async (rowId) => {
    if (!window.confirm('¿Eliminar esta fila?')) return;
    setBusy(true);
    setError('');
    try { await api.delete(`/custom-sections/${tableId}/rows/${rowId}`); await reload(); }
    catch (requestError) { setError(errorText(requestError)); }
    finally { setBusy(false); }
  };
  const rowActions = (row) => <div className="flex justify-end gap-2"><RowRelationTooltip row={row} columns={table.columns} availableTables={availableTables} /><button type="button" aria-label="Editar fila" className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800" onClick={() => setEditingRow(row)}><Edit3 size={16} /></button><button type="button" aria-label="Eliminar fila" className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-slate-800" disabled={busy} onClick={() => deleteRow(row.id)}><Trash2 size={16} /></button></div>;

  if (loading) return <p className="p-6 text-sm text-slate-500">Cargando tabla...</p>;
  if (!table) return <p role="alert" className="p-6 text-sm text-red-600">{error || 'Tabla no encontrada'}</p>;

  return <section aria-label={table.title}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[200px] flex-1 sm:max-w-sm"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Buscar en la tabla" className={`${INPUT} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en esta tabla..." /></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-slate-200 p-1 dark:border-slate-700" role="group" aria-label="Vista de la tabla">
          <button type="button" aria-label="Ver como tabla" aria-pressed={view === 'table'} className={`rounded-lg p-2 ${view === 'table' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-slate-500'}`} onClick={() => changeView('table')}><List size={18} /></button>
          <button type="button" aria-label="Ver como cards" aria-pressed={view === 'cards'} className={`rounded-lg p-2 ${view === 'cards' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-slate-500'}`} onClick={() => changeView('cards')}><LayoutGrid size={18} /></button>
        </div>
        <button type="button" className={SECONDARY} onClick={() => setShowColumnForm((previous) => !previous)}><Plus size={16} />Columna</button>
        <button type="button" className={PRIMARY} disabled={!table.columns.some((column) => column.dataType !== 'aggregate')} onClick={() => setEditingRow({ id: null, values: {} })}><Plus size={16} />Insertar dato</button>
      </div>
    </div>
    {showColumnForm && <ColumnBuilder key={tableId} table={table} availableTables={availableTables} onSaved={async () => { await reload(); setShowColumnForm(false); }} onCancel={() => setShowColumnForm(false)} />}
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    {table.columns.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><Table2 size={32} className="mx-auto text-indigo-500" /><h3 className="mt-3 font-bold text-slate-900 dark:text-white">Esta tabla todavía no tiene columnas</h3><p className="mt-1 text-sm text-slate-500">Agregá la primera columna para empezar a cargar filas.</p><button type="button" className={`${PRIMARY} mt-4`} onClick={() => setShowColumnForm(true)}>Agregar columna</button></div>
      : view === 'table' ? <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"><tr>{table.columns.map((column) => <th key={column.id} scope="col" className="whitespace-nowrap px-4 py-3 font-bold">{column.name}</th>)}<th scope="col" className="px-4 py-3 text-right font-bold">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredRows.map((row) => <tr key={row.id} className="text-slate-700 dark:text-slate-200">{table.columns.map((column) => <td key={column.id} className="max-w-[280px] truncate px-4 py-3" title={formatValue(getCellValue(row, column), column.dataType)}>{formatValue(getCellValue(row, column), column.dataType)}</td>)}<td className="px-3 py-1">{rowActions(row)}</td></tr>)}</tbody></table>{filteredRows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">{search ? 'No hay resultados para esta búsqueda.' : 'Todavía no hay filas.'}</p>}</div>
        : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredRows.map((row) => {
          const { title, subtitle, featured } = cardFields;
          const other = table.columns.filter((column) => ![title?.id, subtitle?.id, ...featured.map((field) => field.id)].includes(column.id));
          return <article key={row.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate font-bold text-slate-900 dark:text-white">{title ? formatValue(getCellValue(row, title), title.dataType) : `Fila #${row.id}`}</h3>{subtitle && <p className="mt-1 truncate text-xs text-slate-500">{subtitle.name}: {formatValue(getCellValue(row, subtitle), subtitle.dataType)}</p>}</div>{rowActions(row)}</div>{featured.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3">{featured.map((column) => <div key={column.id}><p className="text-xs text-slate-500">{column.name}</p><p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{formatValue(getCellValue(row, column), column.dataType)}</p></div>)}</div>}{other.length > 0 && <dl className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">{other.map((column) => <div key={column.id} className="flex justify-between gap-2"><dt className="text-slate-500">{column.name}</dt><dd className="max-w-[65%] truncate text-right font-medium text-slate-700 dark:text-slate-200">{formatValue(getCellValue(row, column), column.dataType)}</dd></div>)}</dl>}</article>;
        })}{filteredRows.length === 0 && <p className="col-span-full p-8 text-center text-sm text-slate-500">{search ? 'No hay resultados para esta búsqueda.' : 'Todavía no hay filas.'}</p>}</div>}
    <p className="mt-3 text-xs text-slate-500">{table.rows.length} fila{table.rows.length === 1 ? '' : 's'} · {table.columns.length} columna{table.columns.length === 1 ? '' : 's'}</p>
    {editingRow && <RowEditor key={`${tableId}-${editingRow.id || 'new'}`} table={table} availableTables={availableTables} initial={editingRow} rowId={editingRow.id} onSaved={async () => { await reload(); setEditingRow(null); }} onCancel={() => setEditingRow(null)} />}
  </section>;
};

export default CustomTable;
