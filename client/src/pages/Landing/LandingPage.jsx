import React from 'react';
import Navbar from '../../app/components/Navbar';
import Hero from './components/Hero';
import Footer from '../../app/components/Footer';
import BusinessTypes from './components/BusinessTypes';
import {
  SocialProofSection,
  ProblemSection,
  SolutionSection,
  BenefitsSection,
  HowItWorksSection,
  PricingTeaseSection,
  DifferentiatorSection,
  CtaFinalSection,
} from './components/LandingSections';

const LandingPage = () => {
  return (


    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600/20 selection:text-blue-900">
      <Navbar />
      <main>
        {/* 1. HERO — qué es, para quién, por qué */}
        <Hero />

        {/* 2. PRUEBA SOCIAL — números al instante */}
        <SocialProofSection />

        {/* 3. PROBLEMA — conectar emocionalmente */}
        <ProblemSection />

        {/* 4. SOLUCIÓN — Gestly lo resuelve, con screenshot */}
        <SolutionSection />

        {/* 5. BENEFICIOS — bloques alternados imagen/texto */}
        <BenefitsSection />

        {/* 6. CÓMO FUNCIONA — 3 pasos */}
        <HowItWorksSection />

        {/* 7. RUBROS — para todo tipo de negocio */}
        <BusinessTypes />

        {/* 8. PRECIO — 2 planes claros */}
        <PricingTeaseSection />

        {/* 9. DIFERENCIAL */}
        <DifferentiatorSection />

        {/* 10. CTA FINAL — grande, directo */}
        <CtaFinalSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
