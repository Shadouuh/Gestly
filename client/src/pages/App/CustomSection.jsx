import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Edit3, Plus, Save, X } from 'lucide-react';
import api from '../../services/api';
import AppPageHeader from './components/AppPageHeader';
import CustomTable from './CustomTable';

const INPUT = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const PRIMARY = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50';
const SECONDARY = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800';
const getError = (error) => error.response?.data?.message || 'No se pudo guardar. Revisá la conexión.';

const CustomSection = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreating = !sectionId;
  const [node, setNode] = useState(null);
  const [loading, setLoading] = useState(!isCreating);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tableTitle, setTableTitle] = useState('');
  const [editingHeader, setEditingHeader] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);

  useEffect(() => {
    setEditingHeader(false);
    setShowTableForm(false);
    setError('');
    if (isCreating) {
      setNode(null);
      setTitle('');
      setSubtitle('');
      setTableTitle('');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.get(`/custom-nodes/${sectionId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setNode(data);
        setTitle(data.title);
        setSubtitle(data.subtitle || '');
      })
      .catch((requestError) => { if (!cancelled) setError(getError(requestError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sectionId, isCreating]);

  const selectedTableId = node?.tables.some((table) => String(table.id) === searchParams.get('tabla'))
    ? searchParams.get('tabla') : String(node?.tables[0]?.id || '');

  const createNode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/custom-nodes', { title, subtitle, tableTitle: tableTitle.trim() || 'Tabla principal' });
      navigate(`/app/secciones/${data.id}?tabla=${data.tables[0].id}`);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  const saveHeader = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.patch(`/custom-nodes/${sectionId}`, { title, subtitle });
      setNode((previous) => ({ ...previous, ...data }));
      setEditingHeader(false);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  const addTable = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/custom-nodes/${sectionId}/tables`, { title: tableTitle });
      setNode((previous) => ({ ...previous, tables: [...previous.tables, data] }));
      setSearchParams({ tabla: String(data.id) });
      setTableTitle('');
      setShowTableForm(false);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setBusy(false); }
  };

  if (isCreating) return <div className="p-4 md:p-6">
    <AppPageHeader title="Nueva sección" subtitle="Agrupá una o más tablas en un nodo del menú." />
    <form onSubmit={createNode} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Nombre de la sección<input className={`${INPUT} mt-2`} value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Logística" required /></label>
      <label className="mt-5 block text-sm font-bold text-slate-700 dark:text-slate-200">Subtítulo<input className={`${INPUT} mt-2`} value={subtitle} maxLength={255} onChange={(event) => setSubtitle(event.target.value)} placeholder="Ej: Contenedores, arribos y costos" /></label>
      <label className="mt-5 block text-sm font-bold text-slate-700 dark:text-slate-200">Primera tabla<input className={`${INPUT} mt-2`} value={tableTitle} maxLength={120} onChange={(event) => setTableTitle(event.target.value)} placeholder="Tabla principal" /></label>
      <p className="mt-3 text-xs text-slate-500">Después podrás agregar otras tablas y relacionarlas, incluso si están en otra sección.</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <button type="submit" className={`${PRIMARY} mt-5`} disabled={busy || !title.trim()}><Plus size={16} />Crear sección</button>
    </form>
  </div>;

  if (loading) return <div className="p-6 text-sm text-slate-500">Cargando sección...</div>;
  if (!node) return <div className="p-6 text-sm text-red-600" role="alert">{error || 'Sección no encontrada'}</div>;

  return <div className="p-4 md:p-6">
    {editingHeader ? <form onSubmit={saveHeader} className="mb-5 grid max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <input aria-label="Título de la sección" className={INPUT} value={title} maxLength={120} required onChange={(event) => setTitle(event.target.value)} />
      <input aria-label="Subtítulo de la sección" className={INPUT} value={subtitle} maxLength={255} onChange={(event) => setSubtitle(event.target.value)} />
      <div className="flex gap-2"><button type="submit" className={PRIMARY} disabled={busy}><Save size={16} />Guardar</button><button type="button" className={SECONDARY} onClick={() => setEditingHeader(false)}>Cancelar</button></div>
    </form> : <AppPageHeader title={node.title} subtitle={node.subtitle || 'Tablas de tu negocio'} actions={<button type="button" className={SECONDARY} onClick={() => setEditingHeader(true)}><Edit3 size={15} />Editar sección</button>} />}

    <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700" role="tablist" aria-label="Tablas de esta sección">
      {node.tables.map((table) => <button key={table.id} role="tab" type="button" aria-selected={String(table.id) === selectedTableId} className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${String(table.id) === selectedTableId ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`} onClick={() => setSearchParams({ tabla: String(table.id) })}>{table.title}</button>)}
      <button type="button" className={SECONDARY} onClick={() => setShowTableForm((previous) => !previous)}><Plus size={16} />Nueva tabla</button>
    </div>
    {showTableForm && <form onSubmit={addTable} className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"><input aria-label="Nombre de la nueva tabla" className={`${INPUT} min-w-[200px] flex-1`} value={tableTitle} maxLength={120} required onChange={(event) => setTableTitle(event.target.value)} placeholder="Ej: Gastos de importación" /><button type="submit" className={PRIMARY} disabled={busy || !tableTitle.trim()}>Crear tabla</button><button type="button" aria-label="Cancelar" className={SECONDARY} onClick={() => setShowTableForm(false)}><X size={16} /></button></form>}
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    {selectedTableId && <CustomTable key={selectedTableId} tableId={selectedTableId} />}
  </div>;
};

export default CustomSection;
