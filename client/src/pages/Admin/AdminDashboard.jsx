import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  Store, 
  Building2,
  MapPin,
  TrendingUp, 
  Activity,
  ShieldCheck,
  Server,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  Clock,
  Bell,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Layers,
  Smartphone,
} from 'lucide-react';
import { getAdminStats, getAdminEvents } from '../../services/api';
import { SkeletonCard } from '../../shared/components/Skeleton';

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
};

const EVENT_COLORS = {
  user: 'text-blue-600 bg-blue-50',
  business: 'text-emerald-600 bg-emerald-50',
  payment: 'text-emerald-600 bg-emerald-50',
  system: 'text-indigo-600 bg-indigo-50',
  warning: 'text-red-600 bg-red-50',
};

const EVENT_ICONS = { user: Users, business: Store, payment: DollarSign, system: Zap, warning: AlertTriangle };

const formatMoney = (n) => `$${(n).toLocaleString()}`;

const FadeIn = ({ children, delay = 0, className = '' }) => (
  <div className={`animate-fadeIn ${className}`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, delay = 0 }) => (
  <FadeIn delay={delay} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-3.5 group">
    <div className="flex items-start justify-between mb-2">
      <div className={`p-2 rounded-lg ${color.bg} ${color.text} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={16} />
      </div>
      <div className="flex flex-col items-end gap-0.5">
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
        {subtitle && <span className="text-[8px] text-slate-400">{subtitle}</span>}
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
    <p className="text-xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
  </FadeIn>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminEvents()])
      .then(([s, e]) => { setStats(s); setEvents(Array.isArray(e) ? e : []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-5">
      <FadeIn delay={0}>
        <div className="mb-5">
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Panel de Control</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Centro de administración de Gestly</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </>
        ) : (
          <>
            <StatCard title="Negocios" value={stats?.totalBusinesses ?? '—'} icon={Building2} color={COLOR_MAP.indigo} delay={0} />
            <StatCard title="Activos" value={stats?.activeBusinesses ?? '—'} icon={Store} color={COLOR_MAP.emerald} subtitle="en la plataforma" delay={50} />
            <StatCard title="Ciudades" value={stats?.totalCities ?? '—'} icon={MapPin} color={COLOR_MAP.amber} delay={100} />
            <StatCard title="Usuarios" value={stats?.totalUsers ?? '—'} icon={Users} color={COLOR_MAP.blue} subtitle="registrados" delay={150} />
            <StatCard title="Productos" value={(stats?.totalProducts ?? 0).toLocaleString()} icon={Package} color={COLOR_MAP.violet} delay={200} />
            <StatCard title="Ventas/mes" value={formatMoney(stats?.monthlySales ?? 0)} icon={DollarSign} color={COLOR_MAP.rose} subtitle="últimos 30 días" delay={250} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <FadeIn delay={100} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <BarChart3 size={14} className="text-indigo-500" /> Crecimiento Mensual
          </h3>
          <div className="flex items-end gap-2 h-32">
            {['Ene','Feb','Mar','Abr','May','Jun'].map((month, i) => {
              const h = 60 + Math.random() * 40;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full relative rounded-t" style={{ height: `${h}%` }}>
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-500 dark:to-indigo-400 rounded-t animate-barGrow" style={{ height: '100%', animationDelay: `${i * 100}ms` }} />
                  </div>
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-[9px] font-bold text-slate-500">{month}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={200} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Server size={14} className="text-emerald-500" /> Estado del Sistema
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Base de Datos', status: 'Online', desc: 'MySQL · MariaDB', color: 'bg-emerald-500', pulse: true },
              { name: 'API REST', status: 'Online', desc: 'Express · :3001', color: 'bg-emerald-500', pulse: true },
              { name: 'Frontend', status: 'Online', desc: 'Vite · React', color: 'bg-emerald-500', pulse: true },
              { name: 'Usuarios', status: `${stats?.totalUsers ?? 0}`, desc: `${stats?.totalBusinesses ?? 0} negocios`, color: 'bg-blue-500', pulse: false },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <div className={`w-2 h-2 rounded-full ${s.color} shrink-0 ${s.pulse ? 'animate-pulse' : ''}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">{s.desc}</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">{s.status}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FadeIn delay={250} className="sm:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-500" /> Actividad Reciente
              </h3>
              <div className="space-y-1">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={1} />)
                ) : events.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-4">Sin actividad reciente</p>
                ) : events.map((e, i) => {
                  const Icon = EVENT_ICONS[e.type] || AlertTriangle;
                  const color = EVENT_COLORS[e.type] || 'text-slate-600 bg-slate-50';
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors animate-fadeIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                        <Icon size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-900 dark:text-slate-200 truncate">{e.msg}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0">{e.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
          </div>

        <div className="space-y-4">
          <FadeIn delay={250}>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4 rounded-xl text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-indigo-400" />
                <h3 className="text-xs font-bold">Gestión Centralizada</h3>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed mb-3">
                Administrá negocios, usuarios, subscripciones y configuraciones desde un solo panel.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { icon: Store, label: 'Negocios' },
                  { icon: Users, label: 'Usuarios' },
                  { icon: DollarSign, label: 'Facturación' },
                  { icon: Layers, label: 'Planes' },
                ].map(a => (
                  <span key={a.label} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-[10px] font-medium hover:bg-white/20 transition-colors">
                    <a.icon size={11} /> {a.label}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" /> Acciones Rápidas
              </h3>
              <div className="space-y-1.5">
                {[
                  { icon: Store, label: 'Ver todos los negocios', desc: 'Gestioná y administrá', color: 'bg-indigo-50 text-indigo-600' },
                  { icon: Users, label: 'Invitar usuario', desc: 'Agregá un nuevo miembro', color: 'bg-blue-50 text-blue-600' },
                  { icon: DollarSign, label: 'Ver facturación', desc: 'Ingresos y subscripciones', color: 'bg-emerald-50 text-emerald-600' },
                  { icon: Bell, label: 'Ver alertas', desc: 'Notificaciones del sistema', color: 'bg-amber-50 text-amber-600' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-all cursor-pointer group animate-fadeIn" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform`}>
                      <a.icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">{a.label}</p>
                      <p className="text-[9px] text-slate-500">{a.desc}</p>
                    </div>
                    <ArrowUpRight size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
