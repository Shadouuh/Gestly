import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Store, 
  MapPin, 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingCart,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
  Building2,
  ArrowLeft,
  DollarSign,
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  BookOpen,
  Shirt,
  Crown,
  Percent,
  Hash,
  Gift,
  UserCheck,
} from 'lucide-react';
import Hammer from 'lucide-react/dist/esm/icons/hammer';
import Beef from 'lucide-react/dist/esm/icons/beef';
import { getAdminBusinesses } from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';
import { useLocation } from 'react-router-dom';
import { DataStatusPanel } from '../../shared/components/DataStatus';

const formatMoney = (n) => n ? `$${Number(n).toLocaleString()}` : '$0';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const RUBRO_ICONS = { Kiosco: Store, Ferretería: Hammer, Carnicería: Beef, Supermercado: ShoppingCart, Farmacia: ShieldCheck, Librería: BookOpen, Indumentaria: Shirt, Electrodomésticos: Zap };
const RUBRO_COLORS = { Kiosco: 'text-blue-600 bg-blue-50', Ferretería: 'text-slate-600 bg-slate-50', Carnicería: 'text-red-600 bg-red-50', Supermercado: 'text-emerald-600 bg-emerald-50', Farmacia: 'text-cyan-600 bg-cyan-50', Librería: 'text-amber-600 bg-amber-50', Indumentaria: 'text-pink-600 bg-pink-50', Electrodomésticos: 'text-violet-600 bg-violet-50' };

const getMapUrl = (city) => `https://maps.google.com/maps?q=${encodeURIComponent(city)}&t=m&z=10&output=embed`;

const MOCK_EMPLOYEES = [
  { name: 'Sofía Torres', role: 'Cajera', salary: 320000, since: '2024-03' },
  { name: 'Lucas Acosta', role: 'Repositor', salary: 280000, since: '2024-06' },
  { name: 'Valentina Ruiz', role: 'Encargada', salary: 380000, since: '2023-11' },
  { name: 'Tomás Medina', role: 'Cajero', salary: 300000, since: '2025-01' },
  { name: 'Camila Sosa', role: 'Administrativa', salary: 350000, since: '2024-09' },
];

const MOCK_CATEGORIES = ['Bebidas', 'Golosinas', 'Limpieza', 'Lácteos', 'Almacén', 'Congelados', 'Panadería'];

const MOCK_SALES_HISTORY = [
  { month: 'Ene', amount: 890000 },
  { month: 'Feb', amount: 920000 },
  { month: 'Mar', amount: 1050000 },
  { month: 'Abr', amount: 980000 },
  { month: 'May', amount: 1120000 },
  { month: 'Jun', amount: 1250000 },
];

