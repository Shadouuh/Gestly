import React, { useState } from 'react';
import {
  Check,
  X,
  ArrowRight,
  Shield,
  Gift,
  Sparkles,
  Crown,
  Lock,
  CreditCard,
  RefreshCw,
  Smartphone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import PageSectionHero from '../../app/components/PageSectionHero';

const USD_TO_ARS = 1400;

const formatArs = (amount) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Para probar y arrancar',
    icon: Gift,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    usd: 0,
    popular: false,
    cta: 'Empezar gratis',
    ctaStyle: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    features: [
      'Punto de venta y ventas ilimitadas',
      'Catálogo de productos',
      'Stock simple (disponible / agotado)',
      'Hasta 3 usuarios',
      'Modo offline con sincronización',
      'Tickets de venta',
      'Soporte por chat',
    ],
  },
  {
    key: 'essential',
    name: 'Essential',
    tagline: 'Para negocios en crecimiento',
    icon: Sparkles,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    usd: 4,
    popular: true,
    cta: 'Elegir Essential',
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25',
    features: [
      'Todo lo incluido en Free',
      'Estadísticas y reportes básicos',
      'Clientes ilimitados y fiados',
      'Stock avanzado con movimientos',
      'Alertas de stock bajo',
      'Plantillas por rubro',
      'Asistente inteligente',
      'Carga de stock con IA (foto factura)',
      'Gestión de empleados y permisos',
      'Lista de compras sugerida',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'Máximo control multi-local',
    icon: Crown,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    usd: 7,
    popular: false,
    cta: 'Elegir Pro',
    ctaStyle: 'bg-slate-900 text-white hover:bg-slate-800',
    features: [
      'Todo lo incluido en Essential',
      'Multi-sucursal (varios locales)',
      'Transferencias entre sucursales',
      'Reportes avanzados exportables',
      'Recetas y productos elaborados',
      'Descuentos y promociones avanzadas',
      'Soporte prioritario',
      'Acceso anticipado a nuevas funciones',
    ],
  },
];

const COMPARISON = [
  { label: 'Punto de venta', free: true, essential: true, pro: true },
  { label: 'Catálogo de productos', free: true, essential: true, pro: true },
  { label: 'Stock simple', free: true, essential: true, pro: true },
  { label: 'Stock avanzado + alertas', free: false, essential: true, pro: true },
  { label: 'Usuarios', free: '3', essential: 'Ilimitados', pro: 'Ilimitados' },
  { label: 'Modo offline', free: true, essential: true, pro: true },
  { label: 'Estadísticas y reportes', free: false, essential: true, pro: true },
  { label: 'Clientes y fiados', free: false, essential: true, pro: true },
  { label: 'Asistente inteligente', free: false, essential: true, pro: true },
  { label: 'Carga de stock con IA', free: false, essential: true, pro: true },
  { label: 'Gestión de empleados', free: false, essential: true, pro: true },
  { label: 'Multi-sucursal', free: false, essential: false, pro: true },
  { label: 'Reportes exportables avanzados', free: false, essential: false, pro: true },
  { label: 'Soporte prioritario', free: false, essential: false, pro: true },
];

const FAQ_ITEMS = [
  {
    q: '¿Necesito tarjeta para el plan Free?',
    a: 'No. Free es $0 y no pide método de pago. Creás la cuenta y empezás al toque.',
  },
  {
    q: '¿Cómo se calculan los precios en pesos?',
    a: `Mostramos precios en pesos argentinos con tipo de cambio de referencia US$ 1 = $${USD_TO_ARS.toLocaleString('es-AR')} ARS. Essential: ${formatArs(4 * USD_TO_ARS)}/mes · Pro: ${formatArs(7 * USD_TO_ARS)}/mes.`,
  },
  {
    q: '¿Puedo cambiar de plan después?',
    a: 'Sí. Podés subir o bajar de plan cuando quieras desde Configuración.',
  },
  {
    q: '¿Funciona sin internet?',
    a: 'Sí. Gestly funciona offline en todos los planes y sincroniza cuando volvés a tener conexión.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin contratos ni permanencia mínima.',
  },
];

const CellValue = ({ value }) => {
  if (value === true) return <Check size={14} className="text-emerald-500 mx-auto" strokeWidth={2.5} />;
  if (value === false) return <X size={14} className="text-slate-300 mx-auto" strokeWidth={2.5} />;
  return <span className="text-[0.7rem] font-medium text-slate-600">{value}</span>;
};

