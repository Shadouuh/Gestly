import React from 'react';
import { Database, Server, HardDrive, HelpCircle, Monitor } from 'lucide-react';

const STATUSES = {
  db: { label: 'Base de datos', icon: Database, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' },
  json: { label: 'JSON Server (legacy)', icon: Server, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400', dot: 'bg-amber-500' },
  hardcoded: { label: 'Hardcoded', icon: HardDrive, color: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400', dot: 'bg-red-500' },
  unknown: { label: 'No determinado', icon: HelpCircle, color: 'text-slate-600 bg-slate-50 dark:bg-slate-500/10 dark:text-slate-400', dot: 'bg-slate-400' },
  static: { label: 'Frontend estático', icon: Monitor, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400', dot: 'bg-blue-500' },
};

const SECTION_STATUS = {
  '/admin': 'db',
  '/admin/users': 'db',
  '/admin/businesses': 'db',
  '/admin/accounting': 'hardcoded',
  '/admin/affiliates': 'hardcoded',
  '/admin/settings': 'static',
  '/': 'static',
  '/login': 'db',
  '/app/pos': 'db',
  '/app/ventas': 'db',
  '/app/catalogo': 'db',
  '/app/clientes': 'db',
  '/app/empleados': 'hardcoded',
  '/app/sucursales': 'db',
  '/app/compras': 'hardcoded',
  '/app/guia': 'static',
  '/app/configuracion': 'static',
  '/onboarding': 'db',
  '/pricing': 'static',
  '/what-is-gestly': 'static',
  '/for-who': 'static',
  '/about': 'static',
  '/contact': 'static',
  '/guide': 'static',
};

export const getSectionStatus = (pathname) => {
  const match = Object.keys(SECTION_STATUS).sort((a, b) => b.length - a.length).find(p => pathname.startsWith(p));
  return STATUSES[SECTION_STATUS[match] || 'unknown'];
};

export const DataStatusBadge = ({ pathname }) => {
  const status = getSectionStatus(pathname);
  const Icon = status.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.color} border border-current/20`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} shrink-0`} />
      <Icon size={10} className="shrink-0" />
      {status.label}
    </div>
  );
};

export const DataStatusPanel = ({ pathname, className = '' }) => {
  const status = getSectionStatus(pathname);
  const Icon = status.icon;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${status.color} ${className}`}>
      <Icon size={12} className="shrink-0" />
      <div className="flex items-center gap-1.5 text-[10px] font-semibold">
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </div>
    </div>
  );
};
