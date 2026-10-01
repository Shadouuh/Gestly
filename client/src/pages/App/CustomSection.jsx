import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Plus, Search, Save, Table2, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import AppPageHeader from './components/AppPageHeader';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'boolean', label: 'Sí / No' },
];

const getError = (error) => error.response?.data?.message || 'No se pudo guardar. Revisá la conexión e intentá nuevamente.';
const emptyValues = (columns) => Object.fromEntries(columns.map((column) => [String(column.id), '']));
const showValue = (value, type) => {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
};

const CustomSection = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const isCreating = !sectionId;
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(!isCreating);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [editingHeader, setEditingHeader] = useState(false);
  const [search, setSearch] = useState('');
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');
  const [rowId, setRowId] = useState(null);
  const [rowValues, setRowValues] = useState(null);

  useEffect(() => {
    setRowValues(null);
    setRowId(null);
    setShowColumnForm(false);
    setEditingHeader(false);
    setSearch('');
    if (isCreating) {
      setSection(null);
      setTitle('');
      setSubtitle('');
      setLoading(false);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get(`/custom-sections/${sectionId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setSection(data);
        setTitle(data.title);
        setSubtitle(data.subtitle || '');
      })
      .catch((requestError) => { if (!cancelled) setError(getError(requestError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sectionId, isCreating]);

  const filteredRows = useMemo(() => {
    if (!section) return [];
    const query = search.trim().toLocaleLowerCase();
    if (!query) return section.rows;
    return section.rows.filter((row) => section.columns.some((column) =>
      showValue(row.values?.[String(column.id)], column.dataType).toLocaleLowerCase().includes(query)
    ));
  }, [section, search]);

  const createSection = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/custom-sections', { title, subtitle });
      navigate(`/app/secciones/${data.id}`);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  const saveHeader = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.patch(`/custom-sections/${sectionId}`, { title, subtitle });
      setSection((previous) => ({ ...previous, ...data }));
      setEditingHeader(false);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  const addColumn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/custom-sections/${sectionId}/columns`, { name: columnName, dataType: columnType });
      setSection((previous) => ({ ...previous, columns: [...previous.columns, data] }));
      setColumnName('');
      setColumnType('text');
      setShowColumnForm(false);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  const saveRow = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const url = `/custom-sections/${sectionId}/rows${rowId ? `/${rowId}` : ''}`;
      const { data } = rowId ? await api.patch(url, { values: rowValues }) : await api.post(url, { values: rowValues });
      setSection((previous) => ({
        ...previous,
        rows: rowId ? previous.rows.map((row) => row.id === rowId ? { ...row, ...data } : row) : [data, ...previous.rows],
      }));
      setRowValues(null);
      setRowId(null);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  const deleteRow = async (id) => {
    if (!window.confirm('¿Eliminar esta fila?')) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/custom-sections/${sectionId}/rows/${id}`);
      setSection((previous) => ({ ...previous, rows: previous.rows.filter((row) => row.id !== id) }));
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
  const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50';
  const secondaryClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800';

  if (isCreating) return (
    <div className="p-4 md:p-6">
      <AppPageHeader title="Nueva sección" subtitle="Creá un espacio propio para organizar los datos de tu negocio." />
      <form onSubmit={createSection} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="section-title">Título del menú</label>
        <input id="section-title" className={`${inputClass} mt-2`} value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Contenedores, Maderas, Herramientas" required />
        <label className="mt-5 block text-sm font-bold text-slate-700 dark:text-slate-200" htmlFor="section-subtitle">Subtítulo</label>
        <input id="section-subtitle" className={`${inputClass} mt-2`} value={subtitle} maxLength={255} onChange={(event) => setSubtitle(event.target.value)} placeholder="Ej: Seguimiento de cargas y entregas" />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Después vas a definir las columnas y cargar las filas de la tabla.</p>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <button type="submit" className={`${buttonClass} mt-5`} disabled={busy || !title.trim()}><Plus size={16} />Crear sección</button>
      </form>
    </div>
  );

  if (loading) return <div className="p-6 text-sm text-slate-500">Cargando sección...</div>;
  if (!section) return <div className="p-6 text-sm text-red-600" role="alert">{error || 'Sección no encontrada'}</div>;

  return (
    <div className="p-4 md:p-6">
      {editingHeader ? (
        <form onSubmit={saveHeader} className="mb-5 grid max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <input aria-label="Título de la sección" className={inputClass} value={title} maxLength={120} required onChange={(event) => setTitle(event.target.value)} />
          <input aria-label="Subtítulo de la sección" className={inputClass} value={subtitle} maxLength={255} onChange={(event) => setSubtitle(event.target.value)} />
          <div className="flex gap-2"><button type="submit" className={buttonClass} disabled={busy}><Save size={16} />Guardar</button><button type="button" className={secondaryClass} onClick={() => setEditingHeader(false)}>Cancelar</button></div>
        </form>
      ) : (
        <AppPageHeader title={section.title} subtitle={section.subtitle || 'Tu tabla personalizada'} actions={
          <button type="button" className={secondaryClass} onClick={() => setEditingHeader(true)}><Edit3 size={15} />Editar título</button>
        } />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input aria-label="Buscar en la tabla" className={`${inputClass} pl-10`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en esta tabla..." />
        </div>
        <button type="button" className={secondaryClass} onClick={() => setShowColumnForm((previous) => !previous)}><Plus size={16} />Columna</button>
        <button type="button" className={buttonClass} disabled={section.columns.length === 0} onClick={() => { setRowId(null); setRowValues(emptyValues(section.columns)); }}><Plus size={16} />Insertar dato</button>
      </div>

      {showColumnForm && <form onSubmit={addColumn} className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <input aria-label="Nombre de columna" className={`${inputClass} min-w-[180px] flex-1`} value={columnName} maxLength={80} required onChange={(event) => setColumnName(event.target.value)} placeholder="Nombre de la columna" />
        <select aria-label="Tipo de columna" className={`${inputClass} max-w-40`} value={columnType} onChange={(event) => setColumnType(event.target.value)}>{FIELD_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
        <button type="submit" className={buttonClass} disabled={busy || !columnName.trim()}>Agregar</button>
      </form>}

      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {section.columns.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center"><Table2 size={32} className="text-indigo-500" /><h2 className="text-base font-bold text-slate-900 dark:text-white">Tu tabla está lista para diseñar</h2><p className="text-sm text-slate-500">Agregá una columna para empezar. Por ejemplo: Nombre, Cantidad o Fecha.</p><button type="button" className={buttonClass} onClick={() => setShowColumnForm(true)}><Plus size={16} />Agregar primera columna</button></div>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"><tr>{section.columns.map((column) => <th key={column.id} scope="col" className="whitespace-nowrap px-4 py-3 font-bold">{column.name}</th>)}<th scope="col" className="px-4 py-3 text-right font-bold">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredRows.map((row) => <tr key={row.id} className="text-slate-700 dark:text-slate-200">{section.columns.map((column) => <td key={column.id} className="max-w-[280px] truncate px-4 py-3">{showValue(row.values?.[String(column.id)], column.dataType)}</td>)}<td className="whitespace-nowrap px-4 py-3 text-right"><button type="button" aria-label="Editar fila" className="mr-2 text-indigo-600" onClick={() => { setRowId(row.id); setRowValues({ ...emptyValues(section.columns), ...row.values }); }}><Edit3 size={16} /></button><button type="button" aria-label="Eliminar fila" className="text-red-500 disabled:opacity-50" disabled={busy} onClick={() => deleteRow(row.id)}><Trash2 size={16} /></button></td></tr>)}</tbody>
          </table>{filteredRows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">{search ? 'No hay resultados para esta búsqueda.' : 'Todavía no hay filas. Usá “Insertar dato” para cargar la primera.'}</p>}</div>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-500">{section.rows.length} fila{section.rows.length === 1 ? '' : 's'} · {section.columns.length} columna{section.columns.length === 1 ? '' : 's'}</p>

      {rowValues !== null && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setRowValues(null); }}>
        <form onSubmit={saveRow} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900 dark:text-white">{rowId ? 'Editar fila' : 'Insertar dato'}</h2><button type="button" aria-label="Cerrar" onClick={() => setRowValues(null)}><X size={18} className="text-slate-500" /></button></div>
          <div className="space-y-3">{section.columns.map((column) => <label key={column.id} className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{column.name}
            {column.dataType === 'boolean' ? <select className={`${inputClass} mt-1`} value={rowValues[String(column.id)] === true ? 'true' : rowValues[String(column.id)] === false ? 'false' : ''} onChange={(event) => setRowValues((previous) => ({ ...previous, [column.id]: event.target.value === '' ? null : event.target.value === 'true' }))}><option value="">Sin dato</option><option value="true">Sí</option><option value="false">No</option></select>
              : <input className={`${inputClass} mt-1`} type={column.dataType === 'number' ? 'number' : column.dataType === 'date' ? 'date' : 'text'} step={column.dataType === 'number' ? 'any' : undefined} value={rowValues[String(column.id)] ?? ''} onChange={(event) => setRowValues((previous) => ({ ...previous, [column.id]: event.target.value }))} />}
          </label>)}</div>
          <div className="mt-5 flex justify-end gap-2"><button type="button" className={secondaryClass} onClick={() => setRowValues(null)}>Cancelar</button><button type="submit" className={buttonClass} disabled={busy}><Save size={16} />Guardar fila</button></div>
        </form>
      </div>}
    </div>
  );
};

export default CustomSection;