const AdminBusinesses = () => {
  const location = useLocation();
  const notify = useNotification();
  const [search, setSearch] = useState('');
  const [rubroFilter, setRubroFilter] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [realBusinesses, setRealBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminBusinesses()
      .then(data => { setRealBusinesses(Array.isArray(data) ? data : []); })
      .catch(err => notify.error('Error al cargar negocios desde la base de datos'))
      .finally(() => setLoading(false));
  }, []);

  const businesses = realBusinesses.length > 0 ? realBusinesses.map(b => ({
    id: b.id,
    name: b.name,
    rubro: b.rubro || 'Kiosco',
    city: b.city || '—',
    plan: 'Pro',
    status: 'active',
    users: b.user_count || 0,
    products: b.product_count || 0,
    branches: b.branch_count || 0,
    monthlySales: b.monthly_sales || 0,
    createdAt: b.created_at,
    lastActivity: b.created_at,
  })) : [];
  const [detailTab, setDetailTab] = useState('subscription');
  const [viewMode, setViewMode] = useState('cards');

  const filtered = businesses.filter(b => {
    const q = search.toLowerCase();
    return ((b.name || '').toLowerCase().includes(q) || (b.city || '').toLowerCase().includes(q)) && (rubroFilter === 'all' || (b.rubro || '').toLowerCase() === rubroFilter);
  });

  const cityGroups = filtered.reduce((acc, b) => {
    if (!acc[b.city]) acc[b.city] = [];
    acc[b.city].push(b);
    return acc;
  }, {});

  const totalBusinesses = businesses.length;
  const activeBusinesses = businesses.filter(b => b.status === 'active').length;
  const totalCities = [...new Set(businesses.map(b => b.city))].length;
  const totalUsers = businesses.reduce((s, b) => s + (b.users || 0), 0);
  const totalSales = businesses.reduce((s, b) => s + (b.monthlySales || 0), 0);

  return (
    <div className="p-4 md:p-5 h-full flex flex-col">
      {selectedBusiness ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <button onClick={() => setSelectedBusiness(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={14} /> Volver a negocios
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={18} />
                    <h2 className="text-lg font-display font-bold">{selectedBusiness.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedBusiness.plan === 'pro' ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'}`}>{selectedBusiness.plan === 'pro' ? 'PRO' : 'ESSENTIAL'}</span>
                  </div>
                  <p className="text-sm text-indigo-200 flex items-center gap-1.5"><MapPin size={13} /> {selectedBusiness.address}, {selectedBusiness.city}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${selectedBusiness.status === 'active' ? 'bg-emerald-500 text-white' : selectedBusiness.status === 'trial' ? 'bg-blue-500 text-white' : selectedBusiness.status === 'expired' ? 'bg-red-500 text-white' : 'bg-slate-400 text-white'}`}>
                  {selectedBusiness.status === 'active' ? 'Activo' : selectedBusiness.status === 'trial' ? 'Prueba' : selectedBusiness.status === 'expired' ? 'Vencido' : 'Cancelado'}
                </div>
              </div>
            </div>

            <div className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex overflow-x-auto custom-scrollbar">
                {[
                  { id: 'subscription', label: 'Subscripción', icon: Crown },
                  { id: 'employees', label: 'Empleados', icon: Users },
                  { id: 'sales', label: 'Ventas', icon: TrendingUp },
                  { id: 'catalog', label: 'Catálogo', icon: Package },
                ].map(t => (
                  <button key={t.id} onClick={() => setDetailTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold border-b-2 transition-colors shrink-0 ${detailTab === t.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {detailTab === 'subscription' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Crown, label: 'Plan', value: selectedBusiness.plan === 'pro' ? 'Pro' : 'Essential', color: selectedBusiness.plan === 'pro' ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-100' },
                      { icon: DollarSign, label: 'Precio', value: formatMoney(selectedBusiness.monthlyAmount) + (selectedBusiness.frequency === 'annual' ? ' /año' : ' /mes'), color: 'text-emerald-600 bg-emerald-50' },
                      { icon: Calendar, label: 'Facturación', value: selectedBusiness.frequency === 'annual' ? 'Anual' : 'Mensual', color: 'text-blue-600 bg-blue-50' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1"><s.icon size={12} /> {s.label}</div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Calendar, label: 'Inicio', value: formatDate(selectedBusiness.startDate) },
                      { icon: Clock, label: 'Próximo vencimiento', value: formatDate(selectedBusiness.nextBilling) },
                      { icon: CheckCircle, label: 'Estado', value: selectedBusiness.status === 'active' ? 'Activo — al día' : selectedBusiness.status === 'trial' ? 'Período de prueba' : 'Vencida', color: selectedBusiness.status === 'active' ? 'text-emerald-600' : 'text-amber-600' },
                      { icon: Hash, label: 'Código de referido', value: selectedBusiness.affiliate || 'Sin código', color: selectedBusiness.affiliate ? 'text-indigo-600' : 'text-slate-500' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1"><s.icon size={12} /> {s.label}</div>
                        <p className={`text-xs font-bold ${s.color || 'text-slate-900 dark:text-white'}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedBusiness.affiliate && (
                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800 text-xs">
                      <p className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5"><Gift size={14} /> Descuento por referido activo</p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">Código: <span className="font-bold">{selectedBusiness.affiliate}</span> — 3 meses con 40% de comisión para el referidor</p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'employees' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{selectedBusiness.employees} empleados · {selectedBusiness.users} usuarios del sistema</p>
                  {MOCK_EMPLOYEES.slice(0, selectedBusiness.employees).map((e, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">{e.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{e.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{e.role} · Desde {e.since}</p>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{formatMoney(e.salary)}</p>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === 'sales' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: DollarSign, label: 'Ventas/mes', value: formatMoney(selectedBusiness.monthlySales), color: 'text-emerald-600 bg-emerald-50' },
                      { icon: ShoppingCart, label: 'Productos', value: selectedBusiness.products, color: 'text-blue-600 bg-blue-50' },
                      { icon: Users, label: 'Clientes', value: randomInt(50, 500), color: 'text-indigo-600 bg-indigo-50' },
                      { icon: TrendingUp, label: 'Ticket prom.', value: formatMoney(randomInt(2000, 8000)), color: 'text-amber-600 bg-amber-50' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${s.color}`}><s.icon size={14} /></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Últimos 6 meses</p>
                    <div className="flex items-end gap-2 h-24">
                      {MOCK_SALES_HISTORY.map(m => {
                        const h = (m.amount / 1500000) * 100;
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[8px] font-bold text-slate-400">${(m.amount / 1000).toFixed(0)}k</span>
                            <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-t" style={{ height: `${h}%` }}>
                              <div className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t h-full" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500">{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'catalog' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{selectedBusiness.products} productos en catálogo</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MOCK_CATEGORIES.map((cat, i) => (
                      <div key={cat} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${['bg-blue-100', 'bg-amber-100', 'bg-emerald-100', 'bg-rose-100', 'bg-indigo-100', 'bg-violet-100', 'bg-cyan-100'][i]}`}>
                            <Package size={12} className={['text-blue-600', 'text-amber-600', 'text-emerald-600', 'text-rose-600', 'text-indigo-600', 'text-violet-600', 'text-cyan-600'][i]} />
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{cat}</p>
                        </div>
                        <p className="text-[10px] text-slate-500">{randomInt(5, 40)} productos</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white">Negocios</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{totalBusinesses} negocios · {activeBusinesses} activos · {totalCities} ciudades</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button onClick={() => setViewMode('cards')} className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Tarjetas</button>
              <button onClick={() => setViewMode('table')} className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Tabla</button>
            </div>
          </div>

          <div className="shrink-0 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                <p className="text-xl font-display font-bold text-slate-900 dark:text-white">{totalBusinesses}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Activos</p>
                <p className="text-xl font-display font-bold text-emerald-600">{activeBusinesses}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Usuarios</p>
                <p className="text-xl font-display font-bold text-slate-900 dark:text-white">{totalUsers}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Ventas/mes</p>
                <p className="text-sm font-display font-bold text-slate-900 dark:text-white">{formatMoney(totalSales)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[140px] max-w-xs">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input type="text" placeholder="Buscar negocio o ciudad..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-indigo-500 dark:text-white" />
                    </div>
                    {['all', 'kiosco', 'ferreteria', 'carniceria', 'supermercado', 'farmacia'].map(r => (
                      <button key={r} onClick={() => setRubroFilter(r === 'all' ? 'all' : r)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all capitalize ${rubroFilter === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}
                      >{r === 'all' ? 'Todos' : r}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                  {Object.entries(cityGroups).map(([city, businesses]) => (
                    <div key={city} className="mb-4 last:mb-0">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={12} /> {city} <span className="text-slate-300 font-normal">({businesses.length})</span></h3>
                      {viewMode === 'cards' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {businesses.map(b => {
                            const Icon = RUBRO_ICONS[b.rubro] || Store;
                            return (
                              <div key={b.id} onClick={() => setSelectedBusiness(b)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex items-start gap-3">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${RUBRO_COLORS[b.rubro] || 'text-slate-600 bg-slate-100'} shrink-0`}>
                                    <Icon size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{b.name}</p>
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.status === 'active' ? 'bg-emerald-500' : b.status === 'trial' ? 'bg-blue-500' : b.status === 'expired' ? 'bg-red-500' : 'bg-slate-300'}`} />
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.address}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-slate-400">
                                      <span className="flex items-center gap-1"><Users size={10} />{b.users}</span>
                                      <span className="flex items-center gap-1"><Package size={10} />{b.products}</span>
                                      <span className="flex items-center gap-1"><TrendingUp size={10} />{formatMoney(b.monthlySales)}</span>
                                      <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${b.plan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{b.plan === 'pro' ? 'PRO' : 'ESS'}</span>
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-950 text-[9px] font-bold text-slate-500 uppercase">
                                <th className="text-left px-2.5 py-2">Negocio</th>
                                <th className="text-left px-2.5 py-2 hidden sm:table-cell">Rubro</th>
                                <th className="text-left px-2.5 py-2 hidden md:table-cell">Dirección</th>
                                <th className="text-center px-2.5 py-2">Plan</th>
                                <th className="text-right px-2.5 py-2 hidden sm:table-cell">Precio</th>
                                <th className="text-right px-2.5 py-2 hidden lg:table-cell">Ventas/mes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {businesses.map(b => (
                                <tr key={b.id} onClick={() => setSelectedBusiness(b)} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-pointer transition-colors">
                                  <td className="px-2.5 py-2.5"><p className="font-bold text-slate-900 dark:text-white">{b.name}</p></td>
                                  <td className="px-2.5 py-2.5 hidden sm:table-cell text-slate-500 capitalize">{b.rubro}</td>
                                  <td className="px-2.5 py-2.5 hidden md:table-cell text-slate-500 truncate max-w-[140px]">{b.address}</td>
                                  <td className="px-2.5 py-2.5 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${b.plan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{b.plan.toUpperCase()}</span></td>
                                  <td className="px-2.5 py-2.5 text-right hidden sm:table-cell font-bold text-slate-900 dark:text-white">{formatMoney(b.monthlyAmount)}</td>
                                  <td className="px-2.5 py-2.5 text-right hidden lg:table-cell font-bold text-slate-900 dark:text-white">{formatMoney(b.monthlySales)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                  {Object.keys(cityGroups).length === 0 && (
                    <div className="text-center py-10 text-slate-400"><Store size={24} className="mx-auto mb-2 opacity-50" /><p className="text-xs">No se encontraron negocios</p></div>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} /> Mapa</h3>
                </div>
                <div className="h-[calc(100%-40px)]">
                  {Object.keys(cityGroups).length > 0 ? (
                    <iframe title="business-map" src={getMapUrl(Object.keys(cityGroups)[0])} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs p-4 text-center">Sin ubicaciones</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default AdminBusinesses;
