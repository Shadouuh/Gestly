import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  Search,
  ArrowRight,
  Store,
  Crown,
  CreditCard,
  PieChart,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { BUSINESSES, INVOICES, formatMoney, formatDate, getSubscriptionStats } from './data/adminMockData';

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <div className={`animate-fadeIn ${className}`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
    {children}
  </div>
);

const stats = getSubscriptionStats();

const MONTHLY_REVENUE = [
  { month: 'Ene', ingreso: 520000, comisiones: 82000 },
  { month: 'Feb', ingreso: 548000, comisiones: 86000 },
  { month: 'Mar', ingreso: 573000, comisiones: 89000 },
  { month: 'Abr', ingreso: 601000, comisiones: 93000 },
  { month: 'May', ingreso: 628000, comisiones: 96000 },
  { month: 'Jun', ingreso: 655000, comisiones: 101000 },
];

const AdminAccounting = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchInvoice, setSearchInvoice] = useState('');

  const filteredInvoices = INVOICES.filter(inv =>
    inv.businessName.toLowerCase().includes(searchInvoice.toLowerCase()) || inv.id.toLowerCase().includes(searchInvoice.toLowerCase())
  );

  const tabClasses = (id) =>
    `px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`;

  return (
    <div className="p-4 md:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white">Contabilidad</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ingresos, subscripciones y facturación</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button onClick={() => setActiveTab('overview')} className={tabClasses('overview')}>Resumen</button>
          <button onClick={() => setActiveTab('invoices')} className={tabClasses('invoices')}>Facturas</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {activeTab === 'overview' ? (
          <>
            <FadeIn delay={0}>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { label: 'MRR', value: formatMoney(stats.mrr), sub: 'Ingreso mensual recurrente', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Ingreso Anual', value: formatMoney(stats.totalBilled), sub: 'Proyectado', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Essential', value: `${stats.essential} · ${formatMoney(stats.essentialMrr)}`, sub: `${stats.essentialMrr > 0 ? Math.round(stats.essentialMrr / stats.mrr * 100) : 0}% del MRR`, icon: Crown, color: 'text-slate-600 bg-slate-100' },
                  { label: 'Pro', value: `${stats.pro} · ${formatMoney(stats.proMrr)}`, sub: `${stats.proMrr > 0 ? Math.round(stats.proMrr / stats.mrr * 100) : 0}% del MRR`, icon: Crown, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Mensuales', value: stats.monthly, sub: `${Math.round(stats.monthly / (stats.monthly + stats.annual) * 100)}% de los activos`, icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
                  { label: 'Anuales', value: stats.annual, sub: `${Math.round(stats.annual / (stats.monthly + stats.annual) * 100)}% de los activos`, icon: Calendar, color: 'text-violet-600 bg-violet-50' },
                ].map((s, i) => (
                  <div key={s.label} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`p-1.5 rounded-md ${s.color}`}><s.icon size={13} /></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                    </div>
                    <p className="text-sm font-display font-bold text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-all">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><TrendingUp size={14} className="text-indigo-500" /> Ingresos Mensuales</h3>
                  <div className="flex items-end gap-2 h-28">
                    {MONTHLY_REVENUE.map((m, i) => {
                      const h = (m.ingreso / 700000) * 100;
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[8px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">${(m.ingreso / 1000).toFixed(0)}k</span>
                          <div className="w-full bg-indigo-100 dark:bg-indigo-900/50 rounded-t relative overflow-hidden" style={{ height: `${h}%` }}>
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300 rounded-t animate-barGrow" style={{ height: `${((m.ingreso - m.comisiones) / m.ingreso) * 100}%`, animationDelay: `${i * 100}ms` }} />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-500" /> Ingreso bruto</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-300" /> Neto (sin comisiones)</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-all">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><PieChart size={14} className="text-indigo-500" /> Distribución de Planes</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Pro', count: stats.pro, pct: Math.round(stats.pro / (stats.essential + stats.pro) * 100), color: 'bg-amber-500' },
                      { label: 'Essential', count: stats.essential, pct: Math.round(stats.essential / (stats.essential + stats.pro) * 100), color: 'bg-slate-400' },
                    ].map((p, i) => (
                      <div key={p.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{p.label}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.count} negocios ({p.pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.color} animate-slideIn`} style={{ animationDelay: `${i * 200}ms` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2 text-center hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Mensual</p>
                      <p className="font-bold text-slate-900 dark:text-white">{stats.monthly}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2 text-center hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Anual</p>
                      <p className="font-bold text-slate-900 dark:text-white">{stats.annual}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-all">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Store size={14} className="text-indigo-500" /> Negocios por Estado</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Activos', count: stats.paying, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                      { label: 'Prueba', count: stats.active - stats.paying, color: 'bg-blue-500', textColor: 'text-blue-600' },
                      { label: 'Vencidos', count: BUSINESSES.filter(b => b.status === 'expired').length, color: 'bg-red-500', textColor: 'text-red-600' },
                      { label: 'Cancelados', count: BUSINESSES.filter(b => b.status === 'cancelled').length, color: 'bg-slate-300', textColor: 'text-slate-500' },
                    ].map((s, i) => (
                      <div key={s.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors animate-fadeIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <div className={`w-2 h-2 rounded-full ${s.color} ${s.label === 'Activos' ? 'animate-pulse' : ''}`} /> {s.label}
                        </span>
                        <span className={`text-xs font-bold ${s.textColor}`}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-all">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><CreditCard size={14} className="text-indigo-500" /> Ingresos por Tipo de Subscripción</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Pro Mensual', count: BUSINESSES.filter(b => b.plan === 'pro' && b.frequency === 'monthly' && b.status === 'active').length, mrr: BUSINESSES.filter(b => b.plan === 'pro' && b.frequency === 'monthly' && b.status === 'active').reduce((s, b) => s + b.monthlyAmount, 0), color: 'text-amber-600' },
                      { label: 'Pro Anual', count: BUSINESSES.filter(b => b.plan === 'pro' && b.frequency === 'annual' && b.status === 'active').length, mrr: BUSINESSES.filter(b => b.plan === 'pro' && b.frequency === 'annual' && b.status === 'active').reduce((s, b) => s + b.monthlyAmount, 0), color: 'text-amber-700' },
                      { label: 'Essential Mensual', count: BUSINESSES.filter(b => b.plan === 'essential' && b.frequency === 'monthly' && b.status === 'active').length, mrr: BUSINESSES.filter(b => b.plan === 'essential' && b.frequency === 'monthly' && b.status === 'active').reduce((s, b) => s + b.monthlyAmount, 0), color: 'text-slate-600' },
                      { label: 'Essential Anual', count: BUSINESSES.filter(b => b.plan === 'essential' && b.frequency === 'annual' && b.status === 'active').length, mrr: BUSINESSES.filter(b => b.plan === 'essential' && b.frequency === 'annual' && b.status === 'active').reduce((s, b) => s + b.monthlyAmount, 0), color: 'text-slate-500' },
                    ].map((s, i) => (
                      <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all animate-fadeIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{s.label}</p>
                          <p className="text-[10px] text-slate-500">{s.count} negocios</p>
                        </div>
                        <p className={`text-sm font-bold ${s.color}`}>{formatMoney(s.mrr)}/mes</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-0">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Buscar factura o negocio..." value={searchInvoice} onChange={e => setSearchInvoice(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-indigo-500 dark:text-white" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-[9px] font-bold text-slate-500 uppercase sticky top-0">
                    <th className="text-left px-3 py-2">Factura</th>
                    <th className="text-left px-3 py-2">Negocio</th>
                    <th className="text-center px-3 py-2">Plan</th>
                    <th className="text-right px-3 py-2">Monto</th>
                    <th className="text-center px-3 py-2 hidden sm:table-cell">Período</th>
                    <th className="text-center px-3 py-2">Estado</th>
                    <th className="text-center px-3 py-2 hidden md:table-cell">Fecha</th>
                    <th className="text-center px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.slice(0, 200).map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">{inv.id}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{inv.businessName}</td>
                      <td className="px-3 py-2.5 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${inv.plan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{inv.plan.toUpperCase()}</span></td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">{formatMoney(inv.amount)}</td>
                      <td className="px-3 py-2.5 text-center text-slate-500 hidden sm:table-cell">{inv.period}</td>
                      <td className="px-3 py-2.5 text-center">
                        {inv.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"><CheckCircle size={9} /> Pagada</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"><AlertTriangle size={9} /> Pendiente</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-400 hidden md:table-cell">{formatDate(inv.date)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <button className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInvoices.length === 0 && (
                <div className="text-center py-10 text-slate-400"><FileText size={24} className="mx-auto mb-2 opacity-50" /><p className="text-xs">No se encontraron facturas</p></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccounting;
