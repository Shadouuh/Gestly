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
    <footer className="py-16 border-t border-zinc-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Logo & Tagline */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Gestly" className="h-12 w-12 rounded-full border border-zinc-200 shadow-sm p-1 bg-white" />
            <span className="font-bold text-2xl tracking-tight text-[#111827]">Gestly</span>
          </div>
          <p className="text-zinc-500 text-base max-w-md leading-relaxed">
            {t('footer.tagline')}
          </p>
        </div>

        {/* Social Icons - Minimalist Row */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {socialLinks.map((social, index) => (
            <a 
              key={index} 
              href={social.href} 
              aria-label={social.label}
              className="text-zinc-400 hover:text-[#111827] transition-colors transform hover:scale-110 duration-200"
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Minimalist Links */}
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-zinc-600 mb-10">
          <a href="#" className="hover:text-[#111827] transition-colors">{t('footer.product')}</a>
          <a href="#" className="hover:text-[#111827] transition-colors">{t('footer.features')}</a>
          <a href="#" className="hover:text-[#111827] transition-colors">{t('footer.pricing')}</a>
          <a href="#" className="hover:text-[#111827] transition-colors">{t('footer.about')}</a>
          <a href="#" className="hover:text-[#111827] transition-colors">{t('footer.contact')}</a>
        </div>

        {/* Copyright & Legal */}
        <div className="pt-8 border-t border-zinc-100 w-full flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#111827] transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-[#111827] transition-colors">{t('footer.terms')}</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;