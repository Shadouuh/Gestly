import React from 'react';
import Navbar from '../../app/components/Navbar';
import Hero from './components/Hero';
import FeaturesSearch from './components/FeaturesSearch';
import Footer from '../../app/components/Footer';
import BusinessTypes from './components/BusinessTypes';

// Separator Component for smooth transitions
const SectionSeparator = ({ position = 'top', color = 'text-slate-50' }) => {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${position === 'bottom' ? 'transform rotate-180' : ''}`}>
      <svg 
        className={`relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px] ${color}`} 
        data-name="Layer 1" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        
        {/* Transition from Hero (White) to FeaturesSearch (White) */}
        <div className="bg-white">
          <SectionSeparator position="top" color="text-slate-50" />
        </div>

        <BusinessTypes />
        <FeaturesSearch />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
