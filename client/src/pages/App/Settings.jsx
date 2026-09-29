import React, { useState, useEffect } from 'react';
import {
  Store,
  CreditCard,
  Receipt,
  Bell,
  Shield,
  Users,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  FileText,
  Building2,
  MapPin,
  Key,
  CheckCircle,
  XCircle,
  HelpCircle,
  Check,
  AlertTriangle,
  Save,
  Edit2,
  Download,
  Printer,
  Palette,
  Monitor,
  Moon,
  Sun,
  Layers,
  Eye,
  Package,
  Hash,
} from 'lucide-react';
import AppPageHeader from './components/AppPageHeader';

const ARCA_STORAGE_KEY = 'gestly_arca_config';

const defaultArcaConfig = {
  businessName: '',
  cuit: '',
  ivaCondition: 'monotributista',
  address: '',
  pointOfSale: 1,
  iibbCondition: '',
  arcaKey: '',
  defaultReceiptType: 'B',
  isConnected: false,
};

const IVA_CONDITIONS = [
  { value: 'consumidor_final', label: 'Consumidor Final' },
  { value: 'monotributista', label: 'Monotributista' },
  { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
  { value: 'exento', label: 'Exento' },
  { value: 'no_alcanzado', label: 'No Alcanzado' },
];

const RECEIPT_TYPES = [
  { value: 'A', label: 'Factura A', desc: 'Responsables Inscriptos' },
  { value: 'B', label: 'Factura B', desc: 'Consumidores / Monotributistas' },
  { value: 'C', label: 'Factura C', desc: 'No alcanzados' },
  { value: 'ticket', label: 'Ticket / Comprobante', desc: 'Sin requisitos fiscales' },
];

const PLAN_FEATURES = [
  { name: 'Emisión de facturas electrónicas', free: true, pro: true, premium: true },
  { name: 'Factura A / B / C', free: false, pro: true, premium: true },
  { name: 'Exportación a PDF', free: true, pro: true, premium: true },
  { name: 'Multi-sucursal', free: false, pro: true, premium: true },
  { name: 'Límite facturas/mes', free: 50, pro: 500, premium: 'Ilimitado' },
  { name: 'Soporte prioritario', free: false, pro: false, premium: true },
];

const SECTIONS = [
  {
    id: 'business',
    title: 'Tu negocio',
    icon: Store,
    description: 'Nombre, logo, rubro y datos fiscales del comercio.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    id: 'payments',
    title: 'Métodos de pago',
    icon: CreditCard,
    description: 'Mercado Pago, transferencias y opciones en caja.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    id: 'billing',
    title: 'Facturación',
    icon: Receipt,
    description: 'Tickets, impresión y comprobantes de venta.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
  },
  {
    id: 'inventory',
    title: 'Inventario',
    icon: Package,
    description: 'Modo de stock, alertas y control de inventario.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    id: 'theme',
    title: 'Tema y Apariencia',
    icon: Palette,
    description: 'Modo de color, tema oscuro/claro y personalización visual.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    icon: Bell,
    description: 'Alertas de stock, caja y fiados pendientes.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    id: 'security',
    title: 'Seguridad',
    icon: Shield,
    description: 'Contraseña, permisos y acceso del equipo.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
  },
  {
    id: 'subscription',
    title: 'Suscripción',
    icon: Users,
    description: 'Plan actual, facturación y límites de Gestly.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
];

const THEME_STORAGE_KEY = 'gestly_theme_config';

const defaultThemeConfig = {
  mode: 'light', // 'light', 'dark', 'dark-com', 'mixed'
  primaryColor: 'default', // 'default', 'purple', 'blue', 'emerald', 'rose'
};

const THEME_MODES = [
  { id: 'light', label: 'Claro', icon: Sun, description: 'Fondo blanco, sidebar blanco' },
  { id: 'dark', label: 'Oscuro', icon: Moon, description: 'Todo en negro profundo' },
  { id: 'dark-com', label: 'Oscuro Común', icon: Monitor, description: 'Negro con acentos grises' },
  { id: 'mixed', label: 'Mixto', icon: Layers, description: 'Sidebar oscuro, contenido claro' },
];

const PRIMARY_COLORS = [
  { id: 'default', label: 'Clásico', hex: '#111827', desc: 'Gris oscuro' },
  { id: 'purple', label: 'Lavanda', hex: '#8b5cf6', desc: 'Morado pastel' },
  { id: 'blue', label: 'Cielo', hex: '#3b82f6', desc: 'Azul suave' },
  { id: 'emerald', label: 'Menta', hex: '#10b981', desc: 'Verde fresco' },
  { id: 'rose', label: 'Coral', hex: '#f43f5e', desc: 'Rosa cálido' },
  { id: 'amber', label: 'Ámbar', hex: '#f59e0b', desc: 'Naranja dorado' },
];

const SettingsPage = () => {
  const [activeId, setActiveId] = useState('business');
  const [arcaConfig, setArcaConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(ARCA_STORAGE_KEY);
      return saved ? { ...defaultArcaConfig, ...JSON.parse(saved) } : defaultArcaConfig;
    } catch { return defaultArcaConfig; }
  });
  const [isEditingArca, setIsEditingArca] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [arcaSaveMsg, setArcaSaveMsg] = useState('');
  
  const [themeConfig, setThemeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved ? { ...defaultThemeConfig, ...JSON.parse(saved) } : defaultThemeConfig;
    } catch { return defaultThemeConfig; }
  });
  const [themeSaveMsg, setThemeSaveMsg] = useState('');

  const STOCK_MODE_KEY = 'catalogStockMode';
  const [stockMode, setStockMode] = useState(() => localStorage.getItem(STOCK_MODE_KEY) || 'numeric');
  const [stockSaveMsg, setStockSaveMsg] = useState('');

  useEffect(() => {
    localStorage.setItem(ARCA_STORAGE_KEY, JSON.stringify(arcaConfig));
  }, [arcaConfig]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeConfig));
    
    const root = document.documentElement;
    
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
    root.removeAttribute('data-accent');
    
    // Apply theme mode
    if (themeConfig.mode === 'dark' || themeConfig.mode === 'dark-com' || themeConfig.mode === 'mixed') {
      root.classList.add('dark');
    }
    root.setAttribute('data-theme', themeConfig.mode);
    
    // Apply primary color accent
    if (themeConfig.primaryColor && themeConfig.primaryColor !== 'default') {
      root.setAttribute('data-accent', themeConfig.primaryColor);
    }
    
    localStorage.setItem('theme', themeConfig.mode === 'light' ? 'light' : 'dark');
  }, [themeConfig]);

  const active = SECTIONS.find((s) => s.id === activeId) || SECTIONS[0];
  const ActiveIcon = active.icon;

  const startEditingArca = () => {
    setEditForm({ ...arcaConfig });
    setIsEditingArca(true);
  };

  const saveArcaConfig = () => {
    setArcaConfig({ ...editForm });
    setIsEditingArca(false);
    setArcaSaveMsg('Datos fiscales guardados correctamente.');
    setTimeout(() => setArcaSaveMsg(''), 3000);
  };

  const [currentPlan, setCurrentPlan] = useState('essential');

  useEffect(() => {
    const business = getCurrentBusiness();
    if (business?.plan_name) {
      const name = business.plan_name.toLowerCase();
      if (name.includes('premium') || name.includes('enterprise')) setCurrentPlan('premium');
      else if (name.includes('pro') || name.includes('profesional')) setCurrentPlan('pro');
      else setCurrentPlan('essential');
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto custom-scrollbar p-4 md:p-5">
      <AppPageHeader
        title="Configuración"
        subtitle="Personalizá Gestly según cómo trabaja tu negocio"
      />

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12 app-enter app-enter-delay-1">
        {/* Navegación lateral — usa altura horizontal en móvil */}
        <aside className="lg:col-span-3">
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
            Secciones
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 custom-scrollbar">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeId === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveId(section.id)}
                  className={`flex min-w-[140px] shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 lg:min-w-0 lg:w-full ${
                    isActive
                      ? 'border-slate-900 bg-white shadow-sm dark:border-white dark:bg-slate-800'
                      : 'border-slate-200 bg-white/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80'
                  }`}
                >
                  <div className={`app-icon-box ${section.bg}`}>
                    <Icon size={14} className={section.color} />
                  </div>
                  <span
                    className={`truncate text-xs font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    {section.title}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Panel principal + grid de tarjetas */}
        <div className="space-y-4 lg:col-span-9">
          <div key={active.id} className="app-card animate-fadeIn p-4 md:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <div className={`rounded-xl p-2.5 ${active.bg}`}>
                  <ActiveIcon size={20} className={active.color} />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">
                    {active.title}
                  </h2>
                  <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
                    {active.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Editar
                <ExternalLink size={12} />
              </button>
            </div>
            {active.id === 'billing' ? (
              <div className="mt-4 space-y-4">
                {/* ARCA Configuration */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                        <FileText size={15} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">ARCA — Factura Electrónica</h3>
                    </div>
                    {!isEditingArca ? (
                      <button onClick={startEditingArca} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Edit2 size={12} /> Editar
                      </button>
                    ) : (
                      <button onClick={saveArcaConfig} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                        <Save size={12} /> Guardar
                      </button>
                    )}
                  </div>

                  {arcaSaveMsg && (
                    <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <Check size={14} /> {arcaSaveMsg}
                    </div>
                  )}

                  {isEditingArca ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Razón Social</label>
                        <input type="text" value={editForm.businessName || ''} onChange={e => setEditForm({...editForm, businessName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" placeholder="Nombre del comercio" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">CUIT / CUIL</label>
                        <input type="text" value={editForm.cuit || ''} onChange={e => setEditForm({...editForm, cuit: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" placeholder="XX-XXXXXXXX-X" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Condición IVA</label>
                        <select value={editForm.ivaCondition || 'monotributista'} onChange={e => setEditForm({...editForm, ivaCondition: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white">
                          {IVA_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Dirección</label>
                        <input type="text" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" placeholder="Calle y número" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Punto de Venta</label>
                        <input type="number" value={editForm.pointOfSale || 1} onChange={e => setEditForm({...editForm, pointOfSale: Math.max(1, Number(e.target.value))})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" min="1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Clave / PIN ARCA</label>
                        <input type="password" value={editForm.arcaKey || ''} onChange={e => setEditForm({...editForm, arcaKey: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Tipo de Comprobante por Defecto</label>
                        <select value={editForm.defaultReceiptType || 'B'} onChange={e => setEditForm({...editForm, defaultReceiptType: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white">
                          {RECEIPT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Condición IIBB</label>
                        <input type="text" value={editForm.iibbCondition || ''} onChange={e => setEditForm({...editForm, iibbCondition: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 dark:text-white" placeholder="Ej: Convenio Multilateral" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Razón Social</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{arcaConfig.businessName || <span className="text-slate-400">—</span>}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">CUIT</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{arcaConfig.cuit || <span className="text-slate-400">—</span>}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Condición IVA</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{IVA_CONDITIONS.find(c => c.value === arcaConfig.ivaCondition)?.label || '—'}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Dirección</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{arcaConfig.address || <span className="text-slate-400">—</span>}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Punto de Venta</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{arcaConfig.pointOfSale}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Comprobante</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{RECEIPT_TYPES.find(r => r.value === arcaConfig.defaultReceiptType)?.label || '—'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Connection Status */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${arcaConfig.isConnected ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
                      {arcaConfig.isConnected ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={16} className="text-amber-600 dark:text-amber-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Conectividad ARCA</p>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {arcaConfig.isConnected ? 'Conectado correctamente' : 'No conectado — vinculá tus datos fiscales'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setArcaConfig(prev => ({ ...prev, isConnected: !prev.isConnected }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${arcaConfig.isConnected ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'}`}
                  >
                    {arcaConfig.isConnected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>

                {/* Receipt Types */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Tipos de Comprobante Habilitados</h3>
                  <div className="flex flex-wrap gap-2">
                    {RECEIPT_TYPES.map(r => (
                      <div key={r.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${r.value === arcaConfig.defaultReceiptType ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'}`}>
                        <Check size={12} className={r.value === arcaConfig.defaultReceiptType ? 'text-indigo-500' : 'text-slate-300'} />
                        <span>{r.label}</span>
                        <span className="text-[9px] opacity-70">— {r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : active.id === 'subscription' ? (
              <div className="mt-4 space-y-4">
                {/* Current Plan */}
                <div className={`rounded-xl border bg-gradient-to-br p-5 text-white ${
                  currentPlan === 'premium' ? 'from-purple-500 to-purple-700 border-purple-400/30' :
                  currentPlan === 'pro' ? 'from-indigo-500 to-indigo-700 border-indigo-400/30' :
                  'from-blue-500 to-blue-700 border-blue-400/30'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Plan Actual</p>
                      <h3 className="text-2xl font-display font-black mt-1 capitalize">{currentPlan}</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">Activo</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                      <CheckCircle size={14} />
                      <span className="text-xs font-bold">Factura Electrónica</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                      <Download size={14} />
                      <span className="text-xs font-bold">Exportación PDF</span>
                    </div>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Cambiar Plan</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'essential', name: 'Essential', price: '$5.000/mes', features: ['Facturación', 'Inventario', '1 sucursal'] },
                      { id: 'pro', name: 'Pro', price: '$10.000/mes', features: ['Todo en Essential', 'Multi-sucursal', 'Reportes'] },
                      { id: 'premium', name: 'Premium', price: '$20.000/mes', features: ['Todo en Pro', 'Soporte prioritario', 'API'] },
                    ].map(plan => (
                      <div key={plan.id} onClick={() => setCurrentPlan(plan.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          currentPlan === plan.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            currentPlan === plan.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {currentPlan === plan.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{plan.features.join(' · ')}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{plan.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Funcionalidades Incluidas</h3>
                  <div className="space-y-2">
                    {PLAN_FEATURES.map(f => {
                      const planValue = f[currentPlan];
                      const isAvailable = currentPlan === 'essential' ? f.free : currentPlan === 'pro' ? f.pro : true;
                      return (
                        <div key={f.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{f.name}</span>
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {isAvailable ? <Check size={12} /> : <XCircle size={12} />}
                            {typeof planValue === 'number' ? `${planValue}/mes` : typeof planValue === 'string' ? planValue : isAvailable ? '✔' : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : active.id === 'inventory' ? (
              <div className="mt-4 space-y-4">
                {stockSaveMsg && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Check size={14} /> {stockSaveMsg}
                  </div>
                )}

                {/* Stock Mode Selection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <Package size={15} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modo de Stock</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">Elegí cómo se muestra y controla el inventario de productos en tu catálogo y POS.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStockMode('numeric')}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        stockMode === 'numeric'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        stockMode === 'numeric' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <Hash size={18} className={stockMode === 'numeric' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${stockMode === 'numeric' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          Numérico
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Control exacto de unidades. Mostrará cantidades disponibles (ej: "12 uds").
                        </p>
                      </div>
                      {stockMode === 'numeric' && <Check size={16} className="ml-auto shrink-0 text-emerald-500" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockMode('simple')}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        stockMode === 'simple'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        stockMode === 'simple' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <Eye size={18} className={stockMode === 'simple' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${stockMode === 'simple' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          Agotado / Disponible
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Modo simple. Solo muestra si hay stock o está agotado.
                        </p>
                      </div>
                      {stockMode === 'simple' && <Check size={16} className="ml-auto shrink-0 text-emerald-500" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle size={15} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">¿Cómo funciona?</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <strong>Numérico:</strong> Cada producto tiene un contador de unidades. Se actualiza automáticamente al vender. Ideal para comercios que necesitan control preciso.
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <strong>Agotado / Disponible:</strong> Solo indicás si el producto tiene stock o no. Más rápido para catálogos grandes donde no necesitás contar unidades exactas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={() => {
                    localStorage.setItem(STOCK_MODE_KEY, stockMode);
                    window.dispatchEvent(new StorageEvent('storage', { key: STOCK_MODE_KEY }));
                    setStockSaveMsg('Modo de stock guardado correctamente.');
                    setTimeout(() => setStockSaveMsg(''), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Save size={12} /> Guardar Cambios
                </button>
              </div>
            ) : active.id === 'theme' ? (
              <div className="mt-4 space-y-5">
                {themeSaveMsg && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Check size={14} /> {themeSaveMsg}
                  </div>
                )}

                {/* Theme Mode Selection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                      <Monitor size={15} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modo de Tema</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">Elegí cómo se ve la interfaz de Gestly.</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {THEME_MODES.map(mode => {
                      const ModeIcon = mode.icon;
                      const isSelected = themeConfig.mode === mode.id;
                      const modeColors = {
                        light: { bg: '#f8fafc', border: '#e2e8f0', icon: '#64748b' },
                        dark: { bg: '#0a0a0a', border: '#262626', icon: '#fafafa' },
                        'dark-com': { bg: '#111827', border: '#1e293b', icon: '#e2e8f0' },
                        mixed: { bg: '#f8fafc', border: '#0B1120', icon: '#0B1120' },
                      };
                      const mc = modeColors[mode.id];
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setThemeConfig(prev => ({ ...prev, mode: mode.id }))}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected ? 'shadow-md' : 'hover:opacity-80'
                          }`}
                          style={{ 
                            borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                            backgroundColor: isSelected ? 'var(--color-primary)' + '08' : 'transparent'
                          }}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                            style={{ backgroundColor: mc.bg, borderColor: mc.border }}
                          >
                            <ModeIcon size={18} style={{ color: mc.icon }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                              {mode.label}
                            </p>
                            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{mode.description}</p>
                          </div>
                          {isSelected && <Check size={14} className="ml-auto shrink-0" style={{ color: 'var(--color-primary)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Color Selection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                      <Palette size={15} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Color Principal</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4">Cambiar el color de acento de la aplicación.</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {PRIMARY_COLORS.map(color => {
                      const isSelected = themeConfig.primaryColor === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => setThemeConfig(prev => ({ ...prev, primaryColor: color.id }))}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'shadow-md scale-[1.02]'
                              : 'hover:scale-[1.01]'
                          }`}
                          style={{ 
                            borderColor: isSelected ? color.hex : 'var(--border-color)',
                            backgroundColor: isSelected ? `${color.hex}10` : 'transparent'
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-full shadow-sm"
                            style={{ backgroundColor: `${color.hex}20`, border: `2px solid ${color.hex}` }}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
                            </div>
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: isSelected ? color.hex : 'var(--text-secondary)' }}>
                            {color.label}
                          </span>
                          {isSelected && <Check size={12} style={{ color: color.hex }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' + '15' }}>
                      <Eye size={15} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Vista Previa</h3>
                  </div>
                  <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                        <span className="text-xs font-bold" style={{ color: 'var(--sidebar-active-text)' }}>TN</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Tu Negocio</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Vista previa del tema</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--sidebar-active-text)' }}>
                        Botón Primario
                      </div>
                      <div className="px-3 py-1.5 rounded-lg border text-[10px] font-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                        Botón Secundario
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={() => {
                    setThemeSaveMsg('Tema guardado correctamente.');
                    setTimeout(() => setThemeSaveMsg(''), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                >
                  <Save size={12} /> Guardar Cambios
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {['Preferencia A', 'Preferencia B', 'Preferencia C'].map((label) => (
                  <div
                    key={label}
                    className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/50"
                  >
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</p>
                    <p className="mt-0.5 text-[0.7rem] text-slate-500">Próximamente configurable</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vista rápida de todas las secciones en grid ancho */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveId(section.id)}
                  className="app-card-hover flex items-start gap-3 p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <div className={`app-icon-box ${section.bg}`}>
                    <Icon size={15} className={section.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-[0.7rem] text-slate-500">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight size={14} className="mt-1 shrink-0 text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-slate-900 p-4 text-white dark:bg-slate-800 sm:flex-row sm:p-5">
            <div className="flex items-center gap-3">
              <div className="app-icon-box bg-white/15 text-white">
                <MessageCircle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold">¿Necesitás ayuda?</h3>
                <p className="text-xs text-slate-400">Nuestro equipo te responde en el día.</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Contactar soporte
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
