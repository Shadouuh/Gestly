import React from 'react';
import { FaXTwitter, FaInstagram, FaWhatsapp, FaLinkedinIn, FaGithub, FaYoutube, FaTiktok } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/images/landing/Gestly.png';

const Footer = () => {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: <FaXTwitter size={20} />, href: "#", label: "X (Twitter)" },
    { icon: <FaInstagram size={20} />, href: "#", label: "Instagram" },
    { icon: <FaWhatsapp size={20} />, href: "#", label: "WhatsApp" },
    { icon: <FaLinkedinIn size={20} />, href: "#", label: "LinkedIn" },
    { icon: <FaGithub size={20} />, href: "#", label: "GitHub" },
    { icon: <FaYoutube size={20} />, href: "#", label: "YouTube" },
    { icon: <FaTiktok size={20} />, href: "#", label: "TikTok" },
  ];

  return (
    <footer className="relative border-t border-slate-200/70 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-950/70 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-0 w-[420px] h-[420px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-0 w-[520px] h-[520px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Gestly"
                className="h-11 w-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm object-cover bg-white dark:bg-slate-950"
              />
              <div className="leading-tight">
                <p className="font-display font-black text-lg text-slate-900 dark:text-white tracking-tight">Gestly</p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gestión inteligente</p>
              </div>
            </div>

            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md">
              {t('footer.tagline')}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-blue-300 dark:hover:border-blue-700 hover:bg-white dark:hover:bg-slate-950 transition-all shadow-sm flex items-center justify-center"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Producto</p>
              <div className="mt-4 space-y-3 text-sm font-semibold">
                <a href="#" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.product')}
                </a>
                <a href="#" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.features')}
                </a>
                <a href="#" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.pricing')}
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Empresa</p>
              <div className="mt-4 space-y-3 text-sm font-semibold">
                <a href="#" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.about')}
                </a>
                <a href="#" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.contact')}
                </a>
              </div>
            </div>

            <div className="sm:col-span-1 col-span-2">
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Legal</p>
              <div className="mt-4 space-y-3 text-sm font-semibold">
                <a href="#" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t('footer.terms')}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-500">
          <p>{t('footer.copyright')}</p>
          <p className="text-slate-400 dark:text-slate-600">
            Hecho para ventas, stock, fiados y sucursales
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
