import React, { useState, useEffect } from 'react';
import CustomSelect from '../../shared/components/Select/CustomSelect';
import { Menu, Globe, LogIn, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/landing/Gestly.png';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const languages = [
    { value: 'es', label: 'Español', code: 'ESP' },
    { value: 'en', label: 'English', code: 'ENG' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (value) => {
    i18n.changeLanguage(value);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md transition-all duration-300 border-b ${
      isScrolled 
        ? 'h-16 border-zinc-200/80 shadow-sm' 
        : 'h-20 border-transparent shadow-none'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img 
              src={logo} 
              alt="Gestly" 
              className={`relative z-10 w-auto object-contain transition-all duration-300 ${
                isScrolled ? 'h-8' : 'h-10'
              }`} 
            />
          </div>
          <span className={`font-display font-black tracking-tight text-slate-900 transition-all duration-300 ${
            isScrolled ? 'text-xl' : 'text-2xl'
          }`}>Gestly</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { path: '/', label: 'navbar.home' },
            { path: '/what-is-gestly', label: 'navbar.whatIsGestly' },
            { path: '/pricing', label: 'navbar.pricing' },
            { path: '/about', label: 'navbar.about' },
            { path: '/contact', label: 'navbar.contact' },
            { path: '/guide', label: 'navbar.guide' },
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`relative font-medium text-sm transition-colors py-2 group ${
                isActive(item.path) ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t(item.label)}
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-indigo-600 transition-all duration-300 rounded-full ${
                isActive(item.path) ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:flex group relative px-6 py-2.5 rounded-full font-medium text-sm text-slate-600 hover:text-indigo-600 transition-all overflow-hidden bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-100"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <LogIn size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
              {t('navbar.login')}
            </span>
          </button>

          <button 
            onClick={() => navigate('/login')}
            className="group relative px-6 py-2.5 rounded-full font-medium text-sm text-white shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden bg-[#111827]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {t('navbar.getStarted')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-indigo-400" />
            </span>
          </button>

          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

          <div className="hidden md:block">
            <CustomSelect 
              options={languages} 
              value={i18n.language.split('-')[0]} 
              onChange={handleLanguageChange}
              icon={Globe}
            />
          </div>

          <button className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

