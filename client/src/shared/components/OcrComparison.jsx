import React, { useState, useCallback, useMemo } from 'react';
import { Loader2, Check, X, AlertTriangle, RefreshCw, FileText, Sparkles, ChevronDown, ChevronUp, ArrowRight, Wand2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { smartFormat, smartFormatText, findKnownProduct } from '../services/SmartFormatter';

const PSM_ENGINES = [
  { id: 'psm3', label: 'PSM 3 (Auto)', psm: '3', icon: FileText, color: 'blue' },
  { id: 'psm4', label: 'PSM 4 (Columna)', psm: '4', icon: FileText, color: 'emerald' },
  { id: 'psm6', label: 'PSM 6 (Bloque)', psm: '6', icon: FileText, color: 'violet' },
  { id: 'psm11', label: 'PSM 11 (Sparse)', psm: '11', icon: FileText, color: 'amber' },
  { id: 'psm12', label: 'PSM 12 (Sparse+OSD)', psm: '12', icon: FileText, color: 'rose' },
];

const ResultCard = ({ engine, text, loading, error, selected, onUse }) => {
  const color = PSM_ENGINES.find(e => e.id === engine)?.color || 'slate';
  const Icon = PSM_ENGINES.find(e => e.id === engine)?.icon || FileText;
  const lines = text ? text.split('\n').filter(Boolean) : [];

  const colorClasses = {
    blue: 'ring-2 ring-blue-300 dark:ring-blue-700 border-blue-400',
    emerald: 'ring-2 ring-emerald-300 dark:ring-emerald-700 border-emerald-400',
    violet: 'ring-2 ring-violet-300 dark:ring-violet-700 border-violet-400',
    amber: 'ring-2 ring-amber-300 dark:ring-amber-700 border-amber-400',
    rose: 'ring-2 ring-rose-300 dark:ring-rose-700 border-rose-400',
  };

  const bgClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/10',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10',
    violet: 'bg-violet-50 dark:bg-violet-900/10',
    amber: 'bg-amber-50 dark:bg-amber-900/10',
    rose: 'bg-rose-50 dark:bg-rose-900/10',
  };

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all ${selected ? colorClasses[color] || 'ring-2 ring-slate-300 border-slate-400' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className={`flex items-center justify-between px-3 py-2 ${bgClasses[color] || 'bg-slate-50'} border-b border-slate-200 dark:border-slate-700`}>
        <div className="flex items-center gap-1.5">
          <Icon size={13} className={`text-${color}-600 dark:text-${color}-400`} />
          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{PSM_ENGINES.find(e => e.id === engine)?.label}</span>
          {!loading && !error && <span className="text-[8px] text-slate-400 ml-1">{lines.length} líneas</span>}
        </div>
        {!loading && !error && text && (
          <button onClick={() => onUse(text, engine)} className={`px-2 py-0.5 rounded text-[8px] font-bold ${selected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600'} hover:opacity-80`}>
            {selected ? 'En uso' : 'Usar'}
          </button>
        )}
      </div>
      <div className="p-2.5 max-h-48 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-6 gap-2">
            <Loader2 size={14} className="animate-spin text-slate-400" />
            <span className="text-[9px] text-slate-400">Reconociendo...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-1.5 py-2">
            <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
            <span className="text-[9px] text-amber-700 dark:text-amber-400">{error}</span>
          </div>
        ) : text ? (
          <pre className="text-[9px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">{text}</pre>
        ) : (
          <p className="text-[9px] text-slate-400 text-center py-4">Sin resultado</p>
        )}
      </div>
    </div>
  );
};

