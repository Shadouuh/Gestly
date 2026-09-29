import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
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
  Sparkles,
  Receipt,
  Scan,
  Truck,
  Calculator,
  Percent,
  FileBarChart,
  Bell,
  WifiOff,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Settings,
  CheckCircle,
  Circle,
  ArrowRightCircle
} from 'lucide-react';

import multiplatformImg from '../../../assets/images/features/Multiplataforma.png';
import stockSimpleImg from '../../../assets/images/features/StockSimple.png';
import stockComplexImg from '../../../assets/images/features/StockComplejo.png';
import templatesImg from '../../../assets/images/features/Plantillas.png';
import aiStockImg from '../../../assets/images/features/IA-Stock.png';
import recipesImg from '../../../assets/images/features/Recetas.png';
import multiBranchImg from '../../../assets/images/features/Sucursales.png';
import shoppingListImg from '../../../assets/images/features/Lista-Compras.png';
import debtsImg from '../../../assets/images/features/Fiados.png';
import staffImg from '../../../assets/images/features/Personal.png';
import statisticsImg from '../../../assets/images/features/Estadisticas.png';
import cashImg from '../../../assets/images/features/Caja.png';
import promotionsImg from '../../../assets/images/features/Promociones.png';
import alertsImg from '../../../assets/images/features/AlertaStock.png';
import offlineImg from '../../../assets/images/features/Offline.png';

