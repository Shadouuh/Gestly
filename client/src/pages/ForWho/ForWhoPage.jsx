import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Shirt,
  Package,
  Coffee,
  Pill,
  Wrench,
  Rocket,
  Store,
  ShoppingBag,
  BarChart3,
  Users,
  Bell,
  WifiOff,
  Smartphone,
  Scan,
  CreditCard,
  ChefHat,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import PageSectionHero from '../../app/components/PageSectionHero';

const WHO_CARDS = [
  {
    icon: Shirt,
    title: 'Tiendas físicas',
    sub: 'Ropa, calzado, accesorios, bazar',
    desc: 'Controlá variantes, rotación y ventas en mostrador sin planillas.',
    bullets: [
      'POS rápido con descuentos',
      'Stock por talle, color o variante',
      'Top de productos más vendidos',
      'Clientes con historial de compras',
    ],
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    icon: Package,
    title: 'Negocios con stock',
    sub: 'Depósitos, mayoristas, distribuidores',
    desc: 'Volúmenes grandes con alertas, movimientos y reposición ordenada.',
    bullets: [
      'Stock avanzado por unidad',
      'Alertas de faltantes automáticas',
      'Lista de compras sugerida',
      'Historial de entradas y salidas',
    ],
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    border: 'border-indigo-100',
  },
  {
    icon: Coffee,
    title: 'Cafeterías y restós',
    sub: 'Bares, confiterías, comidas rápidas',
    desc: 'Insumos, recetas y ventas por turno en un solo flujo.',
    bullets: [
      'Recetas que descuentan ingredientes',
      'Control de insumos en tiempo real',
      'Ventas por turno y método de pago',
      'Menú y productos elaborados',
    ],
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    border: 'border-amber-100',
  },
  {
    icon: Pill,
    title: 'Farmacias y dietéticas',
    sub: 'Salud, bienestar y perfumería',
    desc: 'Stock crítico, clientes frecuentes y trazabilidad sin libreta.',
    bullets: [
      'Alertas de stock bajo y vencimientos',
      'Clientes con notas y historial',
      'Búsqueda rápida por nombre o código',
      'Reportes de rotación por producto',
    ],
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    icon: Wrench,
    title: 'Ferreterías y servicios',
    sub: 'Herramientas, materiales, repuestos',
    desc: 'Catálogo amplio, precios diferenciados y fiados bajo control.',
    bullets: [
      'Miles de ítems buscables al instante',
      'Precio mayorista y minorista',
      'Fiados y cuenta corriente',
      'Código de barras en caja',
    ],
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    border: 'border-orange-100',
  },
  {
    icon: Rocket,
    title: 'Emprendedores',
    sub: 'Negocios que arrancan o escalan',
    desc: 'Empezá gratis y sumá funciones cuando tu negocio crece.',
    bullets: [
      'Plan Free sin tarjeta',
      'Plantillas por rubro para arrancar',
      'Interfaz simple, sin capacitación',
      'Escala a Essential o Pro',
    ],
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    border: 'border-violet-100',
  },
];

