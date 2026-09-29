import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/landing/Gestly.png';

const navLinks = [
  { path: '/features', label: 'Características' },
  { path: '/pricing', label: 'Precios' },
  { path: '/for-who', label: 'Beneficios' },
  { path: '/about', label: 'Sobre nosotros' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className={`pointer-events-auto transition-all duration-300 ${
          isScrolled ? 'px-0 pt-0' : 'px-4 sm:px-6 pt-4'
        }`}
      >
        <nav
          className={`mx-auto max-w-6xl transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl shadow-[0_6px_36px_rgba(15,23,42,0.08)] border-b border-slate-200/80 dark:border-slate-800/70 rounded-none'
              : 'bg-white/70 dark:bg-slate-950/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/60 rounded-2xl shadow-[0_10px_40px_rgba(15,23,42,0.08)]'
          } ${mobileOpen ? 'overflow-hidden' : ''}`}
        >
          <div className={`max-w-6xl mx-auto px-4 sm:px-5 flex items-center justify-between gap-3 ${isScrolled ? 'h-14' : 'h-16'}`}>
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img
              src={logo}
              alt="Gestly"
              className={`rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-sm object-cover transition-all group-hover:scale-105 ${
                isScrolled ? 'h-8 w-8' : 'h-9 w-9'
              }`}
            />
            <span className="font-display font-bold text-[0.95rem] tracking-tight text-slate-900 dark:text-white">
              Gestly
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-1.5 rounded-lg text-[0.8rem] font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-[0.8rem] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[0.8rem] font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/25 transition-all hover:shadow-blue-600/35 active:scale-[0.98]"
            >
              Prueba gratis
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          </div>

          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 bg-white/98 dark:bg-slate-950/95">
              <div className="space-y-0.5">
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-[0.8rem] font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[0.8rem] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="py-2.5 rounded-xl bg-blue-600 text-[0.8rem] font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Prueba gratis
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
