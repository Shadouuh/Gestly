import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Shield, Zap, Award, Sparkles, Building2, Users2, Database, Wifi, Headset, BarChart } from 'lucide-react';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';

const Pricing = () => {
  const { t } = useTranslation();
  const ARS_RATE = 1475;

  const formatARS = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price * ARS_RATE);
  };

  const featuresList = [
    { key: 'all_modules', icon: Database },
    { key: 'offline_mode', icon: Wifi },
    { key: 'basic_stats', icon: BarChart },
    { key: 'fixed_customers', icon: Users2 },
    { key: 'assistant', icon: Sparkles },
    { key: 'ai_stock', icon: Zap },
    { key: 'employees', icon: Users2 },
    { key: 'multi_branch', icon: Building2 },
    { key: 'priority_support', icon: Headset },
    { key: 'advanced_reports', icon: BarChart },
  ];

  const plans = {
    free: {
      key: 'free',
      icon: Shield,
      color: 'blue',
      price: 0,
      features: {
        all_modules: true,
        offline_mode: true,
        basic_stats: false,
        fixed_customers: false,
        assistant: false,
        ai_stock: false,
        employees: false,
        multi_branch: false,
        priority_support: false,
        advanced_reports: false,
      }
    },
    essential: {
      key: 'essential',
      icon: Zap,
      color: 'indigo',
      price: 4.99,
      originalPrice: 6.99,
      popular: true,
      features: {
        all_modules: true,
        offline_mode: true,
        basic_stats: true,
        fixed_customers: true,
        assistant: true,
        ai_stock: true,
        employees: true,
        multi_branch: false,
        priority_support: false,
        advanced_reports: false,
      }
    },
    pro: {
      key: 'pro',
      icon: Award,
      color: 'fuchsia',
      price: 14.99,
      originalPrice: 19.99,
      features: {
        all_modules: true,
        offline_mode: true,
        basic_stats: true,
        fixed_customers: true,
        assistant: true,
        ai_stock: true,
        employees: true,
        multi_branch: true,
        priority_support: true,
        advanced_reports: true,
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 relative overflow-hidden">
      <Navbar />
      
      {/* Background Elements */}
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
      </div>
      
      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">Planes Simples</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-slate-900 mb-6 tracking-tight">
              {t('pricing.title')}
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 leading-relaxed font-light">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Cards Layout for Mobile / Table for Desktop */}
          <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fadeInUp relative">
            {/* Header Row */}
            <div className="grid grid-cols-4 border-b border-slate-100">
              <div className="p-10 border-r border-slate-50 bg-slate-50/30 flex items-end pb-10">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Comparativa</span>
              </div>
              
              {/* Free Plan Header */}
              <div className="p-8 text-center border-r border-slate-50 relative group hover:bg-slate-50/30 transition-colors duration-300">
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-blue-100">
                  <Shield size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 font-display">{t('pricing.free.title')}</h3>
                <p className="text-slate-500 text-xs mb-4 h-8 font-medium px-2">{t('pricing.free.description')}</p>
                <div className="flex flex-col items-center justify-center mb-6 min-h-[4rem]">
                  <div className="h-4 mb-0.5"></div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">US$ 0</span>
                  </div>
                  <div className="text-slate-400 font-medium text-xs mt-1 bg-slate-100 px-2 py-0.5 rounded-full">
                    Gratis de por vida
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all hover:shadow-md hover:-translate-y-0.5">
                  {t('pricing.choosePlan')}
                </button>
              </div>

              {/* Essential Plan Header */}
              <div className="p-8 text-center border-r border-slate-50 relative bg-indigo-50/30 group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md shadow-indigo-200">
                  {t('pricing.mostPopular')}
                </div>
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center mb-4 mt-4 group-hover:scale-105 transition-transform shadow-lg shadow-indigo-200">
                  <Zap size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-indigo-900 mb-1 font-display">{t('pricing.essential.title')}</h3>
                <p className="text-indigo-600/70 text-xs mb-4 h-8 font-medium px-2">{t('pricing.essential.description')}</p>
                <div className="flex flex-col items-center justify-center mb-6 min-h-[4rem]">
                  <div className="text-indigo-400 line-through text-xs font-bold mb-0.5">
                    US$ {plans.essential.originalPrice}
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-indigo-900 tracking-tight">US$ {plans.essential.price}</span>
                    <span className="text-indigo-400 text-xs ml-1 font-medium">/ {t('pricing.month')}</span>
                  </div>
                  <div className="text-indigo-600 font-bold text-xs mt-1 bg-indigo-100 px-2 py-0.5 rounded-full">
                    ≈ {formatARS(plans.essential.price)}
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {t('pricing.choosePlan')}
                </button>
              </div>

              {/* Pro Plan Header */}
              <div className="p-8 text-center relative group hover:bg-slate-50/30 transition-colors duration-300">
                <div className="w-12 h-12 mx-auto rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-fuchsia-100">
                  <Award size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 font-display">{t('pricing.pro.title')}</h3>
                <p className="text-slate-500 text-xs mb-4 h-8 font-medium px-2">{t('pricing.pro.description')}</p>
                <div className="flex flex-col items-center justify-center mb-6 min-h-[4rem]">
                  <div className="text-slate-400 line-through text-xs font-bold mb-0.5">
                    US$ {plans.pro.originalPrice}
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">US$ {plans.pro.price}</span>
                    <span className="text-slate-400 text-xs ml-1 font-medium">/ {t('pricing.month')}</span>
                  </div>
                  <div className="text-slate-500 font-bold text-xs mt-1 bg-slate-100 px-2 py-0.5 rounded-full">
                    ≈ {formatARS(plans.pro.price)}
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all hover:shadow-md hover:-translate-y-0.5">
                  {t('pricing.choosePlan')}
                </button>
              </div>
            </div>

            {/* Features Rows */}
            {featuresList.map((feature, index) => (
              <div key={feature.key} className={`grid grid-cols-4 border-b border-slate-50 hover:bg-slate-50/40 transition-colors ${index === featuresList.length - 1 ? 'border-b-0' : ''}`}>
                
                {/* Feature Name */}
                <div className="p-6 pl-10 border-r border-slate-50 flex items-center gap-4">
                  <div className="text-slate-400 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                    <feature.icon size={20} strokeWidth={2} />
                  </div>
                  <span className="font-bold text-slate-700">{t(`pricing.features.${feature.key}`)}</span>
                </div>

                {/* Free Status */}
                <div className="p-6 border-r border-slate-50 flex items-center justify-center">
                  {plans.free.features[feature.key] ? (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Check size={18} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center opacity-50">
                      <X size={18} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Essential Status */}
                <div className="p-6 border-r border-slate-50 flex items-center justify-center bg-indigo-50/10">
                  {plans.essential.features[feature.key] ? (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                      <Check size={18} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center opacity-50">
                      <X size={18} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Pro Status */}
                <div className="p-6 flex items-center justify-center">
                  {plans.pro.features[feature.key] ? (
                    <div className="w-8 h-8 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
                      <Check size={18} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center opacity-50">
                      <X size={18} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-8">
            {Object.values(plans).map((plan) => (
              <div key={plan.key} className={`relative bg-white rounded-[2.5rem] p-8 border ${plan.key === 'essential' ? 'border-indigo-100 shadow-2xl shadow-indigo-200/40 ring-4 ring-indigo-50' : 'border-slate-100 shadow-xl shadow-slate-200/40'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    {t('pricing.mostPopular')}
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg ${plan.key === 'essential' ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' : `bg-${plan.color}-50 text-${plan.color}-600`}`}>
                    <plan.icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 font-display ${plan.key === 'essential' ? 'text-indigo-900' : 'text-slate-900'}`}>{t(`pricing.${plan.key}.title`)}</h3>
                  <p className={`${plan.key === 'essential' ? 'text-indigo-600/70' : 'text-slate-500'} font-medium`}>{t(`pricing.${plan.key}.description`)}</p>
                </div>

                <div className="text-center mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  {plan.originalPrice && (
                    <div className="text-slate-400 line-through text-sm font-bold mb-1">
                      US$ {plan.originalPrice}
                    </div>
                  )}
                  <div className="flex items-baseline justify-center">
                    <span className={`text-5xl font-black tracking-tight ${plan.key === 'essential' ? 'text-indigo-900' : 'text-slate-900'}`}>US$ {plan.price}</span>
                    <span className="text-slate-400 text-sm ml-1 font-medium">/ {t('pricing.month')}</span>
                  </div>
                  <div className="text-slate-500 font-bold text-sm mt-2">
                    ≈ {formatARS(plan.price)}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {featuresList.slice(0, 6).map((feature) => (
                    <div key={feature.key} className="flex items-center gap-3">
                      {plan.features[feature.key] ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${plan.key === 'essential' ? 'bg-indigo-100 text-indigo-600' : `bg-${plan.color}-100 text-${plan.color}-600`}`}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center shrink-0">
                          <X size={14} strokeWidth={3} />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${plan.features[feature.key] ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                        {t(`pricing.features.${feature.key}`)}
                      </span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg hover:-translate-y-1 ${
                  plan.key === 'essential' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}>
                  {t('pricing.choosePlan')}
                </button>
              </div>
            ))}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
