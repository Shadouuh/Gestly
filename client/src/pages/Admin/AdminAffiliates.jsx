import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  Percent,
  Store,
  TrendingUp,
  ChevronRight,
  Clock,
  Search,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { AFFILIATE_COMMISSIONS, formatMoney, formatDate } from './data/adminMockData';

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <div className={`animate-fadeIn ${className}`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
    {children}
  </div>
);

const MONTHLY_COMMISSION_HISTORY = [
  { month: 'Ene', comisiones: 82000, pagado: 65000 },
  { month: 'Feb', comisiones: 86000, pagado: 70000 },
  { month: 'Mar', comisiones: 89000, pagado: 72000 },
  { month: 'Abr', comisiones: 93000, pagado: 85000 },
  { month: 'May', comisiones: 96000, pagado: 90000 },
  { month: 'Jun', comisiones: 101000, pagado: 96000 },
];

const AdminAffiliates = () => {
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAffiliates = AFFILIATE_COMMISSIONS.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEarnings = AFFILIATE_COMMISSIONS.reduce((s, a) => s + a.totalEarned, 0);
  const totalReferrals = AFFILIATE_COMMISSIONS.reduce((s, a) => s + a.totalBusinesses, 0);

  return (
    <div className="p-4 md:p-5 h-full flex flex-col">
      {selectedAffiliate ? (
        <>
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <button onClick={() => setSelectedAffiliate(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronRight size={16} className="rotate-180 text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                {selectedAffiliate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-sm font-display font-bold text-slate-900 dark:text-white">{selectedAffiliate.name}</h2>
                <p className="text-[9px] text-slate-500">Código: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedAffiliate.code}</span></p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { label: 'Comisión Total', value: formatMoney(selectedAffiliate.totalEarned), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Pendiente', value: formatMoney(selectedAffiliate.totalPending), icon: Clock, color: 'text-amber-600 bg-amber-50' },
                { label: 'Negocios', value: selectedAffiliate.totalBusinesses, sub: 'referidos', icon: Store, color: 'text-blue-600 bg-blue-50' },
                { label: 'Tasa Comisión', value: '40% / 10%', sub: '3 meses / después', icon: Percent, color: 'text-violet-600 bg-violet-50' },
                { label: 'Promedio', value: formatMoney(selectedAffiliate.avgCommission), sub: 'por negocio', icon: Calendar, color: 'text-slate-600 bg-slate-100' },
              ].map((s, i) => (
                <div key={s.label} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`p-1 rounded-md ${s.color}`}><s.icon size={11} /></div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{s.label}</p>
                  </div>
                  <p className="text-xs font-display font-bold text-slate-900 dark:text-white">{s.value}</p>
                  {s.sub && <p className="text-[8px] text-slate-500 mt-0.5">{s.sub}</p>}
                </div>
              ))}
            </div>

            <FadeIn delay={100}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-all">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><TrendingUp size={14} className="text-indigo-500" /> Historial de Comisiones Mensual</h3>
                <div className="flex items-end gap-2 h-28">
                  {MONTHLY_COMMISSION_HISTORY.map(m => {
                    const h = (m.comisiones / 110000) * 100;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-slate-400">${(m.comisiones / 1000).toFixed(0)}k</span>
                        <div className="w-full bg-indigo-100 dark:bg-indigo-900/50 rounded-t relative" style={{ height: `${h}%` }}>
                          <div className="absolute bottom-0 w-full bg-emerald-500 dark:bg-emerald-400 rounded-t" style={{ height: `${(m.pagado / m.comisiones) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-400" /> Comisión total</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500" /> Pagado</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><BarChart3 size={14} className="text-indigo-500" /> Resumen de Comisiones</h3>
                <div className="space-y-2">
                  {selectedAffiliate.details.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Store size={12} className="text-slate-400" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white">{d.name}</p>
                          <p className="text-[8px] text-slate-500">
                            {d.isFirst3 ? '40% comisión' : '10% comisión'} · {d.monthsActive} meses
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-600">{formatMoney(d.commission)}</p>
                    </div>
                  ))}
                  {selectedAffiliate.details.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Sin comisiones registradas</p>
                  )}
                </div>
              </div>
            </div>
            </FadeIn>

            <FadeIn delay={200}>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-all">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Store size={14} className="text-indigo-500" /> Negocios Referidos</h3>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-[9px] font-bold text-slate-500 uppercase">
                    <th className="text-left px-2 py-1.5">Negocio</th>
                    <th className="text-left px-2 py-1.5 hidden sm:table-cell">Plan</th>
                    <th className="text-right px-2 py-1.5">Fact. Mensual</th>
                    <th className="text-center px-2 py-1.5">Meses</th>
                    <th className="text-center px-2 py-1.5">Comisión</th>
                    <th className="text-right px-2 py-1.5">Ganado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedAffiliate.details.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td className="px-2 py-2 font-bold text-slate-900 dark:text-white">{d.name}</td>
                      <td className="px-2 py-2 hidden sm:table-cell"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${d.plan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{d.plan.toUpperCase()}</span></td>
                      <td className="px-2 py-2 text-right font-bold text-slate-900 dark:text-white">{formatMoney(d.monthlyAmount)}</td>
                      <td className="px-2 py-2 text-center text-slate-500">{d.monthsActive}</td>
                      <td className="px-2 py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${d.isFirst3 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>{d.isFirst3 ? '40%' : '10%'}</span></td>
                      <td className="px-2 py-2 text-right font-bold text-emerald-600">{formatMoney(d.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </FadeIn>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white">Vendedores</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gestión de afiliados y comisiones</p>
            </div>
          </div>

          <FadeIn delay={0}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4 shrink-0">
              {[
                { label: 'Vendedores', value: AFFILIATE_COMMISSIONS.length, sub: 'registrados', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Comisiones Total', value: formatMoney(totalEarnings), sub: 'acumuladas', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Negocios', value: totalReferrals, sub: 'referidos', icon: Store, color: 'text-blue-600 bg-blue-50' },
                { label: 'Com. Mensual', value: formatMoney(MONTHLY_COMMISSION_HISTORY[MONTHLY_COMMISSION_HISTORY.length - 1].comisiones), sub: 'este mes', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
              ].map((s, i) => (
                <div key={s.label} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`p-1 rounded-md ${s.color}`}><s.icon size={11} /></div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{s.label}</p>
                  </div>
                  <p className="text-xs font-display font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Buscar vendedor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-indigo-500 dark:text-white" />
            </div>
          </FadeIn>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {filteredAffiliates.map((a, idx) => {
              const activeCount = a.details.filter(d => d.status === 'active' || d.status === 'trial').length;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAffiliate(a)}
                  className="w-full text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-3 hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300 group animate-fadeIn"
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {a.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{a.name}</h3>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-bold">{a.code}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Store size={10} />{activeCount} activos</span>
                        <span className="flex items-center gap-1"><DollarSign size={10} />{formatMoney(a.totalEarned)}</span>
                        {a.totalPending > 0 && (
                          <span className="flex items-center gap-1 text-amber-600"><Clock size={10} />{formatMoney(a.totalPending)} pend.</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-emerald-600">{formatMoney(a.totalPending)}</p>
                        <p className="text-[8px] text-slate-400">pendiente</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredAffiliates.length === 0 && (
              <div className="text-center py-10 text-slate-400"><Users size={24} className="mx-auto mb-2 opacity-50" /><p className="text-xs">No se encontraron vendedores</p></div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAffiliates;
