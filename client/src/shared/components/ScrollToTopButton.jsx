import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const getScrollTop = () => {
    const container = document.querySelector('.app-shell-page');
    if (container) return container.scrollTop;
    return window.scrollY || document.documentElement.scrollTop;
  };

  useEffect(() => {
    const onScroll = () => setVisible(getScrollTop() > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    const container = document.querySelector('.app-shell-page');
    if (container) container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      container?.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('.app-shell-page');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-4 left-4 sm:left-6 z-50 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all flex items-center justify-center ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      title="Volver arriba"
    >
      <ChevronUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;
