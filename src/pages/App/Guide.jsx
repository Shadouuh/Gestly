import React, { useState } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, ChevronRight, Sparkles, LayoutDashboard, ShoppingCart, Package } from 'lucide-react';

const Guide = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Conoce tu Panel de Control',
      icon: LayoutDashboard,
      description: 'El Dashboard te da un resumen rápido de cómo va tu negocio hoy. Revisa ingresos, tickets y compara el rendimiento de tus sucursales.',
      completed: true
    },
    {
      id: 2,
      title: 'Carga tu Catálogo',
      icon: Package,
      description: 'Antes de vender, necesitas productos. Agrega nuevos ítems, establece precios y lleva un control exacto de tu stock.',
      completed: false
    },
    {
      id: 3,
      title: 'Registra tu primera venta',
      icon: ShoppingCart,
      description: 'Ve a "Nueva Venta", selecciona los productos y elige el método de pago. ¡Incluso puedes fiar y anotar deudas a tus clientes!',
      completed: false
    }
  ];

  return (
    <div className="p-6 h-full flex flex-col max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      <div className="bg-slate-900 dark:bg-white rounded-3xl p-8 md:p-12 mb-8 text-white dark:text-slate-900 relative overflow-hidden shadow-xl">
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-slate-900/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 dark:bg-slate-900/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-slate-900/10 px-3 py-1.5 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
              <Sparkles size={16} /> ¡Bienvenido a Gestly!
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Domina tu negocio en minutos
            </h1>
            <p className="text-slate-300 dark:text-slate-600 text-lg mb-8">
              Hemos preparado un recorrido rápido para que aprendas a usar las herramientas más potentes de tu nueva plataforma.
            </p>
            <button className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2">
              <PlayCircle size={20} /> Ver Video Tutorial
            </button>
          </div>
          
          <div className="w-full md:w-auto flex justify-center">
            <div className="w-48 h-48 bg-white/10 dark:bg-slate-900/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 dark:border-slate-900/20">
              <BookOpen size={80} className="text-white dark:text-slate-900" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Pasos recomendados</h2>
          {steps.map(step => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors text-left ${
                  isActive 
                    ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                    isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}>
                    {step.completed ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                  </div>
                  <span className={`font-bold text-sm ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>
                <ChevronRight size={16} className={isActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'} />
              </button>
            );
          })}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 h-full shadow-sm flex flex-col justify-center">
            {steps.map(step => step.id === activeStep && (
              <div key={step.id} className="animate-fadeIn">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                  <step.icon size={32} className="text-slate-900 dark:text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                  {step.description}
                </p>
                
                <div className="flex items-center gap-4">
                  <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md">
                    Ir a la sección
                  </button>
                  {activeStep < steps.length && (
                    <button 
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Siguiente paso
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;