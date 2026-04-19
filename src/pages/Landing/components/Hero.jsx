import React from 'react';
import Button from '../../../shared/components/Button';
import { ArrowRight, Apple } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import heroImage from '../../../assets/images/landing/image.png';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-20 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-2 relative z-20 animate-slideInLeft">
            
            
            <h1 className="font-display text-7xl md:text-8xl font-bold leading-none tracking-tighter mb-2 text-[#111827]">
              {t('hero.title')}
            </h1>
            <p className="font-display text-5xl md:text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-700/70 to-primary-700 tracking-tighter mb-8 pb-1 delay-100 animate-fadeInUp">
              {t('hero.subtitle')}
            </p>
            
            <p className="font-sans text-lg text-zinc-600 max-w-lg leading-relaxed mb-8 delay-200 animate-fadeInUp">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 delay-300 animate-fadeInUp">
              <Button variant="primary" className="pl-6 pr-8 py-4 text-lg shadow-xl shadow-gray-900/10">
                {t('hero.getStarted')} <ArrowRight size={20} />
              </Button>
              <Button variant="outline" className="pl-6 pr-8 py-4 text-lg border-2 hover:border-primary-600 hover:text-primary-600">
                <Apple size={24} className="mr-2" /> {t('hero.appStore')}
              </Button>
            </div>

            <div className="pt-8 flex items-center gap-8 delay-500 animate-fadeIn">
              <div>
                <h4 className="text-3xl font-bold">100k+</h4>
                <p className="text-sm text-zinc-500">{t('hero.activeUsers')}</p>
              </div>
              <div className="w-px h-12 bg-zinc-200"></div>
              <div>
                <h4 className="text-3xl font-bold">4.9</h4>
                <p className="text-sm text-zinc-500">{t('hero.appRating')}</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end animate-scaleIn delay-200">
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-100 rounded-full blur-3xl -z-10"></div>
            
            {/* Hero Image */}
            <div className="relative z-10 w-full max-w-[1200px] md:max-w-[1200px] lg:max-w-[1600px] lg:mr-40 scale-150 transform hover:scale-175 transition-transform duration-700 ease-out">
               <img 
                src={heroImage} 
                alt="Gestly App" 
                className="w-full h-auto scale-150 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;