import React from 'react';
import { Settings as SettingsIcon, Store, CreditCard, Receipt, Bell, Shield, Users } from 'lucide-react';

const Settings = () => {
  const sections = [
    {
      title: 'Tu Negocio',
      icon: Store,
      description: 'Gestiona la información general, logo y datos fiscales.',
    },
    {
      title: 'Métodos de Pago',
      icon: CreditCard,
      description: 'Configura MercadoPago, tarjetas y cuentas bancarias.',
    },
    {
      title: 'Facturación y Recibos',
      icon: Receipt,
      description: 'Personaliza los tickets y configuraciones de impresión.',
    },
    {
      title: 'Notificaciones',
      icon: Bell,
      description: 'Alertas de stock bajo, cierres de caja y nuevos fiados.',
    },
    {
      title: 'Seguridad',
      icon: Shield,
      description: 'Contraseñas, permisos y control de acceso.',
    },
    {
      title: 'Suscripción',
      icon: Users,
      description: 'Gestiona tu plan Pro y opciones de pago de Gestly.',
    }
  ];

  return (
    <div className="p-6 h-full flex flex-col max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Configuración</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Personaliza y adapta Gestly a las necesidades de tu negocio</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, idx) => (
          <button key={idx} className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all text-left group">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors">
              <section.icon size={24} className="text-slate-600 dark:text-slate-300 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{section.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{section.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h3 className="font-bold text-xl text-white mb-2">¿Necesitas ayuda avanzada?</h3>
          <p className="text-slate-400">Contacta a nuestro equipo de soporte técnico.</p>
        </div>
        <button className="bg-white text-slate-900 font-bold py-3 px-8 rounded-xl hover:bg-slate-100 transition-colors shadow-lg whitespace-nowrap">
          Contactar Soporte
        </button>
      </div>
    </div>
  );
};

export default Settings;