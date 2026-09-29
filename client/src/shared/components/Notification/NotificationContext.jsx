import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext(null);

let toastIdCounter = 0;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const notify = { success: (m, d) => addToast(m, 'success', d), error: (m, d) => addToast(m, 'error', d), warning: (m, d) => addToast(m, 'warning', d), info: (m, d) => addToast(m, 'info', d) };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

const TYPE_STYLES = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/40', border: 'border-emerald-200 dark:border-emerald-700', icon: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  error: { bg: 'bg-red-50 dark:bg-red-900/40', border: 'border-red-200 dark:border-red-700', icon: 'text-red-600 dark:text-red-400', bar: 'bg-red-500', text: 'text-red-700 dark:text-red-300' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-700', icon: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  info: { bg: 'bg-blue-50 dark:bg-blue-900/40', border: 'border-blue-200 dark:border-blue-700', icon: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
};

const ICONS = {
  success: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  error: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" /></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9v4M12 17h.01" strokeLinecap="round" /></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" /></svg>,
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto ${style.bg} ${style.border} border rounded-2xl shadow-xl shadow-slate-900/10 backdrop-blur-sm overflow-hidden`}
            style={{ animation: 'toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="flex items-start gap-3 p-4">
              <div className={`shrink-0 mt-0.5 ${style.icon}`}>{ICONS[toast.type] || ICONS.info}</div>
              <p className={`text-sm font-semibold leading-snug flex-1 ${style.text}`}>{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className={`shrink-0 p-0.5 rounded-lg transition-colors opacity-60 hover:opacity-100 ${style.icon}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className={`h-1 w-full ${style.bar}`} style={{ animation: 'progressShrink 3.8s linear forwards' }} />
          </div>
        );
      })}
      <style>{`@keyframes toastIn{from{transform:translateX(120%) scale(0.9);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}@keyframes progressShrink{from{width:100%}to{width:0%}}`}</style>
    </div>
  );
};
