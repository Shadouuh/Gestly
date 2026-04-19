import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  Palette, 
  TrendingUp, 
  Users, 
  UserCheck, 
  BarChart3,
  Store,
  Settings,
  Package,
  Layers,
  Rocket,
  ShoppingBasket,
  Croissant,
  Shirt,
  Hammer,
  Pill,
  Utensils,
  Smartphone,
  Gamepad2,
  Footprints,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Globe2,
  Clock,
  LayoutDashboard,
  Calculator, 
  Printer, 
  Star, 
  MessageCircle, 
  Lock, 
  Calendar, 
  Shield, 
  PieChart, 
  DollarSign, 
  FileText, 
  Moon, 
  Layout, 
  Type, 
  Image, 
  Globe, 
  Repeat, 
  Map,
  Truck 
} from 'lucide-react';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import catalogoPenguin from '../../assets/images/penguin/Catalogo.png';
import ventasPenguin from '../../assets/images/penguin/ventas.png';
import clientesPenguin from '../../assets/images/penguin/clientes.png';
import empleadosPenguin from '../../assets/images/penguin/empleados.png';
import estadisticasPenguin from '../../assets/images/penguin/Estadisticas.png';
import personalizacionPenguin from '../../assets/images/penguin/personalizacion.png';
import sucursalesPenguin from '../../assets/images/penguin/sucursales.png';

// Hook for scroll animations
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, visible];
};

