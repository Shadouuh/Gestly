import React, { useEffect, useState } from 'react';
import { Camera, Loader2, Search, Upload } from 'lucide-react';
import api, { resolveAssetUrl } from '../../../services/api';

const buttonClass = 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700';
const errorMessage = (error) => error.response?.data?.message || 'No se pudo procesar la imagen. Intentá nuevamente.';

const ProductImagePicker = ({ name, value, onChange }) => {
  const [query, setQuery] = useState(name || '');
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { setQuery(name || ''); }, [name]);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setBusy('upload');
    try {
      const data = new FormData();
      data.append('image', file);
      const response = await api.post('/product-images/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(response.data.imageUrl);
      setResults([]);
      setMode('');
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(''); event.target.value = ''; }
  };

  const search = async () => {
    if (query.trim().length < 2) { setError('Escribí el nombre del producto para buscar imágenes.'); return; }
    setBusy('search');
    setError('');
    setResults([]);
    try {
      const { data } = await api.get('/product-images/search', { params: { q: query.trim() } });
      setResults(data.images || []);
      if (!data.images?.length) setError('No se encontraron imágenes para ese nombre. Probá otra búsqueda.');
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(''); }
  };

  const select = async (imageId) => {
    setBusy(imageId);
    setError('');
    try {
      const { data } = await api.post('/product-images/select', { imageId });
      onChange(data.imageUrl);
      setResults([]);
      setMode('');
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setBusy(''); }
  };

  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
    <p className="mb-2 text-[11px] font-bold text-slate-700 dark:text-slate-200">Imagen del producto <span className="font-normal text-slate-500">(opcional)</span></p>
    {value && <div className="mb-3 flex items-center gap-3"><img src={resolveAssetUrl(value)} alt={`Imagen de ${name || 'producto'}`} className="h-16 w-16 rounded-lg bg-white object-contain dark:bg-slate-800" /><button type="button" className="text-[11px] font-semibold text-red-600" onClick={() => onChange('')}>Quitar imagen</button></div>}
    <div className="flex flex-wrap gap-2">
      <label className={`${buttonClass} cursor-pointer`}><Upload size={14} />Subir imagen<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(busy)} onChange={upload} /></label>
      <button type="button" className={buttonClass} disabled={Boolean(busy)} onClick={() => { setMode(mode === 'search' ? '' : 'search'); setResults([]); setError(''); }}><Search size={14} />Buscar imagen</button>
      {busy && <Loader2 size={16} className="animate-spin text-blue-600" />}
    </div>
    {mode === 'search' && <div className="mt-3 space-y-2">
      <div className="flex gap-2"><input aria-label="Nombre para buscar imagen" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); search(); } }} placeholder="Nombre del producto" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button type="button" className={buttonClass} disabled={Boolean(busy)} onClick={search}>Buscar</button></div>
      {results.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{results.map((result) => <button key={result.id} type="button" disabled={Boolean(busy)} onClick={() => select(result.id)} className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left hover:border-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"><img src={result.thumbnail} alt={result.title} className="h-24 w-full object-contain" /><span className="block truncate px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200" title={result.title}>{result.title}</span><span className="block truncate px-2 pb-1 text-[9px] text-slate-500">{result.source || 'Google Imágenes'}</span></button>)}</div>}
      <p className="text-[10px] text-slate-500">Elegí una de las cuatro imágenes para guardarla en este servidor. Comprobá que tenés permiso para usarla.</p>
    </div>}
    {error && <p role="alert" className="mt-2 text-[11px] font-semibold text-red-600">{error}</p>}
    <details className="mt-2 text-[10px] text-slate-500"><summary className="cursor-pointer">¿Ya tenés una URL de imagen?</summary><div className="mt-2 flex items-center gap-2"><Camera size={13} /><input aria-label="URL externa de imagen" value={value?.startsWith('/uploads/products/') ? '' : value || ''} onChange={(event) => onChange(event.target.value)} placeholder="https://ejemplo.com/foto.jpg" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div></details>
  </div>;
};

export default ProductImagePicker;
