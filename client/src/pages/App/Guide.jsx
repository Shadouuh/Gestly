import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  ShoppingCart,
  Package,
  ArrowRight,
  Circle,
  Zap,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import AppPageHeader from './components/AppPageHeader';

export const GUIDE_STEPS = [
  {
    id: 1,
    title: 'Panel de control',
    short: 'Dashboard',
    icon: LayoutDashboard,
    path: '/app',
    description:
      'Revisá ingresos, tickets del día, caja y rankings. Es tu centro de mando para decidir rápido.',
    tips: ['Filtrá por fecha o rango', 'Abrí y cerrá caja desde el lateral', 'Compará sucursales si tenés varias'],
    completed: true,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  {
    id: 2,
    title: 'Catálogo y stock',
    short: 'Productos',
    icon: Package,
    path: '/app/catalogo',
    description:
      'Cargá productos, precios y stock. Podés usar plantillas por rubro o importar con foto de factura.',
    tips: ['Stock simple o avanzado', 'Alertas de faltantes', 'Categorías para ordenar el POS'],
    completed: false,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    id: 3,
    title: 'Primera venta',
    short: 'Punto de venta',
    icon: ShoppingCart,
    path: '/app/pos',
    description:
      'Registrá ventas en segundos, cobrá en efectivo o digital y llevá fiados bajo control por cliente.',
    tips: ['Buscá por nombre o código', 'Modo offline disponible', 'Tickets al instante'],
    completed: false,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
];

export const GUIDE_QUICK_LINKS = [
  { label: 'Ventas y fiados', path: '/app/ventas', icon: ShoppingCart },
  { label: 'Clientes', path: '/app/clientes', icon: HelpCircle },
  { label: 'Configuración', path: '/app/configuracion', icon: Zap },
];

const Guide = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const completedCount = GUIDE_STEPS.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / GUIDE_STEPS.length) * 100);
  const current = GUIDE_STEPS.find((s) => s.id === activeStep) || GUIDE_STEPS[0];
  const CurrentIcon = current.icon;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto custom-scrollbar p-4 md:p-5">
      <AppPageHeader
        title="Guía inicial"
        subtitle="Aprendé lo esencial en tres pasos y empezá a vender hoy"
      />

      {/* Banner horizontal */}
      <div className="app-enter app-enter-delay-1 relative mb-4 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-4 text-white dark:border-slate-700 md:p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="app-icon-box bg-white/15 text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-blue-200">
                Bienvenido a Gestly
              </p>
              <h2 className="mt-0.5 text-base font-display font-bold sm:text-lg">
                Tu negocio, ordenado en minutos
              </h2>
              <p className="mt-1 max-w-xl text-xs text-slate-300">
                Recorrido guiado por las secciones clave. Completá cada paso a tu ritmo.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <div className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <p className="text-[0.6rem] font-bold uppercase text-slate-300">Progreso</p>
              <p className="text-lg font-black">{progress}%</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100"
            >
              <PlayCircle size={14} />
              Ver tutorial
            </button>
          </div>
        </div>
        <div className="relative z-10 mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-blue-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Layout horizontal: pasos + detalle */}
      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-12 app-enter app-enter-delay-2">
        {/* Pasos — fila en desktop */}
        <div className="xl:col-span-4 space-y-2">
          <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
            Pasos recomendados
          </p>
          {GUIDE_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'border-slate-900 bg-white shadow-md dark:border-white dark:bg-slate-800'
                    : 'border-slate-200 bg-white/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-600'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    step.completed
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  {step.completed ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.6rem] font-bold uppercase text-slate-400">{step.short}</p>
                  <p
                    className={`truncate text-sm font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    {step.title}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className={`shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}
                />
              </button>
            );
          })}
        </div>

        {/* Detalle del paso */}
        <div className="xl:col-span-5">
          <div
            key={current.id}
            className="app-card flex h-full min-h-[240px] flex-col p-4 animate-fadeIn"
          >
            <div className={`mb-3 inline-flex w-fit rounded-xl p-2.5 ${current.bg}`}>
              <CurrentIcon size={22} className={current.color} />
            </div>
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
              {current.title}
            </h3>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {current.description}
            </p>
            <ul className="mt-3 space-y-1.5">
              {current.tips.map((tip) => (
                <li key={tip} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Circle size={6} className="fill-blue-500 text-blue-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate(current.path)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Ir a la sección
                <ArrowRight size={14} />
              </button>
              {activeStep < GUIDE_STEPS.length && (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                  Siguiente paso
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Accesos rápidos — columna derecha */}
        <div className="xl:col-span-3 space-y-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
            Accesos rápidos
          </p>
          {GUIDE_QUICK_LINKS.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="app-card-hover flex w-full items-center gap-3 p-3 text-left"
            >
              <div className="app-icon-box bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Icon size={15} />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {label}
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ))}
          <div className="app-card border-dashed p-3">
            <div className="flex gap-2">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">¿Dudas?</p>
                <p className="mt-0.5 text-[0.7rem] text-slate-500">
                  Escribinos desde Configuración → Soporte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
