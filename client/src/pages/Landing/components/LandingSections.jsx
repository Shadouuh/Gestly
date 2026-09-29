import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart2,
  Package,
  Users,
  CheckCircle2,
  Bell,
  Shield,
  Heart,
  Store,
  Star,
  Timer,
  NotebookPen,
  Banknote,
  ShoppingCart,
  LineChart,
  Gift,
  Rocket,
  Sparkles,
  Handshake,
} from 'lucide-react';

import stockSimpleImg from '../../../assets/images/features/StockSimple.png';
import estadisticasImg from '../../../assets/images/features/Estadisticas.png';
import cajaImg from '../../../assets/images/features/Caja.png';
import alertaImg from '../../../assets/images/features/AlertaStock.png';

const SectionBadge = ({ color = 'blue', children }) => {
  const palettes = {
    blue: { dot: 'bg-blue-500', wrap: 'bg-blue-50 border-blue-100 text-blue-700' },
    amber: { dot: 'bg-amber-500', wrap: 'bg-amber-50 border-amber-100 text-amber-700' },
    emerald: { dot: 'bg-emerald-500', wrap: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    slate: { dot: 'bg-slate-400', wrap: 'bg-slate-100 border-slate-200 text-slate-600' },
    violet: { dot: 'bg-violet-500', wrap: 'bg-violet-50 border-violet-100 text-violet-700' },
  };
  const p = palettes[color] || palettes.blue;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.7rem] font-medium ${p.wrap}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.dot}`} />
      {children}
    </div>
  );
};

// ─── PRUEBA SOCIAL ───────────────────────────────────────────────────────────
export const SocialProofSection = () => (
  <section className="py-8 bg-white border-b border-slate-100">
    <div className="max-w-5xl mx-auto px-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-slate-100">
        {[
          { number: '+100', label: 'negocios activos', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
          { number: '4.9', label: 'valoración promedio', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { number: '5 min', label: 'para arrancar', icon: Timer, color: 'text-violet-600', bg: 'bg-violet-50' },
          { number: '0', label: 'libretas necesarias', icon: NotebookPen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(({ number, label, icon: Icon, color, bg }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center md:px-5 py-1">

            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} strokeWidth={2.25} />
            </div>
            <p className="font-display font-bold text-[1.35rem] text-slate-900 leading-none tabular-nums">{number}</p>
            <p className="text-[0.68rem] text-slate-400 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── PROBLEMA ────────────────────────────────────────────────────────────────
export const ProblemSection = () => (
  <section className="py-14 md:py-16 bg-slate-50/80">
    <div className="max-w-4xl mx-auto px-5 text-center">
      <SectionBadge color="amber">¿Te suena familiar?</SectionBadge>
      <h2 className="font-display font-bold text-[1.5rem] md:text-[1.75rem] text-slate-900 leading-tight tracking-tight mt-4 mb-2">
        Todavía usás la libreta.
        <span className="text-amber-600"> Y eso te cuesta plata.</span>
      </h2>
      <p className="text-[0.8rem] text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
        Cada día sin control real de tu negocio, perdés dinero sin darte cuenta.
      </p>
      <div className="grid sm:grid-cols-3 gap-3 text-left">
        {[
          {
            icon: NotebookPen,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'Excel o libreta para todo',
            sub: 'Siempre hay un error que no encontrás.',
          },
          {
            icon: Package,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            text: 'No sabés qué stock tenés',
            sub: 'Hasta que el cliente lo pide y ya no está.',
          },
          {
            icon: Banknote,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            text: 'Perdés ventas sin darte cuenta',
            sub: 'Sin registro, el dinero desaparece.',
          },
        ].map(({ icon: Icon, color, bg, border, text, sub }) => (
          <div key={text} className={`bg-white border ${border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>


            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={17} className={color} strokeWidth={2.25} />
            </div>
            <p className="font-semibold text-slate-800 text-[0.8rem] leading-snug mb-1">{text}</p>
            <p className="text-[0.72rem] text-slate-500 leading-snug">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── SOLUCIÓN ─────────────────────────────────────────────────────────────────
export const SolutionSection = () => (
  <section className="py-14 md:py-16 bg-white">
    <div className="max-w-5xl mx-auto px-5">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="space-y-4">
          <SectionBadge color="blue">La solución</SectionBadge>
          <h2 className="font-display font-bold text-[1.5rem] md:text-[1.75rem] text-slate-900 leading-tight tracking-tight">
            Gestly te organiza todo.
            <span className="text-blue-600"> Sin complicaciones.</span>
          </h2>
          <p className="text-[0.8rem] text-slate-500 leading-relaxed max-w-md">
            Nada de libretas ni planillas eternas. Entrás y tenés ventas, stock y clientes en un solo lugar.
          </p>
          <div className="space-y-1.5 pt-1">
            {[
              { icon: BarChart2, label: 'Ventas registradas al instante', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Package, label: 'Stock siempre actualizado', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { icon: Users, label: 'Clientes organizados', color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={color} strokeWidth={2.25} />
                </div>
                <span className="font-medium text-slate-700 text-[0.8rem]">{label}</span>
                <CheckCircle2 size={14} className="text-emerald-500 ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-br from-blue-50 to-indigo-100/80 rounded-2xl" />
          <img src={cajaImg} alt="Panel de ventas Gestly" className="relative rounded-xl shadow-lg w-full border border-white/90" />
        </div>
      </div>
    </div>
  </section>
);

// ─── BENEFICIOS ───────────────────────────────────────────────────────────────

export const BenefitsSection = () => (
  <section className="py-14 md:py-16 bg-slate-50/80">
    <div className="max-w-5xl mx-auto px-5 space-y-14">
      <div className="text-center max-w-lg mx-auto">
        <SectionBadge color="emerald">Resultados reales</SectionBadge>
        <h2 className="font-display font-bold text-[1.5rem] md:text-[1.75rem] text-slate-900 tracking-tight leading-tight mt-4">
          No hablamos de funciones.
          <span className="text-emerald-600"> Hablamos de lo que ganás.</span>
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-2.5 bg-gradient-to-br from-emerald-50 to-teal-100/80 rounded-2xl" />
          <img src={stockSimpleImg} alt="Control de stock" className="relative rounded-xl shadow-lg w-full border border-white/90" />
        </div>
        <div className="order-1 lg:order-2 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Package size={18} className="text-emerald-600" strokeWidth={2.25} />
          </div>
          <h3 className="font-display font-bold text-[1.25rem] text-slate-900 leading-tight">
            Controlás tu stock <span className="text-emerald-600">en tiempo real</span>
          </h3>
          <p className="text-[0.8rem] text-slate-500 leading-relaxed">
            Sabés cuánto tenés de cada producto. Sin contar a mano ni sorpresas en el mostrador.
          </p>
          <ul className="space-y-1.5">
            {['Stock actualizado con cada venta', 'Alertas cuando falta mercadería', 'Historial de movimientos'].map((b) => (
              <li key={b} className="flex items-center gap-2 text-[0.78rem] text-slate-700 font-medium">
                <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">

        <div className="space-y-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <BarChart2 size={18} className="text-blue-600" strokeWidth={2.25} />
          </div>
          <h3 className="font-display font-bold text-[1.25rem] text-slate-900 leading-tight">
            Ves tus ventas <span className="text-blue-600">al instante</span>
          </h3>
          <p className="text-[0.8rem] text-slate-500 leading-relaxed">
            No esperás al cierre para sumar a mano. Sabés cuánto vendiste hoy, esta semana y este mes.
          </p>
          <ul className="space-y-1.5">
            {['Resumen diario automático', 'Comparativa semana a semana', 'Top de productos siempre visible'].map((b) => (
              <li key={b} className="flex items-center gap-2 text-[0.78rem] text-slate-700 font-medium">
                <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-2.5 bg-gradient-to-br from-blue-50 to-indigo-100/80 rounded-2xl" />
          <img src={estadisticasImg} alt="Estadísticas" className="relative rounded-xl shadow-lg w-full border border-white/90" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-2.5 bg-gradient-to-br from-amber-50 to-orange-100/80 rounded-2xl" />
          <img src={alertaImg} alt="Alertas de stock" className="relative rounded-xl shadow-lg w-full border border-white/90" />
        </div>

        <div className="order-1 lg:order-2 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bell size={18} className="text-amber-600" strokeWidth={2.25} />
          </div>
          <h3 className="font-display font-bold text-[1.25rem] text-slate-900 leading-tight">
            Nunca más sin stock <span className="text-amber-600">inesperado</span>
          </h3>
          <p className="text-[0.8rem] text-slate-500 leading-relaxed">
            Te avisamos antes de que se acabe lo que más vendés. Repuesto a tiempo, sin perder ventas.
          </p>
          <ul className="space-y-1.5">
            {['Alertas automáticas por producto', 'Lista de compras sugerida', 'Menos "no tenemos" en el mostrador'].map((b) => (
              <li key={b} className="flex items-center gap-2 text-[0.78rem] text-slate-700 font-medium">
                <CheckCircle2 size={13} className="text-amber-600 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// ─── CÓMO FUNCIONA ─────────────────────────────────────────────────────────────
export const HowItWorksSection = () => (
  <section className="py-14 md:py-16 bg-white">

    <div className="max-w-3xl mx-auto px-5 text-center">
      <SectionBadge color="slate">Así de simple</SectionBadge>
      <h2 className="font-display font-bold text-[1.5rem] md:text-[1.75rem] text-slate-900 tracking-tight leading-tight mt-4 mb-2">
        Tres pasos.
        <span className="text-blue-600"> Y ya estás vendiendo.</span>
      </h2>
      <p className="text-[0.8rem] text-slate-500 mb-10 max-w-xs mx-auto">
        Sin tutoriales largos. Entrás y listo.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 relative">

        <div className="hidden sm:block absolute top-5 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        {[
          { n: '1', icon: Package, title: 'Cargás productos', sub: 'Con o sin foto, en minutos.', ring: 'ring-blue-100', bg: 'bg-blue-600' },
          { n: '2', icon: ShoppingCart, title: 'Empezás a vender', sub: 'Registrás cada venta al instante.', ring: 'ring-indigo-100', bg: 'bg-indigo-600' },
          { n: '3', icon: LineChart, title: 'Ves todo en orden', sub: 'Stock y ventas siempre al día.', ring: 'ring-violet-100', bg: 'bg-violet-600' },
        ].map(({ n, icon: Icon, title, sub, ring, bg }) => (
          <div key={n} className="relative flex flex-col items-center text-center px-2">
            <div className={`w-11 h-11 rounded-xl ${bg} text-white flex items-center justify-center shadow-md shadow-slate-200 mb-3 ring-4 ${ring}`}>
              <Icon size={18} strokeWidth={2.25} />
            </div>
            <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-slate-400 mb-1">Paso {n}</span>
            <p className="font-semibold text-slate-900 text-[0.82rem] mb-0.5">{title}</p>
            <p className="text-[0.72rem] text-slate-400 leading-snug">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── PRECIO ────────────────────────────────────────────────────────────────────
export const PricingTeaseSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-14 md:py-16 bg-slate-50/80">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-10 max-w-md mx-auto">
          <SectionBadge color="emerald">Sin letra chica</SectionBadge>
          <h2 className="font-display font-bold text-[1.5rem] md:text-[1.75rem] text-slate-900 tracking-tight leading-tight mt-4 mb-2">
            Empezá gratis.
            <span className="text-emerald-600"> Pagás cuando lo necesitás.</span>
          </h2>
          <p className="text-[0.8rem] text-slate-500">Sin compromisos ni costos ocultos.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-[1.05rem] text-slate-900">Gratis</h3>
                <p className="text-[0.68rem] text-slate-400 mt-0.5">Para empezar sin riesgo</p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Gift size={17} className="text-emerald-600" />
              </div>
            </div>
            <ul className="space-y-1.5 mb-5 flex-1">
              {['Ventas ilimitadas', 'Stock básico', 'Hasta 3 usuarios', 'Soporte por chat'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-[0.78rem] text-slate-600">
                  <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[0.78rem] hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              Empezar gratis
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-lg bg-white/10 text-white text-[0.62rem] font-semibold flex items-center gap-1">
              <Sparkles size={10} />
              Popular
            </div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-[1.05rem] text-white">Pro</h3>
                <p className="text-[0.68rem] text-slate-400 mt-0.5">Todo desbloqueado</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Rocket size={17} className="text-blue-300" />
              </div>
            </div>
            <ul className="space-y-1.5 mb-5 flex-1">
              {['Todo lo de Gratis', 'Reportes avanzados', 'Usuarios ilimitados', 'Sucursales múltiples', 'Soporte prioritario'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-[0.78rem] text-slate-300">
                  <CheckCircle2 size={13} className="text-blue-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="w-full py-2.5 rounded-lg bg-white text-slate-900 font-semibold text-[0.78rem] hover:bg-blue-50 transition-all inline-flex items-center justify-center gap-1"
            >
              Ver precios
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <p className="text-center text-[0.72rem] text-slate-400">
          ¿Preguntas?{' '}
          <a href="/contact" className="font-semibold text-blue-600 hover:underline">
            Hablá con nosotros
          </a>
        </p>
      </div>
    </section>
  );
};

// ─── DIFERENCIAL ───────────────────────────────────────────────────────────────
export const DifferentiatorSection = () => (
  <section className="py-14 md:py-16 bg-white">
    <div className="max-w-3xl mx-auto px-5 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 mb-5">
        <Handshake size={24} strokeWidth={2} />
      </div>
      <h2 className="font-display font-bold text-[1.5rem] md:text-[1.75rem] text-slate-900 tracking-tight leading-tight mb-3">
        No somos una empresa gigante.
        <span className="text-blue-600"> Somos tu equipo de gestión.</span>
      </h2>
      <p className="text-[0.8rem] text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
        Entendemos lo que es llevar un negocio solo, con poco tiempo y muchas ganas. Gestly es directo, sin vueltas ni tecnicismos.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { icon: Heart, text: 'Hecho con dedicación', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
          { icon: Sparkles, text: 'Siempre mejorando', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
          { icon: Users, text: 'Pensado para vos', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
        ].map(({ icon: Icon, text, color, bg }) => (
          <div key={text} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${bg} text-[0.75rem] font-medium text-slate-700`}>
            <Icon size={13} className={color} strokeWidth={2.25} />
            {text}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA FINAL ─────────────────────────────────────────────────────────────────
export const CtaFinalSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 md:py-20 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.25),transparent_55%)]" />
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="relative z-10 max-w-lg mx-auto px-5 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[0.7rem] font-medium text-blue-100 mb-5">
          <Shield size={12} />
          Plan básico gratis para siempre
        </div>
        <h2 className="font-display font-bold text-[1.5rem] md:text-[1.85rem] text-white leading-tight tracking-tight mb-3">
          Empezá hoy.
          <span className="block text-blue-300">Sin complicarte.</span>
        </h2>
        <p className="text-slate-400 text-[0.8rem] mb-8 leading-relaxed max-w-xs mx-auto">
          En menos de 5 minutos tenés tu negocio funcionando. Sin tarjeta, sin ayuda externa.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold text-[0.82rem] hover:bg-blue-50 shadow-xl shadow-black/20 hover:-translate-y-px transition-all"
        >
          Empezar gratis ahora
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
};
