import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Package,
  Users,
  Shield,
  Cloud,
  Zap,
  Headphones,
  Sparkles,
  Play,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../../assets/hero/hero-image.png';
import heroBackground from '../../../assets/hero/background.png';

const highlights = [
  {
    icon: BarChart3,
    label: 'Ventas en tiempo real',
    sub: 'Tu negocio, al instante.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Package,
    label: 'Inventario bajo control',
    sub: 'Sabés qué tenés y qué falta.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Users,
    label: 'Clientes y reportes',
    sub: 'Decisiones con datos claros.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
];

const trustItems = [
  { icon: Shield, label: 'Seguro', sub: 'Datos protegidos', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Cloud, label: 'En la nube', sub: 'Desde cualquier dispositivo', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Zap, label: 'Rápido', sub: 'Sin curva de aprendizaje', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Headphones, label: 'Soporte', sub: 'Te acompañamos siempre', color: 'text-orange-600', bg: 'bg-orange-50' },
];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative isolate overflow-hidden pt-14 border-b border-slate-200/60">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <img
          src={heroBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/15 lg:from-white/85 lg:via-white/45 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/70" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 backdrop-blur-sm text-[0.72rem] font-medium text-slate-600">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                <Sparkles size={11} strokeWidth={2.5} />
              </span>
              Gestión simple para kioscos y comercios
            </div>

            <h1 className="font-display font-bold text-[1.85rem] sm:text-[2.15rem] lg:text-[2.45rem] leading-[1.12] tracking-tight text-slate-900">
              Tu negocio ordenado.
              <span className="block text-blue-600">Vendé más, con menos estrés.</span>
            </h1>

            <p className="text-[0.875rem] text-slate-500 leading-relaxed max-w-md">
              Ventas, stock y clientes en un solo panel. Pensado para quien atiende el mostrador y no tiene tiempo para sistemas complicados.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              {highlights.map(({ icon: Icon, label, sub, color, bg }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 border border-slate-100 shadow-sm"
                >
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={color} strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-semibold text-slate-800 leading-tight">{label}</p>
                    <p className="text-[0.65rem] text-slate-400 mt-0.5 leading-snug">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[0.8rem] font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:-translate-y-px transition-all"
              >
                Comenzar gratis
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/features')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-700 text-[0.8rem] font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                  <Play size={10} className="fill-slate-600 text-slate-600 ml-px" />
                </span>
                Ver cómo funciona
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[0.7rem] text-slate-400">
              {['Sin tarjeta', 'Listo en minutos', 'Soporte incluido'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500" strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end items-end min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
            <img
              src={heroImage}
              alt="Panel de gestión Gestly"
              className="relative z-10 w-auto max-w-[min(100%,360px)] sm:max-w-[400px] lg:max-w-[440px] max-h-[240px] sm:max-h-[280px] lg:max-h-[320px] object-contain object-bottom object-right select-none"
              draggable={false}
            />

            <div className="absolute left-0 sm:left-2 top-[12%] hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 border border-slate-100 shadow-md animate-fadeInUp pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BarChart3 size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold text-slate-800">+24% ventas</p>
                <p className="text-[0.6rem] text-slate-400">vs. semana pasada</p>
              </div>
            </div>
            <div className="absolute right-0 sm:right-2 bottom-[18%] hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 border border-slate-100 shadow-md animate-fadeInUp delay-200 pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Package size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold text-slate-800">Stock bajo</p>
                <p className="text-[0.6rem] text-slate-400">3 productos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trustItems.map(({ icon: Icon, label, sub, color, bg }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={color} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[0.75rem] font-semibold text-slate-800">{label}</p>
                  <p className="text-[0.65rem] text-slate-400 leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
