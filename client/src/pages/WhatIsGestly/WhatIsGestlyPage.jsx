import React from 'react';
import {
  ArrowRight,
  Smartphone,
  Box,
  Layers,
  LayoutTemplate,
  Camera,
  ChefHat,
  Store,
  ShoppingCart,
  CreditCard,
  Users,
  PieChart,
  Calculator,
  Percent,
  Bell,
  WifiOff,
  ShoppingBag,
  Receipt,
  BarChart3,
  Scan,
  Truck,
  FileBarChart,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import PageSectionHero from '../../app/components/PageSectionHero';

const categories = [
  {
    id: 'sell',
    label: 'Vender',
    features: [
      {
        icon: ShoppingBag,
        title: 'Punto de venta',
        desc: 'Registrá ventas en segundos desde celular o PC.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        icon: Calculator,
        title: 'Caja y arqueo',
        desc: 'Apertura, cierre y control del efectivo del día.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        icon: Percent,
        title: 'Descuentos y promos',
        desc: 'Ofertas por producto, combo o ticket completo.',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
      },
      {
        icon: Scan,
        title: 'Código de barras',
        desc: 'Escaneá y vendé sin buscar en la lista.',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
      },
      {
        icon: Receipt,
        title: 'Tickets',
        desc: 'Comprobante digital o impreso al instante.',
        color: 'text-slate-600',
        bg: 'bg-slate-100',
      },
      {
        icon: WifiOff,
        title: 'Modo offline',
        desc: 'Seguí vendiendo aunque se corte internet.',
        color: 'text-gray-600',
        bg: 'bg-gray-100',
      },
    ],
  },
  {
    id: 'stock',
    label: 'Stock',
    features: [
      {
        icon: Box,
        title: 'Stock simple',
        desc: 'Disponible / agotado con un toque.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        icon: Layers,
        title: 'Stock avanzado',
        desc: 'Unidades, entradas, salidas y mermas.',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
      },
      {
        icon: Bell,
        title: 'Alertas',
        desc: 'Aviso antes de quedarte sin mercadería.',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
      {
        icon: LayoutTemplate,
        title: 'Plantillas',
        desc: 'Catálogo inicial por rubro en minutos.',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
      },
      {
        icon: Camera,
        title: 'Carga con foto',
        desc: 'Foto a la factura y el stock se actualiza.',
        color: 'text-fuchsia-600',
        bg: 'bg-fuchsia-50',
      },
      {
        icon: ChefHat,
        title: 'Recetas',
        desc: 'Ingredientes que se descuentan solos al vender.',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      },
      {
        icon: ShoppingCart,
        title: 'Lista de compras',
        desc: 'Qué reponer, generado desde tu inventario.',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
      },
      {
        icon: Truck,
        title: 'Proveedores',
        desc: 'Pedidos y reposición organizados.',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
      },
    ],
  },
  {
    id: 'clients',
    label: 'Clientes',
    features: [
      {
        icon: Users,
        title: 'Base de clientes',
        desc: 'Datos, historial y búsqueda al instante.',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
      },
      {
        icon: CreditCard,
        title: 'Fiados',
        desc: 'Cuenta corriente controlada por cliente.',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
      },
    ],
  },
  {
    id: 'insights',
    label: 'Datos',
    features: [
      {
        icon: PieChart,
        title: 'Estadísticas',
        desc: 'Ventas, márgenes y productos top al día.',
        color: 'text-sky-600',
        bg: 'bg-sky-50',
      },
      {
        icon: BarChart3,
        title: 'Reportes',
        desc: 'Resumen diario, semanal y mensual automático.',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
      },
      {
        icon: FileBarChart,
        title: 'Exportar',
        desc: 'Datos listos para tu contador.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
    ],
  },
  {
    id: 'team',
    label: 'Equipo y locales',
    features: [
      {
        icon: Store,
        title: 'Multi-sucursal',
        desc: 'Varios locales, un panel central.',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
      },
      {
        icon: Users,
        title: 'Empleados',
        desc: 'Usuarios con permisos por rol.',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      },
      {
        icon: Smartphone,
        title: 'Multiplataforma',
        desc: 'Celular, tablet o PC, siempre sincronizado.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
    ],
  },
];

const FeatureCard = ({ icon: Icon, title, desc, color, bg }) => (
  <div className="group flex gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
      <Icon size={16} className={color} strokeWidth={2.25} />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-[0.8rem] font-semibold text-slate-900 leading-tight">{title}</h3>
      <p className="text-[0.72rem] text-slate-500 leading-snug mt-1">{desc}</p>
    </div>
  </div>
);

const WhatIsGestly = () => {
  const navigate = useNavigate();
  const totalFeatures = categories.reduce((n, c) => n + c.features.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="pt-14">
        <PageSectionHero
          badgeIcon={Sparkles}
          badgeLabel="Características"
          badgeVariant="blue"
          title="Todo lo que podés hacer con"
          titleHighlight="Gestly"
          description={`${totalFeatures} herramientas en una sola app. Diseñadas para ahorrar tiempo, automatizar procesos y hacer crecer tu negocio.`}
          chips={[
            { icon: Sparkles, label: 'Todos', active: true },
            { icon: ShoppingBag, label: 'Ventas' },
            { icon: Users, label: 'Clientes' },
            { icon: BarChart3, label: 'Datos' },
            { icon: Store, label: 'Locales' },
          ]}
        />

        {/* Grid por categoría */}
        <section className="max-w-6xl mx-auto px-5 py-8 md:py-10 space-y-10">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                  {cat.label}
                </span>
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[0.62rem] font-medium text-slate-400 tabular-nums">
                  {cat.features.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {cat.features.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA compacto */}
        <section className="border-t border-slate-200 bg-slate-900">
          <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-blue-300 mb-1">
                Listo en minutos
              </p>
              <h2 className="font-display font-bold text-[1.15rem] text-white leading-tight">
                Probá todo esto gratis
              </h2>
              <p className="text-[0.75rem] text-slate-400 mt-1">Sin tarjeta · Sin instalación</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-[0.8rem] font-semibold hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              Empezar gratis
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WhatIsGestly;