const Pricing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (

    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="pt-14">
        <PageSectionHero
          badgeIcon={Shield}
          badgeLabel="Precios"
          badgeVariant="emerald"
          title="Planes claros en"
          titleHighlight="pesos argentinos"
          description={`Free, Essential y Pro. Referencia: US$ 0 · US$ 4 · US$ 7 al mes (US$ 1 = ${USD_TO_ARS.toLocaleString('es-AR')} ARS).`}
          chips={[
            { icon: Gift, label: 'Free', active: true },
            { icon: Sparkles, label: 'Essential' },
            { icon: Crown, label: 'Pro' },
          ]}
        />

        {/* Plan cards */}
        <section className="max-w-6xl mx-auto px-5 py-8 md:py-10">
          <div className="grid md:grid-cols-3 gap-3 items-stretch">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const ars = plan.usd * USD_TO_ARS;
              return (
                <div
                  key={plan.key}
                  className={`relative flex flex-col rounded-xl border bg-white p-5 transition-shadow ${
                    plan.popular
                      ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20'
                      : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[0.62rem] font-semibold whitespace-nowrap">
                      Más elegido
                    </span>
                  )}


                  <div className="flex items-start justify-between gap-2 mb-4">

                    <div>
                      <h2 className="font-display font-bold text-[1rem] text-slate-900">{plan.name}</h2>
                      <p className="text-[0.68rem] text-slate-500 mt-0.5">{plan.tagline}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-lg ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={17} className={plan.iconColor} strokeWidth={2.25} />
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <p className="font-display font-bold text-[1.5rem] text-slate-900 leading-none tabular-nums">
                      {formatArs(ars)}
                    </p>
                    <p className="text-[0.68rem] text-slate-500 mt-1">
                      {plan.usd === 0 ? 'Gratis para siempre' : 'por mes · precio en ARS'}
                    </p>
                    {plan.usd > 0 && (
                      <p className="text-[0.62rem] text-slate-400 mt-0.5">
                        Referencia: US$ {plan.usd}/mes
                      </p>
                    )}
                  </div>

                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Incluye
                  </p>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[0.72rem] text-slate-700 leading-snug">
                        <Check
                          size={12}
                          className={`flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-600' : 'text-emerald-500'}`}
                          strokeWidth={2.5}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className={`w-full py-2.5 rounded-lg text-[0.78rem] font-semibold transition-all ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[0.72rem] text-slate-400 mt-6">
            ¿Dudas?{' '}
            <a href="/contact" className="font-semibold text-blue-600 hover:underline">
              Escribinos
            </a>
            {' '}y te ayudamos a elegir plan.
          </p>
        </section>

        {/* Comparison table */}
        <section className="border-t border-slate-200 bg-white py-8 md:py-10">
          <div className="max-w-5xl mx-auto px-5">
            <h2 className="font-display font-bold text-[1.1rem] text-slate-900 text-center mb-1">
              Compará planes de un vistazo
            </h2>
            <p className="text-[0.75rem] text-slate-500 text-center mb-6">
              Qué incluye cada nivel, sin leer letra chica
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-[0.68rem] font-semibold text-slate-500 w-[40%]">
                      Funcionalidad
                    </th>
                    {['Free', 'Essential', 'Pro'].map((name) => (
                      <th key={name} className="px-3 py-2.5 text-[0.72rem] font-bold text-slate-900 text-center w-[20%]">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr
                      key={row.label}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="px-3 py-2 text-[0.72rem] font-medium text-slate-700 border-t border-slate-100">
                        {row.label}
                      </td>
                      <td className="px-3 py-2 text-center border-t border-slate-100">
                        <CellValue value={row.free} />
                      </td>
                      <td className="px-3 py-2 text-center border-t border-slate-100">
                        <CellValue value={row.essential} />
                      </td>
                      <td className="px-3 py-2 text-center border-t border-slate-100">
                        <CellValue value={row.pro} />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td className="px-3 py-2.5 text-[0.72rem] font-semibold text-slate-800">Precio / mes (ARS)</td>
                    <td className="px-3 py-2.5 text-center text-[0.72rem] font-bold text-slate-900 tabular-nums">
                      {formatArs(0)}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[0.72rem] font-bold text-blue-600 tabular-nums">
                      {formatArs(4 * USD_TO_ARS)}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[0.72rem] font-bold text-slate-900 tabular-nums">
                      {formatArs(7 * USD_TO_ARS)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-6 border-y border-slate-200 bg-slate-50">
          <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {[
              { icon: Lock, text: 'Sin compromisos' },
              { icon: CreditCard, text: 'Free sin tarjeta' },
              { icon: RefreshCw, text: 'Cancelás cuando quieras' },
              { icon: Smartphone, text: 'Funciona offline' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-slate-600">
                <Icon size={13} className="text-blue-500" strokeWidth={2.25} />
                {text}
              </span>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-8 md:py-10 px-5">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <HelpCircle size={16} className="text-slate-400" />
              <h2 className="font-display font-bold text-[1.1rem] text-slate-900">Preguntas frecuentes</h2>
            </div>

            <div className="space-y-2">
              {FAQ_ITEMS.map((item, i) => (

                <div key={item.q} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-[0.78rem] font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    {item.q}
                    {openFaq === i ? (
                      <ChevronUp size={15} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={15} className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3 text-[0.75rem] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 py-10 px-5">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600/20 text-blue-300 mb-4">
              <Gift size={20} strokeWidth={2} />
            </div>
            <h2 className="font-display font-bold text-[1.2rem] text-white leading-tight mb-2">
              Empezá con Free hoy
            </h2>
            <p className="text-[0.75rem] text-slate-400 mb-5 max-w-xs mx-auto">
              $0 en pesos argentinos. Sin tarjeta. Subís a Essential o Pro cuando lo necesites.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-[0.8rem] font-semibold hover:bg-blue-50 transition-colors"
            >
              Crear cuenta gratis
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