const CORE_TOOLS = [
  {
    icon: ShoppingBag,
    title: 'Punto de venta',
    desc: 'Cobrá en segundos, con o sin lector. Efectivo, tarjeta o transferencia.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Package,
    title: 'Inventario',
    desc: 'Stock simple o avanzado, alertas y movimientos automáticos con cada venta.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: BarChart3,
    title: 'Reportes',
    desc: 'Ventas del día, semana y mes. Productos top y márgenes sin sumar a mano.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Users,
    title: 'Clientes',
    desc: 'Base de clientes, fiados e historial. Búsqueda por nombre o teléfono.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Bell,
    title: 'Alertas',
    desc: 'Aviso antes de quedarte sin lo que más vendés. Lista de compras incluida.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Building2,
    title: 'Multi-sucursal',
    desc: 'Varios locales, stock por sucursal y panel consolidado (plan Pro).',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    icon: Scan,
    title: 'Códigos de barras',
    desc: 'Escaneá productos en caja y en carga de mercadería.',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  {
    icon: CreditCard,
    title: 'Fiados',
    desc: 'Cuenta corriente por cliente con saldo siempre visible.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: ChefHat,
    title: 'Recetas',
    desc: 'Productos elaborados que descuentan insumos solos al vender.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Smartphone,
    title: 'Celular y PC',
    desc: 'Misma cuenta en todos los dispositivos, datos sincronizados.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: WifiOff,
    title: 'Modo offline',
    desc: 'Seguí vendiendo sin internet; sincroniza al reconectar.',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  {
    icon: Store,
    title: 'Catálogo',
    desc: 'Productos con foto, precio, categoría y stock en un solo lugar.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

const SCALE_TAGS = [
  '1 persona',
  '2–5 empleados',
  'Equipo grande',
  '1 local',
  'Varias sucursales',
  'Mostrador + online',
];

const ForWhoPage = () => {
  const navigate = useNavigate();

  return (


    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="pt-14">
        <PageSectionHero
          badgeIcon={Target}
          badgeLabel="Beneficios"
          badgeVariant="blue"
          title="Gestly encaja en tu negocio."
          titleHighlight="Sea cual sea el rubro."
          description="Si vendés productos o servicios y necesitás orden, stock y ventas claras, estas herramientas están pensadas para vos."
          chips={[
            { icon: ShoppingBag, label: 'Ventas', active: true },
            { icon: Package, label: 'Stock' },
            { icon: Users, label: 'Clientes' },
            { icon: BarChart3, label: 'Datos' },
            { icon: Store, label: 'Locales' },
          ]}
        />

        {/* Herramientas core */}
        <section className="max-w-6xl mx-auto px-5 py-8 md:py-10">

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
              Qué incluye Gestly
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {CORE_TOOLS.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={color} strokeWidth={2.25} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[0.78rem] font-semibold text-slate-900 leading-tight">{title}</h3>
                  <p className="text-[0.68rem] text-slate-500 leading-snug mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Por rubro */}
        <section className="border-t border-slate-200 bg-white py-8 md:py-10">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-6 max-w-md mx-auto">
              <h2 className="font-display font-bold text-[1.15rem] text-slate-900">
                Beneficios según tu tipo de negocio
              </h2>
              <p className="text-[0.75rem] text-slate-500 mt-1">
                Misma plataforma, adaptada a cómo trabajás cada día
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {WHO_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`rounded-xl border ${card.border} bg-white p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-3 mb-3">

                      <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={17} className={card.iconColor} strokeWidth={2.25} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-[0.85rem] text-slate-900 leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-[0.62rem] text-slate-400 font-medium mt-0.5">{card.sub}</p>
                      </div>
                    </div>
                    <p className="text-[0.72rem] text-slate-600 leading-relaxed mb-3 flex-1">{card.desc}</p>
                    <ul className="space-y-1.5 border-t border-slate-100 pt-3">
                      {card.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-[0.68rem] text-slate-700 leading-snug">
                          <CheckCircle2 size={12} className={`${card.iconColor} flex-shrink-0 mt-0.5`} strokeWidth={2.5} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Escala */}
        <section className="py-8 md:py-10 px-5 border-t border-slate-200">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white mb-4">
              <Store size={18} strokeWidth={2} />
            </div>
            <h2 className="font-display font-bold text-[1.15rem] text-slate-900 leading-tight mb-2">
              Si vendés algo, <span className="text-blue-600">Gestly es para vos</span>
            </h2>
            <p className="text-[0.75rem] text-slate-500 mb-5 max-w-sm mx-auto leading-relaxed">
              10 productos o 10.000. Solo o con equipo. Un local o varias sucursales.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-6">
              {SCALE_TAGS.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[0.68rem] font-medium text-slate-600"
                >
                  <CheckCircle2 size={11} className="text-emerald-500" strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[0.8rem] font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
            >
              Empezar gratis
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
            <p className="mt-3 text-[0.68rem] text-slate-400">Sin tarjeta · Plan Free $0 en pesos argentinos</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForWhoPage;