const RevealOnScroll = ({ children, className = '', delay = 0 }) => {
  const [ref, visible] = useOnScreen({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const WhatIsGestly = () => {
  const { t } = useTranslation();

  const modules = [
    {
      key: 'catalog',
      title: t(`whatIsGestly.modules.catalog.title`),
      desc: t(`whatIsGestly.modules.catalog.desc`),
      icon: Package,
      image: catalogoPenguin,
      color: 'text-blue-600',
      bg: 'bg-blue-600',
      bgLight: 'bg-blue-50',
      gradient: 'from-blue-600 to-indigo-600',
      features: [
        { icon: Zap, label: 'Carga Rápida' },
        { icon: Layers, label: 'Categorías' },
        { icon: ShieldCheck, label: 'Stock Seguro' },
        { icon: Globe2, label: 'Online' }
      ]
    },
    {
      key: 'sales',
      title: t(`whatIsGestly.modules.sales.title`),
      desc: t(`whatIsGestly.modules.sales.desc`),
      icon: ShoppingBag,
      image: ventasPenguin,
      color: 'text-emerald-600',
      bg: 'bg-emerald-600',
      bgLight: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-teal-500',
      features: [
        { icon: Zap, label: 'Venta Flash' },
        { icon: Calculator, label: 'Calc. Auto' },
        { icon: Smartphone, label: 'Móvil' },
        { icon: Printer, label: 'Tickets' }
      ]
    },
    {
      key: 'customers',
      title: t(`whatIsGestly.modules.customers.title`),
      desc: t(`whatIsGestly.modules.customers.desc`),
      icon: UserCheck,
      image: clientesPenguin,
      color: 'text-indigo-600',
      bg: 'bg-indigo-600',
      bgLight: 'bg-indigo-50',
      gradient: 'from-indigo-600 to-violet-600',
      features: [
        { icon: Users, label: 'Perfiles' },
        { icon: Clock, label: 'Historial' },
        { icon: Star, label: 'Fidelidad' },
        { icon: MessageCircle, label: 'Contacto' }
      ]
    },
    {
      key: 'employees',
      title: t(`whatIsGestly.modules.employees.title`),
      desc: t(`whatIsGestly.modules.employees.desc`),
      icon: Users,
      image: empleadosPenguin,
      color: 'text-orange-600',
      bg: 'bg-orange-600',
      bgLight: 'bg-orange-50',
      gradient: 'from-orange-500 to-red-500',
      features: [
        { icon: Lock, label: 'Permisos' },
        { icon: TrendingUp, label: 'Metas' },
        { icon: Calendar, label: 'Turnos' },
        { icon: Shield, label: 'Auditoría' }
      ]
    },
    {
      key: 'stats',
      title: t(`whatIsGestly.modules.stats.title`),
      desc: t(`whatIsGestly.modules.stats.desc`),
      icon: BarChart3,
      image: estadisticasPenguin,
      color: 'text-purple-600',
      bg: 'bg-purple-600',
      bgLight: 'bg-purple-50',
      gradient: 'from-purple-600 to-fuchsia-600',
      features: [
        { icon: PieChart, label: 'Gráficos' },
        { icon: TrendingUp, label: 'Crecimiento' },
        { icon: DollarSign, label: 'Ganancias' },
        { icon: FileText, label: 'Reportes' }
      ]
    },
    {
      key: 'customization',
      title: t(`whatIsGestly.modules.customization.title`),
      desc: t(`whatIsGestly.modules.customization.desc`),
      icon: Palette,
      image: personalizacionPenguin,
      color: 'text-pink-600',
      bg: 'bg-pink-600',
      bgLight: 'bg-pink-50',
      gradient: 'from-pink-500 to-rose-500',
      features: [
        { icon: Moon, label: 'Dark Mode' },
        { icon: Layout, label: 'Temas' },
        { icon: Type, label: 'Fuentes' },
        { icon: Image, label: 'Logos' }
      ]
    },
    {
      key: 'branches',
      title: t(`whatIsGestly.modules.branches.title`),
      desc: t(`whatIsGestly.modules.branches.desc`),
      icon: Store,
      image: sucursalesPenguin,
      color: 'text-cyan-600',
      bg: 'bg-cyan-600',
      bgLight: 'bg-cyan-50',
      gradient: 'from-cyan-500 to-blue-500',
      features: [
        { icon: Globe, label: 'Central' },
        { icon: Repeat, label: 'Sincro' },
        { icon: Truck, label: 'Stock' },
        { icon: Map, label: 'Mapa' }
      ]
    }
  ];

  const steps = [
    { 
      icon: Settings, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      titleKey: '1',
      descKey: '1'
    },
    { 
      icon: Package, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-100',
      titleKey: '2',
      descKey: '2'
    },
    { 
      icon: Layers, 
      color: 'text-violet-600', 
      bg: 'bg-violet-100',
      titleKey: '3',
      descKey: '3'
    },
    { 
      icon: Rocket, 
      color: 'text-fuchsia-600', 
      bg: 'bg-fuchsia-100',
      titleKey: '4',
      descKey: '4'
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 overflow-x-hidden">
      <Navbar />
      
      <main>
        {/* Hero Header */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
           {/* Animated Dot Pattern Background */}
           <div className="absolute inset-0 z-0 opacity-30" style={{ 
             backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
             <div className="absolute inset-0 animate-[moveDiagonal_20s_linear_infinite]" style={{
               backgroundImage: 'inherit',
               backgroundSize: 'inherit'
             }}></div>
           </div>

           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-white to-white -z-10"></div>
           
           <div className="max-w-5xl mx-auto text-center relative z-10">
            <RevealOnScroll>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest mb-8 shadow-xl shadow-slate-200 hover:scale-105 transition-transform duration-300">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>El fin de las libretas</span>
              </div>
            </RevealOnScroll>
            
            <RevealOnScroll delay={200}>
              <h1 className="text-5xl md:text-8xl font-display font-black mb-12 text-slate-900 tracking-tighter leading-[0.9]">
                {t('whatIsGestly.title')}
              </h1>
            </RevealOnScroll>
            
            <RevealOnScroll delay={400}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Card 1 */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Rocket size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Adiós al Caos</h3>
                  <p className="text-slate-500 font-medium">Olvídate de las libretas y el desorden. Todo tu negocio en un solo lugar.</p>
                </div>

                {/* Card 2 - Featured */}
                <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 border border-slate-800 flex flex-col items-center transform md:-translate-y-4 hover:-translate-y-6 transition-transform duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                    <Zap size={32} strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-display">Potencia Total</h3>
                  <p className="text-slate-300 font-medium">Controla stock, ventas y clientes con una herramienta profesional.</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <ShieldCheck size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Tranquilidad</h3>
                  <p className="text-slate-500 font-medium">Tus datos seguros y tu inventario siempre bajo control.</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Decorative Divider */}
          <div className="max-w-xs mx-auto mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent h-[1px] opacity-30"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-blue-200 rounded-full opacity-50 animate-ping"></div>
          </div>
        </section>

        {/* Zig-Zag Modules Section with Wave Dividers */}
        <div className="flex flex-col">
          {modules.map((module, index) => (
            <React.Fragment key={module.key}>
              {/* Separated Wave Divider */}
              <div className={`w-full overflow-hidden leading-none ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                <svg className="relative block w-[calc(100%+1.3px)] h-[40px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className={index % 2 === 0 ? 'fill-white' : 'fill-slate-50'}></path>
                </svg>
              </div>

              <section 
                className={`relative py-16 md:py-32 lg:py-48 overflow-hidden ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
              >
                {/* Dot Pattern Background (Specific for Branches or General) */}
                {(module.key === 'branches' || index % 2 === 0) && (
                   <div className="absolute inset-0 z-0 opacity-[0.4]" style={{ backgroundImage: `radial-gradient(${module.key === 'branches' ? '#cbd5e1' : '#e2e8f0'} 1.5px, transparent 1.5px)`, backgroundSize: '32px 32px' }}></div>
                )}

              <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-24`}>
                  
                  {/* Image Side */}
                  <div className="w-full lg:w-1/2 relative group">
                    <RevealOnScroll delay={200}>
                      
                      {/* Luminous Grain Background Effect */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full opacity-40 -z-10">
                        {/* Main Radial Gradient (Luminous Core) */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${module.gradient} blur-[60px] md:blur-[100px] opacity-60 mix-blend-multiply`}></div>
                        
                        {/* Noise Texture Overlay */}
                        <div className="absolute inset-0 rounded-full opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                        
                        {/* Secondary Ring Gradient (Edge Glow) */}
                        <div className={`absolute inset-0 rounded-full border-[30px] md:border-[60px] border-white/10 blur-[30px] md:blur-[60px] scale-90`}></div>
                      </div>
                      
                      <div className="relative z-10 md:scale-[1.35] scale-100 -mb-8 md:mb-0">
                        <img 
                          src={module.image} 
                          alt={module.title}
                          className="w-full h-auto object-contain drop-shadow-2xl"
                          style={{ maxHeight: '850px', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }}
                        />
                      </div>
                    </RevealOnScroll>
                  </div>

                  {/* Content Side */}
                  <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <RevealOnScroll>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${module.bgLight} border border-slate-100 mb-4 md:mb-8 mx-auto lg:mx-0`}>
                        <module.icon size={16} className={module.color} />
                        <span className={`text-xs font-bold uppercase tracking-wide ${module.color}`}>{module.title}</span>
                      </div>
                      
                      <h2 className="text-4xl md:text-7xl font-display font-black text-slate-900 mb-4 md:mb-8 leading-tight tracking-tight">
                        {module.title}
                      </h2>
                      
                      <p className="text-lg md:text-2xl text-slate-500 leading-relaxed font-light mb-8 md:mb-12 max-w-lg mx-auto lg:mx-0 hidden md:block">
                        {module.desc}
                      </p>

                      {/* Mobile Short Description */}
                      <p className="text-base text-slate-500 leading-relaxed font-normal mb-8 max-w-sm mx-auto md:hidden">
                        {module.desc.split('.')[0]}. {/* Show only first sentence on mobile */}
                      </p>

                      {/* Rich Feature Cards */}
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {module.features.map((feature, idx) => (
                          <div key={idx} className="group/card p-3 md:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 text-left">
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl ${module.bgLight} flex items-center justify-center ${module.color}`}>
                                <feature.icon size={18} className="md:w-6 md:h-6" strokeWidth={2} />
                              </div>
                              <ArrowRight size={14} className="text-slate-300 group-hover/card:text-slate-400 transition-colors hidden md:block" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm md:text-lg mb-0.5 md:mb-1 leading-tight">{feature.label}</h4>
                            <p className="text-[10px] md:text-sm text-slate-500 font-medium hidden md:block">Optimizado</p>
                          </div>
                        ))}
                      </div>
                    </RevealOnScroll>
                  </div>
                </div>
              </div>

              {/* Bottom Wave Divider (Except for last item) - Removed to avoid double waves issue */}
            </section>
            </React.Fragment>
          ))}
        </div>

        {/* Configuration Steps */}
        <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <RevealOnScroll>
              <div className="text-center mb-24">
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                  {t('whatIsGestly.configSteps.title')}
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  {t('whatIsGestly.configSteps.subtitle')}
                </p>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <RevealOnScroll key={index} delay={index * 100}>
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors duration-300 group">
                    <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <step.icon size={28} className={step.color} />
                    </div>
                    <div className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Paso 0{index + 1}</div>
                    <h3 className="text-2xl font-bold mb-3">{t(`whatIsGestly.configSteps.steps.${step.titleKey}.title`)}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {t(`whatIsGestly.configSteps.steps.${step.descKey}.desc`)}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WhatIsGestly;
