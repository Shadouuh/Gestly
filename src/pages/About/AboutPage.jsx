import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import LagoomLogo from '../../assets/images/image.png';
import { Rocket, Globe2, Code2, Heart, Lightbulb, Zap, Users, ShieldCheck, ArrowRight } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white overflow-hidden relative font-sans text-zinc-900">
      <Navbar />
      
      {/* Dynamic Background with Wavy Dots & Radials */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Wavy Dots Pattern */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ 
             backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', 
             backgroundSize: '32px 32px' 
           }}>
             <div className="absolute inset-0 animate-[moveDiagonal_60s_linear_infinite]" style={{
               backgroundImage: 'inherit',
               backgroundSize: 'inherit',
               transform: 'skewY(-5deg)'
             }}></div>
        </div>

        {/* Luminous Radial Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 mix-blend-multiply"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-50/30 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"></div>
      </div>

      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section - Compact & Modern */}
          <div className="text-center mb-20 md:mb-32 relative animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Filosofía Gestly</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Pensado para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">simplificar</span>.
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-light">
              No creamos herramientas por crear. Diseñamos soluciones que eliminan lo complejo, aceleran tus ventas y hacen rentable tu negocio.
            </p>
          </div>

          {/* Core Values Grid - Focus on Simplicity, Efficiency, Cost */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { 
                icon: Lightbulb, 
                color: 'text-amber-500', 
                bg: 'bg-amber-50', 
                border: 'border-amber-100',
                title: 'Simpleza Radical', 
                desc: 'Si necesitas un manual para usarlo, fallamos. Gestly es intuitivo desde la primera venta.' 
              },
              { 
                icon: Zap, 
                color: 'text-blue-500', 
                bg: 'bg-blue-50', 
                border: 'border-blue-100',
                title: 'Ventas Ágiles', 
                desc: 'Cada segundo cuenta. Optimizamos flujos para que cobres y gestiones en tiempo récord.' 
              },
              { 
                icon: ShieldCheck, 
                color: 'text-emerald-500', 
                bg: 'bg-emerald-50', 
                border: 'border-emerald-100',
                title: 'Accesible para Todos', 
                desc: 'Tecnología de punta no tiene por qué ser cara. Precios justos para negocios reales.' 
              }
            ].map((item, index) => (
              <div key={index} className={`group p-8 md:p-10 rounded-[2.5rem] border ${item.border} bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} rounded-bl-[2.5rem] opacity-50 transition-transform group-hover:scale-110`}></div>
                
                <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={32} strokeWidth={2} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display relative z-10">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Mission & Vision - Split Layout (Refined) */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-40 items-center">
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-[3rem] rotate-3 opacity-40 group-hover:rotate-2 transition-transform duration-500"></div>
              <div className="relative bg-white rounded-[3rem] border border-slate-100 p-10 md:p-14 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-full opacity-70"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mb-10 shadow-lg shadow-slate-900/20">
                    <Rocket size={40} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-display leading-tight">No es solo una app,<br/>es tu socio.</h2>
                  <p className="text-xl text-slate-600 leading-relaxed mb-10 font-light">
                    Entendemos que detrás de cada negocio hay esfuerzo y sueños. Por eso, no solo te damos una herramienta, te damos el control total de tu futuro.
                  </p>
                  <div className="space-y-4">
                    {[
                      { text: 'Sin costos ocultos ni sorpresas', icon: ShieldCheck, color: 'text-emerald-500' },
                      { text: 'Mejoras constantes gratuitas', icon: Zap, color: 'text-amber-500' },
                      { text: 'Soporte que sí responde', icon: Heart, color: 'text-rose-500' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-slate-700 font-bold text-lg group/item">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover/item:bg-slate-100 transition-colors">
                          <item.icon size={20} className={item.color} strokeWidth={2.5} />
                        </div>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-sm">
                <Globe2 size={18} />
                <span>Visión Global</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 font-display leading-tight">
                El futuro del comercio es <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">digital y humano</span>.
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed font-light">
                Creemos en un mundo donde la tecnología no reemplaza el trato personal, sino que lo potencia. Gestly libera tu tiempo para que puedas dedicarte a lo que realmente importa: vender más y cuidar a tus clientes.
              </p>
            </div>
          </div>

          {/* Lagoom Promo Section - Modern & Tech */}
          <div className="relative bg-slate-900 rounded-[3rem] overflow-hidden">
            {/* Abstract Tech Background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 px-8 py-16 md:p-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest mb-8">
                  <Code2 size={14} />
                  <span>Powered by Lagoom</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display leading-tight">
                  {t('about.lagoom.title')}
                </h2>
                <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Una factoría de soluciones digitales obsesionada con la calidad. Creamos productos que marcan la diferencia, desde aplicaciones móviles hasta plataformas empresariales complejas.
                </p>
                
                <a 
                  href="https://lagoom.com.ar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg shadow-white/10"
                >
                  <span>Conocer Lagoom</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={LagoomLogo} 
                      alt="Lagoom Logo" 
                      className="w-48 md:w-64 h-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
