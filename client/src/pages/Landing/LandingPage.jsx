import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, PlayCircle, Zap, Box, BarChart3, ShieldCheck,
  Store, Warehouse, Truck, ShoppingCart, Wrench, CakeSlice, CupSoda, LayoutGrid,
  CheckCircle2, Menu, X,
  ShoppingBag, ClipboardList, PackageSearch, Tags, Users, Plug,
  FileText, LineChart, Building2, BadgePercent, UserCog,
  ShieldAlert, PieChart, Rocket,
  Send, CalendarClock, Instagram, Linkedin, Youtube, Facebook, Twitter,
  Star, ChevronLeft, ChevronRight, Pill, UtensilsCrossed, Shirt, Carrot,
  Download, Smartphone, MonitorDown, Beef, Drumstick, Gamepad2, BookOpen, Cpu, PawPrint,
} from 'lucide-react';

/* ── Hook: reveal on scroll ─────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll('.rv');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('rv-on');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ── Transición entre secciones: degradado + doble onda ───
   Se coloca ENTRE la sección que termina en `from` y la que
   empieza en `to`. El color de arriba siempre coincide con
   la sección anterior: imposible que quede invertida. ───── */
const Blend = ({ from, to }) => (
  <div
    aria-hidden
    className="w-full leading-[0]"
    style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }}
  >
    {/* onda única y nítida: solo degradado + curva, sin capas fantasma */}
    <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block h-[52px] w-full sm:h-[80px]">
      <path
        d="M0,52 C240,88 480,8 730,34 C980,60 1200,18 1440,50 L1440,90 L0,90 Z"
        fill={to}
      />
    </svg>
  </div>
);

