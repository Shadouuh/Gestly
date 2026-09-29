import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import PageSectionHero from '../../app/components/PageSectionHero';
import LagoomLogo from '../../assets/images/image.png';
import {
  Rocket,
  Globe2,
  Code2,
  Heart,
  Lightbulb,
  Zap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const VALUES = [
  {
    icon: Lightbulb,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    title: 'Simpleza radical',
    desc: 'Si necesitás un manual, fallamos. Intuitivo desde la primera venta.',
  },
  {
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    title: 'Ventas ágiles',
    desc: 'Flujos optimizados para cobrar y gestionar en tiempo récord.',
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    title: 'Accesible para todos',
    desc: 'Tecnología de punta con precios justos para negocios reales.',
  },
];

const PROMISES = [
  { text: 'Sin costos ocultos', icon: ShieldCheck, color: 'text-emerald-500' },
  { text: 'Mejoras constantes', icon: Zap, color: 'text-amber-500' },
  { text: 'Soporte que responde', icon: Heart, color: 'text-rose-500' },
];

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="pt-14">
        <PageSectionHero
          badgeIcon={Heart}
          badgeLabel="Filosofía Gestly"
          badgeVariant="slate"
          title="Pensado para"
          titleHighlight="simplificar"
          description="No creamos herramientas por crear. Diseñamos soluciones que eliminan lo complejo y hacen rentable tu negocio."
        />

        {/* Valores */}
        <section className="max-w-6xl mx-auto px-5 py-8 md:py-10">
          <div className="grid md:grid-cols-3 gap-3">
            {VALUES.map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div
                key={title}
                className={`rounded-xl border ${border} bg-white p-4 hover:shadow-md transition-shadow`}
              >
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} strokeWidth={2.25} />
                </div>
                <h3 className="font-display font-bold text-[0.85rem] text-slate-900 mb-1">{title}</h3>
                <p className="text-[0.72rem] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Misión + visión */}
        <section className="border-t border-slate-200 bg-white py-8 md:py-10">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid lg:grid-cols-2 gap-6 items-start">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 md:p-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                  <Rocket size={18} strokeWidth={2} />
                </div>
                <h2 className="font-display font-bold text-[1.1rem] text-slate-900 leading-tight mb-2">
                  No es solo una app, es tu socio
                </h2>
                <p className="text-[0.75rem] text-slate-600 leading-relaxed mb-4">
                  Detrás de cada negocio hay esfuerzo y sueños. Te damos control de ventas, stock y clientes sin tecnicismos.
                </p>
                <ul className="space-y-2">
                  {PROMISES.map(({ text, icon: Icon, color }) => (
                    <li key={text} className="flex items-center gap-2 text-[0.72rem] font-medium text-slate-700">
                      <Icon size={14} className={color} strokeWidth={2.25} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">

                <div className="inline-flex items-center gap-1.5 text-indigo-600 text-[0.65rem] font-semibold uppercase tracking-wider">
                  <Globe2 size={13} />
                  Visión
                </div>
                <h2 className="font-display font-bold text-[1.1rem] md:text-[1.2rem] text-slate-900 leading-tight">
                  Comercio{' '}
                  <span className="text-blue-600">digital y humano</span>
                </h2>
                <p className="text-[0.75rem] text-slate-500 leading-relaxed">
                  La tecnología no reemplaza el trato personal: lo potencia. Gestly te libera tiempo para vender más y cuidar clientes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lagoom */}
        <section className="max-w-6xl mx-auto px-5 py-8 md:pb-12">
          <div className="relative rounded-xl bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.35),transparent_60%)]" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[0.62rem] font-medium text-white/90 mb-3">
                  <Code2 size={11} />
                  Powered by Lagoom
                </div>
                <h2 className="font-display font-bold text-[1.1rem] text-white leading-tight mb-2">
                  {t('about.lagoom.title')}
                </h2>
                <p className="text-[0.72rem] text-slate-400 leading-relaxed mb-4 max-w-sm mx-auto md:mx-0">
                  Factoría de soluciones digitales. Creamos productos que marcan la diferencia, de apps móviles a plataformas empresariales.
                </p>
                <a
                  href="https://lagoom.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-slate-900 text-[0.75rem] font-semibold hover:bg-blue-50 transition-colors"
                >
                  Conocer Lagoom
                  <ArrowRight size={13} strokeWidth={2.5} />
                </a>
              </div>
              <div className="flex-shrink-0 rounded-lg bg-white/10 border border-white/15 p-4">
                <img
                  src={LagoomLogo}
                  alt="Lagoom"
                  className="w-28 md:w-32 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
