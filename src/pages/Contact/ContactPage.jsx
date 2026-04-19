import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../app/components/Navbar';
import Footer from '../../app/components/Footer';
import { Mail, MessageCircle, Briefcase, ArrowRight } from 'lucide-react';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Email Card */}
            <a 
              href={`mailto:${t('contact.email')}`}
              className="group p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-500 font-medium mb-6">{t('contact.email')}</p>
              <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                <span>Enviar correo</span>
                <ArrowRight size={18} />
              </div>
            </a>

            {/* WhatsApp Card */}
            <a 
              href="https://wa.me/5491112345678" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp</h3>
              <p className="text-slate-500 font-medium mb-6">{t('contact.whatsapp')}</p>
              <div className="mt-auto flex items-center gap-2 text-green-600 font-bold group-hover:gap-3 transition-all">
                <span>Chatear ahora</span>
                <ArrowRight size={18} />
              </div>
            </a>
          </div>

          {/* Work With Us Banner */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4 text-indigo-300">
                <Briefcase size={24} />
                <span className="font-bold uppercase tracking-wider text-sm">{t('contact.work')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 font-display">
                ¿Buscas formar parte del equipo?
              </h2>
              <p className="text-slate-400">
                Envíanos tu CV a nuestro correo de contacto.
              </p>
            </div>

            <a 
              href={`mailto:${t('contact.email')}?subject=CV - Postulación`}
              className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Aplicar ahora
            </a>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