const SmartFormatPanel = ({ text, onUse }) => {
  const formatted = useMemo(() => text ? smartFormatText(text) : [], [text]);
  const avgConfidence = formatted.length > 0
    ? formatted.reduce((s, l) => s + l.confidence, 0) / formatted.length
    : 0;

  if (!text) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Smart Format</span>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${avgConfidence > 0.7 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700'}`}>
            {Math.round(avgConfidence * 100)}% confianza
          </span>
        </div>
        <button onClick={() => onUse(formatted.map(l => l.corrected).join('\n'), 'smart')}
          className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1">
          <Wand2 size={11} />Usar corregido
        </button>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
        {formatted.map((line, i) => (
          <div key={i} className={`px-2.5 py-1.5 rounded-lg text-[10px] ${line.changes.length > 0 ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {line.changes.length > 0 ? (
                  <>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 line-through decoration-1">{line.original}</p>
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                      <ArrowRight size={9} className="text-emerald-500 shrink-0" />
                      {line.corrected}
                      {line.matchedProduct && <span className="text-[7px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded">diccionario</span>}
                    </p>
                    {line.changes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {line.changes.map((c, ci) => (
                          <span key={ci} className="text-[7px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[10px] text-slate-700 dark:text-slate-300">{line.original}</p>
                )}
              </div>
              <div className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${line.confidence > 0.7 ? 'bg-emerald-400' : line.confidence > 0.4 ? 'bg-amber-400' : 'bg-red-400'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RawParsedPanel = ({ text, onUse }) => {
  const lines = text ? text.split('\n').filter(Boolean) : [];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">OCR crudo · {lines.length} líneas</span>
        <button onClick={() => onUse(text, 'raw')}
          className="px-2 py-0.5 rounded text-[8px] font-bold text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
          Usar crudo
        </button>
      </div>
      <pre className="text-[9px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">{text}</pre>
    </div>
  );
};

const OcrComparison = ({ file, onComplete, onClose }) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [engineStatus, setEngineStatus] = useState('idle');
  const [viewTab, setViewTab] = useState('grid');
  const [activeText, setActiveText] = useState(null);
  const [activeSource, setActiveSource] = useState(null);

  const isAllDone = Object.values(loading).every(v => !v) && Object.values(results).some(v => v !== null);

  const preprocessImage = (file, maxW = 1800) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h *= maxW / w; w = maxW; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      c.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });

  const runEngine = useCallback(async (engineId) => {
    const engine = PSM_ENGINES.find(e => e.id === engineId);
    if (!engine) return;

    setLoading(prev => ({ ...prev, [engineId]: true }));
    setErrors(prev => ({ ...prev, [engineId]: null }));

    try {
      const small = await preprocessImage(file, 1800, 0.85);
      const { data } = await Tesseract.recognize(small, 'spa', {
        tessedit_pageseg_mode: engine.psm,
      });
      setResults(prev => ({ ...prev, [engineId]: data.text }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [engineId]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [engineId]: false }));
    }
  }, [file]);

  const runAll = useCallback(async () => {
    setEngineStatus('running');
    setViewTab('grid');
    setActiveText(null);
    setResults({});
    setErrors({});

    // Mostrar 5 modos PSM en paralelo
    const allEngines = PSM_ENGINES.map(e => e.id);
    console.log('%c═══════════════════════════════════════════════', 'color: #888');
    console.log('%c  OCR COMPARISON · 5 MODOS PSM TESSERACT.JS   ', 'color: #fff; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════════════', 'color: #888');

    await Promise.allSettled(allEngines.map(id => runEngine(id)));

    // Log resultados
    for (const engine of PSM_ENGINES) {
      const text = results[engine.id] || errors[engine.id] ? '(error)' : '';
      console.log(`%c┌─ ${engine.label}`, `color: #3b82f6; font-weight: bold`);
      if (errors[engine.id]) {
        console.log(`%c  ⚠ ${errors[engine.id]}`, 'color: #ef4444');
      } else if (text) {
        console.log(text);
      }
      console.log('');
    }

    setEngineStatus('done');
  }, [runEngine, results, errors]);

  const handleUseText = (text, source) => {
    setActiveText(text);
    setActiveSource(source);
    setViewTab('detail');
  };

  const handleConfirm = () => {
    if (activeText) onComplete(activeText);
  };

  return (
    <div className="space-y-3">
      {/* Header actions */}
      {engineStatus === 'idle' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap justify-center">
            {PSM_ENGINES.map(e => (
              <span key={e.id} className="flex items-center gap-1">
                <FileText size={12} className={`text-${e.color}-500`} />
                {e.label}
              </span>
            ))}
          </div>
          <button onClick={runAll}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <RefreshCw size={14} />
            Iniciar comparación (5 PSM)
          </button>
          <p className="text-[9px] text-slate-400 text-center max-w-xs">5 modos de segmentación Tesseract.js en paralelo. Sin backend Python.</p>
        </div>
      )}

      {/* Running state */}
      {engineStatus === 'running' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PSM_ENGINES.map(engine => (
            <div key={engine.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                <Loader2 size={11} className="animate-spin text-slate-400" />
                <span className="text-[9px] font-bold text-slate-500">{engine.label}</span>
              </div>
              <div className="p-3 flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {engineStatus === 'done' && viewTab === 'grid' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {PSM_ENGINES.map(engine => (
              <ResultCard
                key={engine.id}
                engine={engine.id}
                text={results[engine.id] || ''}
                loading={loading[engine.id]}
                error={errors[engine.id]}
                selected={false}
                onUse={handleUseText}
              />
            ))}
          </div>

          {/* Bottom actions */}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => {
              const bestText = Object.values(results).filter(Boolean).sort((a, b) => b.split('\n').filter(Boolean).length - a.split('\n').filter(Boolean).length)[0];
              if (bestText) { setActiveText(bestText); setActiveSource('best'); setViewTab('detail'); }
            }}
              className="flex-1 px-3 py-2 rounded-xl text-[10px] font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5">
              <Sparkles size={12} />
              Revisar y formatear
            </button>
            <button onClick={runAll} className="px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
              <RefreshCw size={11} />Re-ejecutar
            </button>
          </div>
        </div>
      )}

      {/* Detail view: raw + smart format */}
      {viewTab === 'detail' && activeText && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewTab('grid')}
              className="px-2 py-1 rounded text-[9px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1">
              ← Volver
            </button>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {activeSource === 'smart' ? 'Smart Format' : activeSource === 'raw' ? 'OCR Crudo' : PSM_ENGINES.find(e => e.id === activeSource)?.label || 'OCR'}
            </span>
            {activeSource !== 'smart' && (
              <span className="text-[8px] text-slate-400">· {activeText.split('\n').filter(Boolean).length} líneas</span>
            )}
          </div>

          {/* Raw text */}
          {activeSource !== 'smart' && activeSource !== 'raw' && (
            <RawParsedPanel text={activeText} onUse={(t, s) => handleUseText(t, s)} />
          )}

          {/* Smart format */}
          <SmartFormatPanel text={activeText} onUse={(t, s) => handleUseText(t, s)} />

          {/* Confirm */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button onClick={handleConfirm}
              className="flex-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
              <Check size={14} />
              Confirmar y seguir
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrComparison;
