import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, LayoutGrid, List, Plus, Save, Search, Table2, Trash2, X } from 'lucide-react';
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
  sales: [['status', 'Estado'], ['branch_id', 'Sucursal (ID)'], ['payment_method', 'Medio de pago']],
  cash: [['type', 'Tipo (expense/income)'], ['category', 'Categoría'], ['branch_id', 'Sucursal (ID)']],
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
  const [matchMode, setMatchMode] = useState('all');
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [matchColumnId, setMatchColumnId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sourceTable = availableTables.find((item) => String(item.id) === sourceTableId);
  const sourceColumns = sourceTable?.columns || [];
  const numberColumns = sourceColumns.filter((column) => column.dataType === 'number');
  const rowRelationColumns = sourceColumns.filter((column) => column.dataType === 'relation' && column.config?.targetType === 'custom' && Number(column.config?.targetTableId) === Number(table.id));
  const filterChoices = sourceType === 'custom'
    ? sourceColumns.filter((column) => column.dataType !== 'aggregate').map((column) => [String(column.id), column.name])
    : BUILTIN_FILTERS[sourceType];
  const localChoices = table.columns.filter((column) => !['aggregate'].includes(column.dataType));
  const effectiveFilterField = matchMode === 'row'
    ? (rowRelationColumns.some((column) => String(column.id) === filterField) ? filterField : String(rowRelationColumns[0]?.id || ''))
    : (filterChoices.some(([id]) => id === filterField) ? filterField : filterChoices[0]?.[0] || '');
  const effectiveValueColumnId = numberColumns.some((column) => String(column.id) === valueColumnId)
    ? valueColumnId : String(numberColumns[0]?.id || '');
  const effectiveMatchColumnId = localChoices.some((column) => String(column.id) === matchColumnId)
    ? matchColumnId : String(localChoices[0]?.id || '');

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
          matchMode,
          filterField: matchMode === 'all' ? null : effectiveFilterField,
          filterValue: matchMode === 'fixed' ? filterValue : null,
          matchColumnId: matchMode === 'column' ? Number(effectiveMatchColumnId) : null,
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
    (matchMode !== 'row' || rowRelationColumns.length > 0) &&
    (matchMode !== 'column' || localChoices.length > 0);

  return <form onSubmit={submit} className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900 dark:text-white">Nueva columna</h3><button type="button" aria-label="Cerrar" onClick={onCancel}><X size={18} /></button></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nombre<input className={`${INPUT} mt-1`} value={name} maxLength={80} required onChange={(event) => setName(event.target.value)} placeholder="Ej: Proveedor, Costos" /></label>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo<select className={`${INPUT} mt-1`} value={dataType} onChange={(event) => { setDataType(event.target.value); setMatchMode('all'); }}>{TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    {needsSource && <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Origen<select className={`${INPUT} mt-1`} value={sourceType} onChange={(event) => { setSourceType(event.target.value); setSourceTableId(''); setMatchMode('all'); }}>{(dataType === 'relation' ? RELATION_SOURCES : AGGREGATE_SOURCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {sourceType === 'custom' && <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tabla de origen<select className={`${INPUT} mt-1`} value={sourceTableId} onChange={(event) => { setSourceTableId(event.target.value); setValueColumnId(''); setFilterField(''); }} required><option value="">Elegir tabla...</option>{availableTables.map((item) => <option key={item.id} value={item.id}>{item.title}{Number(item.id) === Number(table.id) ? ' (esta tabla)' : ''}</option>)}</select></label>}
    </div>}
    {dataType === 'relation' && <p className="text-xs text-slate-500">Al insertar una fila podrás elegir un registro de esa tabla o de los datos existentes.</p>}
    {dataType === 'aggregate' && <>
      <p className="text-xs text-slate-500">El total se calcula al abrir la tabla. No se escribe manualmente ni modifica el origen.</p>
      {sourceType === 'custom' && <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Columna numérica que se suma<select className={`${INPUT} mt-1`} value={effectiveValueColumnId} onChange={(event) => setValueColumnId(event.target.value)} disabled={!sourceTableId}><option value="">Elegir columna...</option>{numberColumns.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}</select></label>}
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cómo filtrar<select className={`${INPUT} mt-1`} value={matchMode} onChange={(event) => { setMatchMode(event.target.value); setFilterField(''); }}><option value="all">Sumar todos los registros</option><option value="fixed">Valor fijo del origen</option><option value="column">Comparar con una columna de esta fila</option>{sourceType === 'custom' && <option value="row">Registros relacionados con esta fila</option>}</select></label>
      {matchMode !== 'all' && <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{matchMode === 'row' ? 'Relación desde la tabla de origen' : 'Campo de origen'}<select className={`${INPUT} mt-1`} value={effectiveFilterField} onChange={(event) => setFilterField(event.target.value)} disabled={sourceType === 'custom' && !sourceTableId}><option value="">Elegir campo...</option>{(matchMode === 'row' ? rowRelationColumns.map((column) => [String(column.id), column.name]) : filterChoices).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {matchMode === 'fixed' && <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Valor a buscar<input className={`${INPUT} mt-1`} value={filterValue} onChange={(event) => setFilterValue(event.target.value)} placeholder="Ej: expense, paid, Norte" required /></label>}
        {matchMode === 'column' && <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Comparar con<select className={`${INPUT} mt-1`} value={effectiveMatchColumnId} onChange={(event) => setMatchColumnId(event.target.value)}><option value="">Elegir columna...</option>{localChoices.map((column) => <option key={column.id} value={column.id}>{column.name}</option>)}</select></label>}
      </div>}
    </>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex gap-2"><button type="submit" className={PRIMARY} disabled={busy || !canSubmit}><Plus size={16} />Agregar columna</button><button type="button" className={SECONDARY} onClick={onCancel}>Cancelar</button></div>
  </form>;
}

function RowEditor({ table, initial, rowId, onSaved, onCancel }) {
  const [values, setValues] = useState(() => cleanValues(initial, table.columns));
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
      if (rowId) await api.patch(path, { values });
      else await api.post(path, { values });
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
  const rowActions = (row) => <div className="flex justify-end gap-2"><button type="button" aria-label="Editar fila" className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800" onClick={() => setEditingRow(row)}><Edit3 size={16} /></button><button type="button" aria-label="Eliminar fila" className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-slate-800" disabled={busy} onClick={() => deleteRow(row.id)}><Trash2 size={16} /></button></div>;

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
    {editingRow && <RowEditor key={`${tableId}-${editingRow.id || 'new'}`} table={table} initial={editingRow.values} rowId={editingRow.id} onSaved={async () => { await reload(); setEditingRow(null); }} onCancel={() => setEditingRow(null)} />}
  </section>;
};

export default CustomTable;
