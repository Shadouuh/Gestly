import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileText, Loader2, Check, X, AlertTriangle, Package, Tag, ChevronDown, ChevronRight, Edit3, Save, Plus, Trash2, AlertCircle, Brain, Zap } from 'lucide-react';
import api from '../../services/api';
import { geminiAnalyze, getConfidenceColor, CATEGORY_COLORS } from '../services/geminiOcrService';

const computeWarnings = (products) => {
  return products.map(p => {
    const w = new Set(p._warnings || []);
    if (!p.salePrice || p.salePrice <= 0) w.add('Sin precio de venta');
    if (p.purchasePrice > p.salePrice) w.add('Precio de costo mayor que venta');
    if (!p.name || p.name.length < 2) w.add('Nombre muy corto');
    return { ...p, _warnings: [...w] };
  });
};

const ImportFromPhoto = ({ businessId, dbCategories, onClose }) => {
  const [step, setStep] = useState('upload');
  const [imagePreview, setImagePreview] = useState(null);
  const [progress, setProgress] = useState({ status: '', pct: 0 });
  const [detected, setDetected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [importDone, setImportDone] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [geminiResult, setGeminiResult] = useState(null);
  const [lastFile, setLastFile] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const warnings = useMemo(() => computeWarnings(detected), [detected]);
  const totalWarnings = warnings.reduce((s, p) => s + p._warnings.length, 0);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setImagePreview(URL.createObjectURL(file));
    setStep('processing');
    setProgress({ status: 'Conectando con Gemini AI...', pct: 5 });
    setDetected([]);
    setGeminiResult(null);
    setError(null);
    setLastFile(file);

    try {
      const startedAt = Date.now();
      setProgress({ status: 'Analizando imagen con IA...', pct: 20 });

      const result = await geminiAnalyze(file);

      setProgress({ status: 'Procesando resultados...', pct: 80 });
      setGeminiResult(result);

      const products = (result.products || []).map((p, i) => ({
        id: `gemini-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name: String(p.name || '').trim(),
        brand: p.brand ? String(p.brand).trim() : null,
        category: String(p.category || 'Otros').trim(),
        salePrice: Number(p.salePrice) || 0,
        purchasePrice: Number(p.purchasePrice) || 0,
        confidence: Math.min(1, Math.max(0, Number(p.confidence) || 0.5)),
        _warnings: Array.isArray(p.warnings) ? p.warnings : [],
        _brand: p.brand || null,
        _category: p.category || 'Otros',
        _confidence: Math.min(1, Math.max(0, Number(p.confidence) || 0.5)),
      }));

      const withWarnings = computeWarnings(products);
      setDetected(withWarnings);
      setProgress({
        status: `Gemini detectó ${products.length} producto${products.length !== 1 ? 's' : ''} en ${Math.round((Date.now() - startedAt) / 1000)}s`,
        pct: 100,
      });
      setStep('preview');
    } catch (err) {
      console.error('[Gemini OCR] Error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Error al analizar la imagen';
      setError(msg);
      setProgress({ status: msg, pct: 100 });
      setStep('error');
    }
  };

  const handleRetry = () => {
    if (lastFile) {
      handleFile(lastFile);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.isVariantGroup ? `group-${p.id}` : p.id);
    setEditForm({
      name: p.name, salePrice: String(p.salePrice), purchasePrice: String(p.purchasePrice),
      variants: p.variants?.map(v => ({ ...v, salePrice: String(v.salePrice), purchasePrice: String(v.purchasePrice) })) || [],
    });
  };

  const saveEdit = () => {
    setDetected(prev => prev.map(p => {
      if (editingId && p.isVariantGroup && editingId === `group-${p.id}`) {
        return { ...p, name: editForm.name, salePrice: parseFloat(editForm.salePrice) || 0, purchasePrice: parseFloat(editForm.purchasePrice) || 0, variants: editForm.variants };
      }
      if (p.id === editingId) {
        return { ...p, name: editForm.name, salePrice: parseFloat(editForm.salePrice) || 0, purchasePrice: parseFloat(editForm.purchasePrice) || 0 };
      }
      return p;
    }));
    setEditingId(null);
  };

  const removeProduct = (id) => {
    setDetected(prev => prev.filter(p => p.id !== id));
  };

  const findCategoryId = (categoryName) => {
    if (!categoryName || !dbCategories || dbCategories.length === 0) return null;
    const match = dbCategories.find(c => c.name && c.name.toLowerCase() === categoryName.toLowerCase());
    return match ? match.id : null;
  };

  const handleImport = async () => {
    setSaving(true);
    const results = { ok: 0, err: 0, details: [] };

    for (const p of warnings) {
      if (!p.name || !p.salePrice) {
        results.err++; results.details.push({ name: p.name || '?', status: 'error', msg: 'Falta nombre o precio' });
        continue;
      }
      try {
        const res = await api.post('/products', {
          business_id: businessId, name: p.name,
          sale_price: p.salePrice, purchase_price: p.purchasePrice || 0,
          category_id: findCategoryId(p._category),
        });
        const prod = res.data;
        results.ok++;

        if (p.isVariantGroup && p.variants?.length > 0) {
          let vok = 0;
          for (const v of p.variants) {
            try {
              await api.post('/variants', { product_id: prod.id, name: v.name, extra_price: (v.salePrice || p.salePrice) - p.salePrice });
              vok++;
            } catch (_) { results.err++; results.details.push({ name: `${p.name} / ${v.name}`, status: 'error', msg: 'Error al crear variante' }); }
          }
          results.details.push({ name: p.name, status: 'ok', msg: `Producto + ${vok} variantes` });
        } else {
          results.details.push({ name: p.name, status: 'ok', msg: 'Creado' });
        }
      } catch (err) {
        results.err++;
        results.details.push({ name: p.name, status: 'error', msg: err.response?.data?.message || err.message });
      }
    }

    setImportDone(results);
    setStep('done');
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Brain size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Importar desde foto
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">Gemini AI</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 'upload' && 'Subí una foto de tu lista de precios'}
                {step === 'processing' && progress.status}
                {step === 'error' && 'Ocurrió un error'}
                {step === 'preview' && `${detected.length} producto${detected.length !== 1 ? 's' : ''} · ${totalWarnings} advertencia${totalWarnings !== 1 ? 's' : ''}`}
                {step === 'done' && importDone && `${importDone.ok} importados, ${importDone.err} errores`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5">
          {/* Upload */}
          {step === 'upload' && (
            <div
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-5 sm:p-10 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                <Upload size={28} className="text-blue-500 dark:text-blue-400" />
              </div>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">Subí foto para analizar con IA</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Gemini detecta productos, marcas y precios automáticamente</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 size={36} className="animate-spin text-blue-500" />
              <div className="text-center w-full max-w-sm">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">{progress.status}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(2, progress.pct)}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{progress.pct}%</p>
              </div>
              {imagePreview && <img src={imagePreview} alt="" className="max-h-20 rounded-lg opacity-30" />}
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div className="text-center max-w-sm">
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No se pudo analizar</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{error || 'Error desconocido'}</p>
                {error?.includes('cuota') || error?.includes('quota') ? (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
                    Sin cuota disponible. Registrate en <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline">aistudio.google.com</a>
                  </p>
                ) : error?.includes('API key') || error?.includes('key') || error?.includes('api') ? (
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-2">
                    API key inválida. Agregá una key válida en <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">server/.env</code>
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button onClick={handleRetry}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                  Reintentar
                </button>
                <button onClick={() => { setStep('upload'); setError(null); setProgress({ status: '', pct: 0 }); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {step === 'preview' && (
            <div className="space-y-3">
              {/* Gemini Header */}
              {geminiResult && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50">
                  <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <Brain size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Gemini AI analizó la imagen</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">
                      {geminiResult.productCount} producto{geminiResult.productCount !== 1 ? 's' : ''} · Confianza {Math.round((geminiResult.avgConfidence || 0) * 100)}% · {geminiResult.durationMs}ms
                    </p>
                  </div>
                  <Zap size={16} className="text-blue-400 shrink-0" />
                </div>
              )}

              {/* Low Confidence Warning */}
              {geminiResult && geminiResult.avgConfidence < 0.6 && geminiResult.productCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Confianza baja detectada</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">Algunos productos pueden tener errores. Revisá antes de importar.</p>
                  </div>
                </div>
              )}

              {totalWarnings > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Revisá las advertencias antes de importar</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">Podés editar cada producto tocando el botón de editar</p>
                  </div>
                </div>
              )}

              {detected.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <AlertTriangle size={28} className="mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-sm">No se detectaron productos</p>
                  <p className="text-xs mt-1">Probá con una imagen más clara</p>
                </div>
              ) : (
                warnings.map((p) => {
                  const isEditing = editingId && (editingId === p.id || editingId === `group-${p.id}`);
                  const catStyle = p._category ? (CATEGORY_COLORS[p._category] || CATEGORY_COLORS['Almacén']) : null;
                  const confStyle = getConfidenceColor(p._confidence || 0.5);
                  const hasLowConfidence = (p._confidence || 0.5) < 0.6;

                  return (
                    <div key={p.id} className={`rounded-xl border overflow-hidden transition-colors ${
                      hasLowConfidence
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/15'
                        : p._warnings.length > 0
                          ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'
                    }`}>
                      {/* Warnings */}
                      {p._warnings.length > 0 && !isEditing && (
                        <div className="flex items-center gap-1.5 px-3 pt-2 pb-0 flex-wrap">
                          {p._warnings.map((w, wi) => (
                            <span key={wi} className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <AlertCircle size={9} />{w}
                            </span>
                          ))}
                        </div>
                      )}

                      {isEditing ? (
                        <div className="p-3 space-y-2">
                          <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500" />
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Precio venta</label>
                              <input value={editForm.salePrice} onChange={e => setEditForm(f => ({ ...f, salePrice: e.target.value }))}
                                className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Precio costo</label>
                              <input value={editForm.purchasePrice} onChange={e => setEditForm(f => ({ ...f, purchasePrice: e.target.value }))}
                                className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500" />
                            </div>
                          </div>
                          {p.isVariantGroup && editForm.variants && (
                            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-[9px] font-bold text-slate-400">Variantes</p>
                              {editForm.variants.map((v, vi) => (
                                <div key={vi} className="flex items-center gap-1.5">
                                  <input value={v.name} onChange={e => {
                                    const v2 = [...editForm.variants]; v2[vi] = { ...v2[vi], name: e.target.value }; setEditForm(f => ({ ...f, variants: v2 }));
                                  }} className="flex-1 px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white outline-none" placeholder="Nombre" />
                                  <input value={v.salePrice} onChange={e => {
                                    const v2 = [...editForm.variants]; v2[vi] = { ...v2[vi], salePrice: e.target.value }; setEditForm(f => ({ ...f, variants: v2 }));
                                  }} className="w-16 px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white outline-none text-right" placeholder="$" />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-1.5 pt-1">
                            <button onClick={saveEdit} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"><Save size={12} />Guardar</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {p.isVariantGroup ? (
                            <div>
                              <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5">
                                <button onClick={() => setExpandedGroup(expandedGroup === p.id ? null : p.id)} className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600">
                                  {expandedGroup === p.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                  <Package size={13} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                                  <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 flex-wrap">
                                    <p className="text-[8px] sm:text-[9px] text-blue-600 dark:text-blue-400 font-semibold">{p.variants.length} variantes</p>
                                    {p._brand && <span className="text-[7px] sm:text-[8px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{p._brand}</span>}
                                    {catStyle && <span className={`text-[7px] sm:text-[8px] font-semibold px-1.5 py-0.5 rounded ${catStyle.bg} ${catStyle.text}`}>{catStyle.icon} {p._category}</span>}
                                    {confStyle && <span className={`text-[7px] sm:text-[8px] font-semibold px-1.5 py-0.5 rounded ${confStyle.bg} ${confStyle.text}`}>{confStyle.label} {Math.round((p._confidence || 0) * 100)}%</span>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-slate-900 dark:text-white">${p.salePrice.toLocaleString()}</p>
                                  {p.purchasePrice > 0 && <p className="text-[8px] text-slate-400">Costo ${p.purchasePrice.toLocaleString()}</p>}
                                </div>
                                <button onClick={() => startEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit3 size={13} /></button>
                                <button onClick={() => removeProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={13} /></button>
                              </div>
                              {expandedGroup === p.id && (
                                <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2 space-y-1">
                                  {p.variants.map((v, vi) => (
                                    <div key={vi} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800">
                                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">• {v.name}</span>
                                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">${v.salePrice.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <Tag size={13} className="text-slate-500 dark:text-slate-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 flex-wrap">
                                  {p._brand && <span className="text-[7px] sm:text-[8px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{p._brand}</span>}
                                  {catStyle && <span className={`text-[7px] sm:text-[8px] font-semibold px-1.5 py-0.5 rounded ${catStyle.bg} ${catStyle.text}`}>{catStyle.icon} {p._category}</span>}
                                  {confStyle && <span className={`text-[7px] sm:text-[8px] font-semibold px-1.5 py-0.5 rounded ${confStyle.bg} ${confStyle.text}`}>{confStyle.label} {Math.round((p._confidence || 0) * 100)}%</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-slate-900 dark:text-white">${p.salePrice.toLocaleString()}</p>
                                {p.purchasePrice > 0 && <p className="text-[8px] text-slate-400">Costo ${p.purchasePrice.toLocaleString()}</p>}
                              </div>
                              <button onClick={() => startEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit3 size={13} /></button>
                              <button onClick={() => removeProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={13} /></button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Done */}
          {step === 'done' && importDone && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              {importDone.err === 0 ? (
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Check size={32} className="text-emerald-600 dark:text-emerald-400" /></div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><AlertTriangle size={32} className="text-amber-600 dark:text-amber-400" /></div>
              )}
              <div className="text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white">{importDone.ok} producto{importDone.ok !== 1 ? 's' : ''} importado{importDone.ok !== 1 ? 's' : ''}</p>
                {importDone.err > 0 && <p className="text-sm text-red-500 mt-1">{importDone.err} error{importDone.err !== 1 ? 'es' : ''}</p>}
              </div>
              {importDone.details.length > 0 && (
                <details className="w-full max-w-sm">
                  <summary className="text-[11px] font-bold text-slate-400 cursor-pointer hover:text-slate-600 text-center">Ver detalle</summary>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {importDone.details.map((d, i) => (
                      <div key={i} className={`text-[10px] px-3 py-1 rounded-lg flex items-center gap-2 ${d.status === 'ok' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                        {d.status === 'ok' ? <Check size={10} /> : <X size={10} />}
                        <span className="font-medium truncate">{d.name}</span>
                        <span className="opacity-60 ml-auto shrink-0">{d.msg}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-3 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {step === 'upload' && (
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
          )}
          {step === 'processing' && (
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
          )}
          {step === 'error' && (
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Cerrar</button>
          )}
          {step === 'preview' && detected.length > 0 && (
            <>
              <button onClick={() => { setStep('upload'); setDetected([]); setGeminiResult(null); setImagePreview(null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Volver</button>
              <button onClick={handleImport} disabled={saving || detected.length === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {saving ? 'Importando...' : `Importar ${detected.length} producto${detected.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}
          {step === 'preview' && detected.length === 0 && (
            <button onClick={() => { setStep('upload'); setDetected([]); setGeminiResult(null); setImagePreview(null); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Volver a subir</button>
          )}
          {step === 'done' && (
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100">Listo</button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImportFromPhoto;