const Eyebrow = ({ children, dark = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-geist text-[0.58rem] font-semibold uppercase tracking-[0.18em] ${
      dark
        ? 'bg-white/10 text-sky-300 ring-1 ring-white/15'
        : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
    }`}
  >
    {children}
  </span>
);

const NAV_LINKS = [
  { l: 'Producto', id: 'producto' },
  { l: 'Rubros', id: 'rubros' },
  { l: 'Funciones', id: 'funciones' },
  { l: 'Beneficios', id: 'beneficios' },
  { l: 'Contacto', id: 'contacto' },
];

const RUBROS = [
  { icon: Store, label: 'Mayoristas', d: 'Gran volumen y listas de precios.' },
  { icon: Warehouse, label: 'Almacenes', d: 'Stock organizado y pedidos.' },
  { icon: Truck, label: 'Distribuidoras', d: 'Rutas, repartos y entregas.' },
  { icon: ShoppingBag, label: 'Kioscos', d: 'Venta rápida en mostrador.' },
  { icon: ShoppingCart, label: 'Supermercados', d: 'Cajas, góndolas y ofertas.' },
  { icon: Wrench, label: 'Ferreterías', d: 'Miles de SKUs bajo control.' },
  { icon: CakeSlice, label: 'Panaderías', d: 'Producción y venta diaria.' },
  { icon: CupSoda, label: 'Bebidas', d: 'Envases, cajones y reparto.' },
  { icon: Pill, label: 'Farmacias', d: 'Medicamentos y obras sociales.' },
  { icon: UtensilsCrossed, label: 'Gastronomía', d: 'Mesas, delivery y recetas.' },
  { icon: Shirt, label: 'Ropa y calzado', d: 'Talles, colores y temporadas.' },
  { icon: Carrot, label: 'Verdulerías', d: 'Frescura, balanza y ofertas.' },
  { icon: Beef, label: 'Carnicerías', d: 'Cortes, balanza y ofertas.' },
  { icon: Drumstick, label: 'Pollerías', d: 'Frescura y pedidos del día.' },
  { icon: Gamepad2, label: 'Jugueterías', d: 'Temporadas y stock.' },
  { icon: BookOpen, label: 'Librerías', d: 'Útiles y temporada escolar.' },
  { icon: Cpu, label: 'Electrónica', d: 'Garantías y números de serie.' },
  { icon: PawPrint, label: 'Mascotas', d: 'Alimento y accesorios.' },
  { icon: LayoutGrid, label: 'Y más rubros…', d: 'Se adapta a tu negocio.' },
];

/* Paleta oscura alrededor del #111827 + acento por card */
const RUBRO_SKINS = [
  { card: 'from-[#111827] to-[#232c42]', tile: 'bg-sky-400/15 text-sky-300 ring-sky-400/25' },
  { card: 'from-[#0d1b33] to-[#1e3a5f]', tile: 'bg-blue-400/15 text-blue-300 ring-blue-400/25' },
  { card: 'from-[#0f1f2e] to-[#155e59]', tile: 'bg-teal-300/15 text-teal-200 ring-teal-300/25' },
  { card: 'from-[#191736] to-[#3b3480]', tile: 'bg-indigo-300/15 text-indigo-200 ring-indigo-300/25' },
];

const FEAT_LEFT = [
  { icon: ShoppingBag, t: 'Ventas y POS', d: 'Facturación rápida y sencilla.' },
  { icon: ClipboardList, t: 'Compras', d: 'Control de proveedores y costos.' },
  { icon: PackageSearch, t: 'Stock en tiempo real', d: 'Con alertas automáticas.' },
  { icon: Tags, t: 'Productos', d: 'Categorías, imágenes y precios.' },
  { icon: Truck, t: 'Proveedores', d: 'Historial y órdenes de compra.' },
  { icon: Users, t: 'Clientes', d: 'Gestión de clientes y precios.' },
];

const FEAT_RIGHT = [
  { icon: FileText, t: 'Facturación integrada', d: 'AFIP, ARCA y otras opciones.' },
  { icon: LineChart, t: 'Reportes', d: 'Tu negocio en tiempo real.' },
  { icon: Building2, t: 'Multi-sucursal', d: 'Todo centralizado.' },
  { icon: BadgePercent, t: 'Control de precios', d: 'Listas, márgenes y actualizaciones.' },
  { icon: UserCog, t: 'Usuarios y permisos', d: 'Tu equipo organizado.' },
  { icon: Plug, t: 'Integraciones', d: 'Con otras herramientas.' },
];

const BENEFITS = [
  { icon: Zap, t: 'Automatizá procesos', d: 'Menos tareas manuales.' },
  { icon: ShieldAlert, t: 'Evitá pérdidas', d: 'Control total del stock.' },
  { icon: PieChart, t: 'Tomá mejores decisiones', d: 'Con datos en tiempo real.' },
  { icon: Rocket, t: 'Escalá tu negocio', d: 'Preparado para crecer.' },
];

const LOGOS = ['Diarco', 'Maxiconsumo', 'VÍTAL', 'COTO', 'Vaguar', 'makro'];

const SOCIALS = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'X (Twitter)' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Youtube, label: 'YouTube' },
];

/* ═══════════ LANDING ═══════════ */
const LandingPage = () => {
  const rootRef = useReveal();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('producto');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const secs = NAV_LINKS.map((n) => document.getElementById(n.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id);
      }),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* ── Carrusel de rubros: arrastre + tilt 3D ── */
  const trackRef = useRef(null);
  const dragState = useRef({ down: false, startX: 0, startScroll: 0 });
  const scrollRubros = (dir) => trackRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  const onTrackDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    if (!el) return;
    dragState.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft };
  };
  const onTrackMove = (e) => {
    const s = dragState.current;
    const el = trackRef.current;
    if (!s.down || !el) return;
    el.scrollLeft = s.startScroll - (e.clientX - s.startX);
  };
  const endTrackDrag = () => { dragState.current.down = false; };
  const handleTilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateY(-6px)`;
  };
  const resetTilt = (e) => { e.currentTarget.style.transform = ''; };

  return (
    <div ref={rootRef} className="min-h-screen bg-white font-urbanist text-slate-900 antialiased">
      <style>{`
        .rv { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .rv-on { opacity: 1; transform: none; }
        .rv-d1 { transition-delay: .1s } .rv-d2 { transition-delay: .18s } .rv-d3 { transition-delay: .26s }
        .bg-dots { background-image: radial-gradient(rgba(37,99,235,.22) 1.5px, transparent 1.5px); background-size: 18px 18px; }
        .bg-dots-dark { background-image: radial-gradient(rgba(255,255,255,.14) 1.4px, transparent 1.4px); background-size: 20px 20px; }
        @keyframes marquee { to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .marquee-mask { -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent); }
      `}</style>

      {/* ═══ NAVBAR — fijo sobre el hero, transparente arriba, sólido al bajar ═══ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-100 bg-white/85 shadow-[0_4px_24px_rgba(15,23,42,0.07)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-heading text-xl font-bold tracking-tight text-slate-900">
            Gestly
          </Link>
          <div className="hidden items-center gap-1.5 lg:flex">
            {NAV_LINKS.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium transition-all ${
                  active === n.id
                    ? 'bg-slate-900/[0.07] font-semibold text-slate-900'
                    : 'text-slate-500 hover:bg-slate-900/[0.04] hover:text-slate-900'
                }`}
              >
                {n.l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-full bg-white/70 px-3.5 py-1.5 text-[0.78rem] font-semibold text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-md transition hover:bg-white/95 hover:text-slate-900 hover:shadow-[0_4px_16px_rgba(15,23,42,0.12)] sm:block">
              Iniciar sesión
            </Link>
            <Link to="/login" className="group hidden items-center gap-1.5 rounded-full bg-[#111827] px-4 py-1.5 text-[0.78rem] font-semibold text-white shadow-lg shadow-black/25 ring-1 ring-white/10 transition hover:-translate-y-px hover:bg-[#1f2937] hover:shadow-xl sm:inline-flex">
              Probar gratis <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-900/[0.05] lg:hidden"
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>
        {/* menú móvil */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 lg:hidden ${
            open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-xl">
            {NAV_LINKS.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-[0.85rem] transition ${
                  active === n.id
                    ? 'bg-slate-900/[0.06] font-semibold text-slate-900'
                    : 'font-medium text-slate-500 hover:bg-slate-900/[0.03]'
                }`}
              >
                {n.l}
                <ArrowRight size={14} className={active === n.id ? 'text-slate-900' : 'text-slate-300'} />
              </a>
            ))}
            <Link
              to="/login"
              className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-[0.85rem] font-semibold text-white"
            >
              Probar gratis <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO — imagen de fondo a lo ancho, texto delante ═══ */}
      <section id="producto" className="relative flex min-h-[94svh] scroll-mt-16 flex-col overflow-hidden bg-gradient-to-b from-[#e6f0ff] via-[#eef4ff] to-white lg:min-h-[92vh]">
        {/* fondo: imagen a sangre completa detrás del texto, sin velos encima.
            La altura ~92vh iguala el aspecto 16:9 y el recorte es mínimo. */}
        <div className="absolute inset-0 hidden lg:block" aria-hidden>
          <img
            src="/hero-image.png"
            alt=""
            className="h-full w-full scale-[1] object-cover object-center"
            loading="eager"
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-8">
          <div className="max-w-md">
            <div className="rv inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[0.64rem] font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Pensado para mayoristas, almacenes y distribuidores
            </div>
            <h1 className="rv rv-d1 mt-4 font-poppins text-[1.9rem] font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-[2.7rem]">
              <span className="[text-shadow:0_1px_16px_rgba(255,255,255,0.95),0_0_3px_rgba(255,255,255,0.9)]">Tu gestión<br />de stock y ventas,</span><br />
              <span className="text-blue-700 [text-shadow:0_2px_18px_rgba(255,255,255,0.95),0_0_4px_rgba(255,255,255,0.9)]">más simple.</span>
            </h1>
            <p className="rv rv-d2 mt-4 max-w-md font-urbanist text-[0.86rem] leading-relaxed text-slate-500 [text-shadow:0_1px_10px_rgba(255,255,255,0.95)]">
              Centralizá tu negocio en un solo lugar. Ventas, compras, stock, proveedores, sucursales y más, sin complicaciones.
            </p>
            <div className="rv rv-d2 mt-6 flex flex-wrap items-center gap-2.5">
              <Link to="/login" className="group inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-5 py-2.5 font-geist text-[0.8rem] font-semibold text-white shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#1f2937]">
                Probar gratis <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#funciones" className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-5 py-2.5 font-geist text-[0.8rem] font-semibold text-slate-700 ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-0.5 hover:ring-slate-300">
                <PlayCircle size={15} className="text-slate-900" /> Ver cómo funciona
              </a>
            </div>
            <div className="rv rv-d3 mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                { icon: Zap, l: 'Simple' }, { icon: Box, l: 'Completo' },
                { icon: BarChart3, l: 'En la nube' }, { icon: ShieldCheck, l: 'Seguro' },
              ].map((f) => (
                <div key={f.l} className="flex items-center gap-1.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-md shadow-blue-100 ring-1 ring-blue-50">
                    <f.icon size={14} />
                  </span>
                  <span className="font-urbanist text-[0.66rem] font-medium text-slate-600 [text-shadow:0_1px_8px_rgba(255,255,255,0.95)]">{f.l}</span>
                </div>
              ))}
            </div>
          </div>
            {/* imagen en flujo solo en móvil/tablet */}
            <div className="rv rv-d1 mt-8 lg:hidden">
              <img
                src="/hero-image.png"
                alt="Gestly — gestión de stock y ventas"
                className="w-full rounded-2xl shadow-2xl shadow-blue-900/20"
                loading="eager"
              />
            </div>
        </div>
      </section>

      {/* ═══ LOGOS — marquee de tarjetas en gris ═══ */}
      <section className="border-y border-slate-100 bg-gradient-to-b from-white to-slate-50/70 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rv text-center font-geist text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Ya confían en Gestly</p>
          <p className="rv rv-d1 mt-2 flex items-center justify-center gap-2">
            <span className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
              ))}
            </span>
            <span className="font-geist text-[0.72rem] font-semibold text-slate-500">+500 negocios ya gestionan con Gestly</span>
          </p>
        </div>
        <div className="rv rv-d1 marquee-mask mt-4 overflow-hidden">
          <div className="animate-marquee flex w-max hover:[animation-play-state:paused]">
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center gap-6 pr-6" aria-hidden={half === 1}>
                {LOGOS.map((b, i) => (
                  <span key={b} className="flex items-center gap-6">
                    <span className="whitespace-nowrap rounded-2xl bg-white px-7 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.10)]">
                      <span className={`text-slate-400 grayscale transition hover:text-slate-600 ${i === 2 ? 'font-heading text-lg font-bold tracking-tight' : i === 3 ? 'font-geist text-base font-bold tracking-[0.2em]' : i === 4 ? 'font-heading text-base font-bold italic' : i === 5 ? 'font-urbanist text-lg font-light lowercase' : 'font-geist text-[0.85rem] font-bold'}`}>
                        {b}
                      </span>
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ¿QUÉ ES GESTLY? / RUBROS — carrusel 3D arrastrable ═══ */}
      <section id="rubros" className="scroll-mt-16 overflow-hidden bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Eyebrow>¿Qué es Gestly?</Eyebrow>
              <h2 className="rv mt-3 font-poppins text-[1.7rem] font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-[2.3rem]">
                Un sistema completo<br />para <span className="text-blue-700">todo tipo de negocios.</span>
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="rv rv-d1 max-w-md font-urbanist text-[0.84rem] leading-relaxed text-slate-500">
                Gestioná ventas, compras, stock, clientes, proveedores y mucho más. Arrastrá para explorar los rubros que ya trabajan con Gestly.
              </p>
              <div className="rv rv-d2 mt-4 flex flex-wrap items-center gap-2.5">
                <a href="#funciones" className="group inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-5 py-2.5 font-geist text-[0.8rem] font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#1f2937]">
                  Conocé todas las funciones <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollRubros(-1)}
                    aria-label="Anterior"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-[#111827] hover:text-white hover:ring-[#111827]"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    onClick={() => scrollRubros(1)}
                    aria-label="Siguiente"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-[#111827] hover:text-white hover:ring-[#111827]"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rv rv-d2 relative mx-auto mt-8 max-w-7xl">
          <div
            ref={trackRef}
            onPointerDown={onTrackDown}
            onPointerMove={onTrackMove}
            onPointerUp={endTrackDrag}
            onPointerLeave={endTrackDrag}
            onPointerCancel={endTrackDrag}
            className="grid auto-cols-[236px] cursor-grab grid-flow-col grid-rows-2 select-none gap-4 overflow-x-auto px-4 pb-3 pt-3 [scrollbar-width:none] active:cursor-grabbing sm:auto-cols-[258px] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
          >
            {RUBROS.map((r, i) => {
              const skin = RUBRO_SKINS[i % RUBRO_SKINS.length];
              return (
                <article
                  key={r.label}
                  onMouseMove={handleTilt}
                  onMouseLeave={resetTilt}
                  className={`group rounded-3xl bg-gradient-to-br ${skin.card} p-5 shadow-[0_10px_30px_rgba(17,24,39,0.25)] ring-1 ring-white/10 transition-[box-shadow] duration-300 hover:shadow-[0_18px_46px_rgba(37,99,235,0.38)] hover:ring-blue-400/40`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition duration-300 group-hover:scale-110 ${skin.tile}`}>
                    <r.icon size={20} />
                  </span>
                  <p className="mt-4 font-poppins text-[0.92rem] font-bold text-white">{r.label}</p>
                  <p className="mt-1 min-h-[2.2rem] font-urbanist text-[0.74rem] leading-snug text-slate-300/90">{r.d}</p>
                  <span className="mt-3 flex items-center gap-1 font-geist text-[0.68rem] font-semibold text-slate-400 transition group-hover:gap-2 group-hover:text-white">
                    Explorar <ArrowRight size={12} />
                  </span>
                </article>
              );
            })}
          </div>
          <p className="mt-1 text-center font-geist text-[0.64rem] font-medium uppercase tracking-[0.2em] text-slate-300">
            Arrastrá para explorar
          </p>
        </div>
      </section>

      {/* transición blanco → celeste */}
      <Blend from="#ffffff" to="#eef4ff" />

      {/* ═══ DISPOSITIVOS ═══ */}
      <section id="dispositivos" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-[#eef4ff] via-[#e4efff] to-[#d8e7ff]">
        <div className="bg-dots absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
          <div>
            <Eyebrow>Disponible en todos tus dispositivos</Eyebrow>
            <h2 className="rv mt-3 font-heading text-[1.55rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.1rem]">
              Llevá tu negocio<br />a donde vayas.
            </h2>
            <p className="rv rv-d1 mt-3 max-w-md font-urbanist text-[0.84rem] leading-relaxed text-slate-500">
              Usá Gestly desde la web, en tu computadora o desde la app móvil. Toda tu información siempre sincronizada y en tiempo real.
            </p>
            <ul className="rv rv-d2 mt-4 space-y-2">
              {['Aplicación de escritorio (Windows y Mac)', 'App móvil (iOS y Android)', 'Versión web desde cualquier navegador', 'Misma experiencia en todos los dispositivos'].map((t) => (
                <li key={t} className="flex items-center gap-2 font-urbanist text-[0.8rem] font-medium text-slate-600">
                  <CheckCircle2 size={15} className="shrink-0 text-blue-600" /> {t}
                </li>
              ))}
            </ul>
            <a href="#contacto" className="rv rv-d2 group mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-5 py-2.5 font-geist text-[0.8rem] font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#1f2937]">
              Conocé más <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <div className="rv rv-d3 mt-5">
              <p className="font-geist text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-400">Descargá la app</p>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                <a href="#contacto" className="group flex items-center gap-3 rounded-2xl bg-[#111827] px-4 py-2.5 text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-[#1f2937]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Smartphone size={17} />
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block font-urbanist text-[0.62rem] text-slate-400">Descargar para</span>
                    <span className="flex items-center gap-1.5 font-geist text-[0.82rem] font-bold">
                      Android <Download size={13} className="transition-transform group-hover:translate-y-0.5" />
                    </span>
                  </span>
                </a>
                <a href="#contacto" className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-slate-900 shadow-xl shadow-blue-900/10 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-slate-300">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/[0.05] ring-1 ring-slate-900/10">
                    <MonitorDown size={17} />
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block font-urbanist text-[0.62rem] text-slate-400">Descargar para</span>
                    <span className="flex items-center gap-1.5 font-geist text-[0.82rem] font-bold">
                      Windows y Mac <Download size={13} className="transition-transform group-hover:translate-y-0.5" />
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="rv rv-d1">
            <img
              src="/Multiplataforma.png"
              alt="Gestly en todos tus dispositivos"
              className="w-full rounded-2xl shadow-2xl shadow-blue-900/20"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* transición celeste → oscuro */}
      <Blend from="#d8e7ff" to="#111827" />

      {/* ═══ FUNCIONALIDADES (dark) ═══ */}
      <section id="funciones" className="relative scroll-mt-16 overflow-hidden bg-[#111827]">
        <div className="bg-dots-dark absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="text-center">
            <Eyebrow dark>Funcionalidades principales</Eyebrow>
            <div className="mt-3 grid gap-3 lg:grid-cols-2 lg:items-end lg:text-left">
              <h2 className="rv font-heading text-[1.55rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.1rem]">
                Todo lo que necesitás<br />para gestionar tu negocio.
              </h2>
              <p className="rv rv-d1 font-geist text-[0.82rem] leading-relaxed text-slate-300 lg:pb-1 lg:text-right">
                De la compra a la venta, en un solo lugar.<br />Procesos automáticos, simples y rápidos.
              </p>
            </div>
          </div>

          <div className="mt-8 grid items-center gap-6 lg:grid-cols-[0.85fr_1.3fr_0.85fr]">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
              {FEAT_LEFT.map((f, i) => (
                <div key={f.t} className="rv flex items-start gap-2.5" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-300 ring-1 ring-white/15 transition hover:bg-blue-600 hover:text-white"><f.icon size={15} /></span>
                  <div>
                    <p className="font-geist text-[0.8rem] font-bold text-white">{f.t}</p>
                    <p className="font-urbanist text-[0.7rem] text-slate-400">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rv rv-d1">
              <img
                src="/Usos.png"
                alt="Punto de venta Gestly"
                className="w-full rounded-2xl shadow-2xl shadow-black/50"
                loading="lazy"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5 lg:text-right">
              {FEAT_RIGHT.map((f, i) => (
                <div key={f.t} className="rv flex items-start gap-2.5 lg:flex-row-reverse" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-300 ring-1 ring-white/15 transition hover:bg-blue-600 hover:text-white"><f.icon size={15} /></span>
                  <div>
                    <p className="font-geist text-[0.8rem] font-bold text-white">{f.t}</p>
                    <p className="font-urbanist text-[0.7rem] text-slate-400">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* transición oscuro → blanco */}
      <Blend from="#111827" to="#ffffff" />

      {/* ═══ BENEFICIOS ═══ */}
      <section id="beneficios" className="relative scroll-mt-16 overflow-hidden bg-white py-10 sm:py-12">
        <div className="bg-dots absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <Eyebrow>Beneficios</Eyebrow>
            <h2 className="rv mt-3 font-heading text-[1.55rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2rem]">
              Más control. Más tiempo<br />para hacer crecer tu negocio.
            </h2>
            <p className="rv rv-d1 mt-3 max-w-md font-urbanist text-[0.8rem] text-slate-400">
              Automatizá tus procesos, evitá pérdidas y tomá mejores decisiones.
            </p>
            <div className="rv rv-d1 mt-5 grid gap-2.5 sm:grid-cols-2">
              {BENEFITS.map((b, i) => (
                <div key={b.t} className="group rounded-2xl bg-white p-3.5 shadow-[0_2px_14px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(37,99,235,0.15)]" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white"><b.icon size={16} /></span>
                  <p className="mt-2.5 font-geist text-[0.78rem] font-bold text-slate-900">{b.t}</p>
                  <p className="font-urbanist text-[0.7rem] text-slate-500">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rv rv-d2">
            <img
              src="/last.png"
              alt="Crecé con Gestly"
              className="w-full rounded-[1.6rem] shadow-2xl shadow-blue-900/15"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* transición blanco → oscuro */}
      <Blend from="#ffffff" to="#111827" />

      {/* ═══ CONTACTO (dark) ═══ */}
      <section id="contacto" className="relative scroll-mt-16 overflow-hidden bg-[#111827]">
        <div className="bg-dots-dark absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-2 lg:px-8">
          <div>
            <Eyebrow dark>Contacto</Eyebrow>
            <h2 className="rv mt-3 font-heading text-[1.7rem] font-bold tracking-tight text-white sm:text-[2.3rem]">Hablemos de tu negocio.</h2>
            <p className="rv rv-d1 mt-3 max-w-md font-urbanist text-[0.88rem] leading-relaxed text-slate-300">
              Contanos qué necesitás y te asesoramos para encontrar la mejor solución. Sin compromiso.
            </p>
            <div className="rv rv-d2 mt-6 space-y-3">
              {[
                { icon: Send, t: 'ventas@gestly.com', d: 'Te respondemos en menos de 24 hs.' },
                { icon: CalendarClock, t: 'Demo gratis de 20 minutos', d: 'Vemos tu negocio en vivo.' },
                { icon: CheckCircle2, t: 'Sin tarjeta, empezá hoy', d: 'Probá gratis sin compromiso.' },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300 ring-1 ring-white/15"><c.icon size={16} /></span>
                  <div>
                    <p className="font-geist text-[0.84rem] font-bold text-white">{c.t}</p>
                    <p className="font-urbanist text-[0.74rem] text-slate-400">{c.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="rv rv-d2 w-full rounded-3xl bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur sm:p-6 lg:max-w-lg lg:justify-self-end" onSubmit={(e) => e.preventDefault()}>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 font-geist text-[0.64rem] font-semibold text-sky-300 ring-1 ring-blue-400/20">
              <Send size={11} /> Respuesta en menos de 24 hs.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {['Nombre', 'Empresa', 'Email', 'Teléfono'].map((ph) => (
                <input key={ph} placeholder={ph} className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3 font-urbanist text-[0.8rem] text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30" />
              ))}
            </div>
            <textarea placeholder="Contanos sobre tu negocio…" rows={4} className="mt-2.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3 font-urbanist text-[0.8rem] text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30" />
            <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
              <button className="group flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-3 font-geist text-[0.82rem] font-bold text-slate-900 transition hover:-translate-y-px hover:bg-blue-50">
                Enviar mensaje <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="mailto:ventas@gestly.com" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 font-geist text-[0.82rem] font-semibold text-white ring-1 ring-white/25 transition hover:-translate-y-px hover:bg-white/10">
                <CalendarClock size={15} /> Agendar demo
              </a>
            </div>
          </form>
        </div>
      </section>

      {/* transición oscuro → footer */}
      <Blend from="#111827" to="#0b1220" />

      {/* ═══ FOOTER ═══ */}
      <footer className="relative overflow-hidden bg-[#0b1220]">
        <div className="bg-dots-dark absolute inset-0 opacity-30" aria-hidden />
        <div className="absolute -top-20 left-1/2 h-[200px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.2fr]">
            <div>
              <p className="font-heading text-2xl font-bold tracking-tight text-white">Gestly</p>
              <p className="mt-2 max-w-[260px] font-urbanist text-[0.8rem] leading-relaxed text-slate-400">
                La forma más simple de gestionar tu negocio. Ventas, stock y sucursales en un solo lugar.
              </p>
              <div className="mt-4 flex gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href="#producto"
                    aria-label={s.label}
                    title={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:ring-blue-600"
                  >
                    <s.icon size={15} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-geist text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-200">Secciones</p>
              <ul className="mt-3.5 space-y-2.5">
                {[
                  { l: 'Inicio', id: 'producto' },
                  { l: 'Rubros', id: 'rubros' },
                  { l: 'Funciones', id: 'funciones' },
                  { l: 'Beneficios', id: 'beneficios' },
                  { l: 'Contacto', id: 'contacto' },
                ].map((n) => (
                  <li key={n.id}>
                    <a href={`#${n.id}`} className="group inline-flex items-center gap-1.5 font-urbanist text-[0.8rem] text-slate-400 transition hover:text-white">
                      <span className="h-px w-0 bg-blue-400 transition-all group-hover:w-3" />{n.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-geist text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-200">Producto</p>
              <ul className="mt-3.5 space-y-2.5">
                {['Ventas y POS', 'Stock en tiempo real', 'Facturación integrada', 'Multi-sucursal', 'Reportes'].map((l) => (
                  <li key={l}>
                    <a href="#funciones" className="group inline-flex items-center gap-1.5 font-urbanist text-[0.8rem] text-slate-400 transition hover:text-white">
                      <span className="h-px w-0 bg-blue-400 transition-all group-hover:w-3" />{l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-geist text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-200">Recibí novedades</p>
              <p className="mt-3.5 font-urbanist text-[0.8rem] leading-relaxed text-slate-400">
                Dejanos tu email para recibir actualizaciones y consejos para tu negocio.
              </p>
              <form className="mt-3.5 flex gap-2 rounded-2xl bg-white/[0.05] p-1.5 ring-1 ring-white/10 focus-within:ring-blue-500/50" onSubmit={(e) => e.preventDefault()}>
                <input placeholder="Tu email" className="w-full bg-transparent px-3 py-2 font-urbanist text-[0.8rem] text-white placeholder:text-slate-500 outline-none" />
                <button aria-label="Suscribirme" className="group flex h-[40px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-white text-slate-900 transition hover:bg-blue-600 hover:text-white">
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.08] pt-5 sm:flex-row">
            <p className="font-urbanist text-[0.72rem] text-slate-500">
              © {new Date().getFullYear()} Gestly. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-5">
              {[
                { l: 'Funciones', id: 'funciones' },
                { l: 'Beneficios', id: 'beneficios' },
                { l: 'Contacto', id: 'contacto' },
              ].map((n) => (
                <a key={n.id} href={`#${n.id}`} className="font-urbanist text-[0.72rem] text-slate-500 transition hover:text-white">
                  {n.l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