const FeaturesSearch = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    { key: 'multiplatform', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', image: multiplatformImg },
    { key: 'stockSimple', icon: Box, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', image: stockSimpleImg },
    { key: 'stockComplex', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', image: stockComplexImg },
    { key: 'templates', icon: LayoutTemplate, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100', image: templatesImg },
    { key: 'aiStock', icon: Camera, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', image: aiStockImg },
    { key: 'recipes', icon: ChefHat, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', image: recipesImg },
    { key: 'multiBranch', icon: Store, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100', image: multiBranchImg },
    { key: 'shoppingList', icon: ShoppingCart, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100', image: shoppingListImg },
    { key: 'credits', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', image: debtsImg },
    { key: 'employees', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', image: staffImg },
    { key: 'stats', icon: PieChart, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100', image: statisticsImg },
    { key: 'cashRegister', icon: Calculator, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', image: cashImg },
    { key: 'discounts', icon: Percent, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', image: promotionsImg },
    { key: 'alerts', icon: Bell, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100', image: alertsImg },
    { key: 'offline', icon: WifiOff, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', image: offlineImg },
  ];

  const faqs = [
    'internet',
    'data_loss',
    'paper_records',
    'product_entry',
    'usage',
    'multi_branch'
  ];

  const filteredFeatures = features.filter(feature => {
    const title = t(`featuresList.items.${feature.key}.title`).toLowerCase();
    const desc = t(`featuresList.items.${feature.key}.desc`).toLowerCase();
    const term = searchTerm.toLowerCase();
    return title.includes(term) || desc.includes(term);
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[350px] h-[350px] bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles size={12} />
              <span>Funcionalidades</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 tracking-tight leading-tight">
              {t('featuresList.title')}
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
              {t('featuresList.subtitle')}
            </p>
          </div>
          
          <div className="relative w-full lg:w-[450px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] placeholder-slate-400 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]"
              placeholder={t('featuresList.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-20">
          {filteredFeatures.map((feature, index) => (
            <div 
              key={feature.key}
              onClick={() => setSelectedFeature(feature)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fadeInUp flex flex-col h-full"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image Header */}
              <div className="h-32 relative overflow-hidden bg-slate-100">
                {feature.image ? (
                  <>
                    <img 
                      src={feature.image} 
                      alt={t(`featuresList.items.${feature.key}.title`)}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                  </>
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${feature.bg}`}>
                    <feature.icon size={48} className={`${feature.color} opacity-20`} />
                  </div>
                )}
                
                {/* Floating Icon Badge */}
                <div className={`absolute top-3 right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 z-10`}>
                  <feature.icon size={20} className={feature.color} strokeWidth={2} />
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-blue-600 transition-colors line-clamp-1">
                  {t(`featuresList.items.${feature.key}.title`)}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-4 line-clamp-3">
                  {t(`featuresList.items.${feature.key}.desc`)}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-wider">Ver detalles</span>
                  <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredFeatures.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No encontramos resultados</h3>
              <p className="text-slate-500">Intenta buscar con otros términos como "stock", "ventas" o "reportes".</p>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto animate-fadeInUp delay-300">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-3">
              {t('faq.title')}
            </h2>
            <p className="text-base text-slate-600">
              {t('faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faqKey, index) => (
              <div 
                key={faqKey}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openFaq === index ? 'border-indigo-200 shadow-lg shadow-indigo-100' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg ${openFaq === index ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {t(`faq.items.${faqKey}.q`)}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaq === index ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-600 leading-relaxed text-base">
                    {/* Render markdown-like bold text */}
                    {t(`faq.items.${faqKey}.a`).split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedFeature(null)}></div>
          <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-zoom-in flex flex-col lg:flex-row max-h-[90vh] lg:max-h-[600px] border border-white/20">
            <button 
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-600 transition-all z-20 hover:scale-110 shadow-sm backdrop-blur-sm"
            >
              <X size={20} />
            </button>
            
            {/* Left Side: Image / Visual */}
            <div className="relative w-full lg:w-1/2 bg-white overflow-hidden flex flex-col items-center justify-center p-0">
              {selectedFeature.image ? (
                <div className="h-64 sm:h-80 lg:h-full w-full relative flex items-center justify-center">
                  <div className={`absolute inset-0 ${selectedFeature.bg} opacity-20`}></div>
                  <img 
                    src={selectedFeature.image} 
                    alt={t(`featuresList.items.${selectedFeature.key}.title`)}
                    className="w-full h-full object-cover object-center lg:object-left-top hover:scale-105 transition-transform duration-700"
                  />
                </div>
              ) : (
                <div className="h-48 lg:h-full w-full relative flex items-center justify-center p-10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
                  <selectedFeature.icon size={120} strokeWidth={1} className={`${selectedFeature.color} opacity-20 lg:opacity-100 lg:scale-150 transition-transform`} />
                </div>
              )}
            </div>
            
            {/* Right Side: Content */}
            <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl ${selectedFeature.bg} ${selectedFeature.color} flex items-center justify-center shadow-sm ring-4 ring-white`}>
                  <selectedFeature.icon size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 font-display leading-none mb-1 tracking-tight">
                    {t(`featuresList.items.${selectedFeature.key}.title`)}
                  </h3>
                  <p className="text-slate-500 font-medium">{t(`featuresList.items.${selectedFeature.key}.desc`)}</p>
                </div>
              </div>
              
              <div className="prose prose-slate prose-lg max-w-none mb-8">
                <p className="text-slate-600 leading-relaxed font-normal">
                  {t(`featuresList.items.${selectedFeature.key}.details`)}
                </p>
              </div>

              {/* Dynamic Benefits List */}
              {t(`featuresList.items.${selectedFeature.key}.benefits`, { returnObjects: true }) instanceof Array && (
                <div className="mb-8 bg-slate-50/80 rounded-2xl p-5 border border-slate-100/50">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Sparkles size={12} className={selectedFeature.color} />
                    Beneficios Clave
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {t(`featuresList.items.${selectedFeature.key}.benefits`, { returnObjects: true }).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-slate-700">
                        <div className={`mt-1 min-w-[6px] h-[6px] rounded-full ${selectedFeature.color.replace('text-', 'bg-')}`}></div>
                        <span className="text-sm font-semibold leading-snug">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dynamic Diagram (Variable Flow) */}
              {(() => {
                const diagramData = t(`featuresList.items.${selectedFeature.key}.diagram`, { returnObjects: true });
                if (diagramData && typeof diagramData === 'object' && !Array.isArray(diagramData)) {
                  const steps = Object.values(diagramData);
                  return (
                    <div className="mb-8">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 text-center">Flujo de Trabajo</h4>
                       <div className="flex items-center justify-between relative px-4">
                          {/* Connection Line */}
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 transform -translate-y-1/2 rounded-full"></div>
                          
                          {steps.map((stepLabel, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 relative group">
                              <div className={`w-12 h-12 rounded-2xl bg-white border-2 ${selectedFeature.border} flex items-center justify-center shadow-sm text-slate-400 transition-all duration-300 group-hover:scale-110 group-hover:border-current ${selectedFeature.color}`}>
                                {idx === 0 ? <Circle size={20} /> : 
                                 idx === steps.length - 1 ? <CheckCircle size={20} /> : 
                                 <ArrowRightCircle size={20} />}
                              </div>
                              <span className="text-xs font-bold text-slate-500 text-center max-w-[80px] leading-tight">{stepLabel}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="mt-auto flex gap-3 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedFeature(null)}
                  className="py-3.5 px-6 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cerrar
                </button>
                <button className="flex-1 py-3.5 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 flex items-center justify-center gap-2 group">
                  <span>Probar funcionalidad</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturesSearch;
