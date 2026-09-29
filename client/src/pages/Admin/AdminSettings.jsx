import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, Globe, Bell, Lock, Smartphone, Users,
  CreditCard, Mail, Sliders, Server, Save, CheckCircle, ChevronDown,
  Moon, Sun, RefreshCw, Key, DollarSign, Clock, AlertTriangle
} from 'lucide-react';

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'billing', label: 'Facturación', icon: CreditCard },
    { id: 'system', label: 'Sistema', icon: Server },
  ];

  const Section = ({ id, icon: Icon, label, children }) => (
    <div className={`transition-all duration-300 ${activeSection === id ? 'block animate-fadeIn' : 'hidden'}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
          <Icon size={15} />
        </div>
        <div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-white">{label}</h2>
          <p className="text-[10px] text-slate-500">Configuración de {label.toLowerCase()}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-4 md:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white">Configuración</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ajustes globales de la plataforma</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
          <Save size={13} /> Guardar Cambios
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="w-44 shrink-0 space-y-0.5 hidden md:block">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${activeSection === s.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950'}`}>
                <Icon size={14} /> {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="flex gap-2 md:hidden overflow-x-auto custom-scrollbar pb-2 shrink-0">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                  <Icon size={12} /> {s.label}
                </button>
              );
            })}
          </div>

          <Section id="general" icon={Settings} label="General">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Globe size={13} className="text-indigo-500" /> Información de la Plataforma</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Nombre de la plataforma', value: 'Gestly', type: 'text' },
                    { label: 'URL base', value: 'https://gestly.app', type: 'text' },
                    { label: 'Email de contacto', value: 'soporte@gestly.app', type: 'email' },
                    { label: 'Idioma por defecto', value: 'Español (AR)', type: 'select', options: ['Español (AR)', 'Español (ES)', 'English', 'Português'] },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{f.label}</label>
                      {f.type === 'select' ? (
                        <div className="relative">
                          <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-medium outline-none focus:border-indigo-500 dark:text-white appearance-none">
                            {f.options.map(o => <option key={o}>{o}</option>)}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      ) : (
                        <input type={f.type} defaultValue={f.value} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-medium outline-none focus:border-indigo-500 dark:text-white" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Users size={13} className="text-blue-500" /> Registro y Acceso</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Registro abierto', desc: 'Permitir que nuevos negocios se registren', on: true },
                    { label: 'Verificación de email', desc: 'Requerir verificación de email al registrarse', on: true },
                    { label: 'Onboarding automático', desc: 'Enviar guía de bienvenida automática', on: false },
                    { label: 'Prueba gratuita', desc: '14 días de prueba sin tarjeta', on: true },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">{t.label}</p>
                        <p className="text-[9px] text-slate-500">{t.desc}</p>
                      </div>
                      <button className={`relative w-8 h-4 rounded-full transition-colors ${t.on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${t.on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 mt-3 hover:shadow-md transition-all">
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5"><Smartphone size={13} className="text-emerald-500" /> Personalización</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Color primario</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 border-2 border-indigo-600 cursor-pointer" />
                    <div className="w-8 h-8 rounded-lg bg-blue-600 border-2 border-transparent cursor-pointer hover:border-slate-300" />
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 border-2 border-transparent cursor-pointer hover:border-slate-300" />
                    <div className="w-8 h-8 rounded-lg bg-rose-600 border-2 border-transparent cursor-pointer hover:border-slate-300" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Modo oscuro</label>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      <Sun size={12} /> Claro
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold">
                      <Moon size={12} /> Oscuro
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Logotipo</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">G</div>
                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-300 transition-colors">Cambiar</button>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section id="security" icon={Lock} label="Seguridad">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Key size={13} className="text-red-500" /> Políticas de Contraseña</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Longitud mínima', value: '8 caracteres' },
                    { label: 'Requerir mayúsculas', on: true },
                    { label: 'Requerir números', on: true },
                    { label: 'Requerir símbolos', on: false },
                    { label: 'Expiración cada', value: '90 días' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{f.label}</span>
                      {f.on !== undefined ? (
                        <button className={`relative w-8 h-4 rounded-full transition-colors ${f.on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${f.on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white">{f.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> Autenticación</h3>
                <div className="space-y-3">
                  {[
                    { label: '2FA', desc: 'Autenticación de dos factores', on: false },
                    { label: 'SSO', desc: 'Inicio de sesión único (Google, GitHub)', on: true },
                    { label: 'Bloqueo por intentos', desc: '3 intentos fallidos = bloqueo 30 min', on: true },
                    { label: 'Sesiones concurrentes', desc: 'Permitir múltiples sesiones', on: false },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">{t.label}</p>
                        <p className="text-[9px] text-slate-500">{t.desc}</p>
                      </div>
                      <button className={`relative w-8 h-4 rounded-full transition-colors ${t.on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${t.on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 mt-3 hover:shadow-md transition-all">
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5"><Server size={13} className="text-amber-500" /> Registro de Actividad</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {[
                  { action: 'Inicio de sesión — admin@gestly.com', time: 'Hace 2 minutos', ip: '190.210.x.x' },
                  { action: 'Cambio de contraseña — usuario #12', time: 'Hace 1 hora', ip: '181.164.x.x' },
                  { action: 'Nuevo negocio registrado — Ferretería Oeste', time: 'Hace 3 horas', ip: '200.45.x.x' },
                  { action: 'Intento de acceso fallido — IP bloqueada', time: 'Hace 5 horas', ip: '45.33.x.x' },
                  { action: 'Exportación de datos solicitada', time: 'Hace 1 día', ip: '190.210.x.x' },
                ].map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-[10px]">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{e.action}</p>
                      <p className="text-[9px] text-slate-400">{e.time} · {e.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section id="notifications" icon={Bell} label="Notificaciones">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Bell size={13} className="text-blue-500" /> Canales de Notificación</h3>
              <div className="space-y-3">
                {[
                  { channel: 'Email', desc: 'Notificaciones por correo electrónico', on: true, icon: Mail },
                  { channel: 'Sistema', desc: 'Notificaciones dentro de la plataforma', on: true, icon: Bell },
                  { channel: 'Push', desc: 'Notificaciones push en dispositivos móviles', on: false, icon: Smartphone },
                ].map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">{t.channel}</p>
                        <p className="text-[9px] text-slate-500">{t.desc}</p>
                      </div>
                      <button className={`relative w-8 h-4 rounded-full transition-colors ${t.on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${t.on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 mt-3 hover:shadow-md transition-all">
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5"><Bell size={13} className="text-amber-500" /> Eventos a Notificar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Nuevo registro de negocio', 'Pago recibido', 'Subscripción vencida', 'Intento de acceso sospechoso',
                  'Actualización de plataforma', 'Nuevo vendedor registrado', 'Límite de almacenamiento alcanzado', 'Backup completado'
                ].map((ev, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors cursor-pointer">
                    <input type="checkbox" defaultChecked={i % 2 === 0} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{ev}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section id="billing" icon={CreditCard} label="Facturación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><CreditCard size={13} className="text-emerald-500" /> Proveedor de Pagos</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Procesador', value: 'Mercado Pago' },
                    { label: 'Comisión por transacción', value: '2.99% + $50' },
                    { label: 'Moneda por defecto', value: 'ARS (Peso Argentino)' },
                    { label: 'Ciclo de facturación', value: 'Mensual' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <span className="text-[10px] font-medium text-slate-500">{f.label}</span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">{f.value}</span>
                    </div>
                  ))}
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                    <RefreshCw size={12} /> Configurar proveedor
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><DollarSign size={13} className="text-amber-500" /> Precios y Planes</h3>
                <div className="space-y-3">
                  {[
                    { plan: 'Essential', price: '$5.000/mes', businesses: 62, color: 'text-slate-600' },
                    { plan: 'Pro', price: '$10.000/mes', businesses: 38, color: 'text-amber-600' },
                  ].map(p => (
                    <div key={p.plan} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">{p.plan}</p>
                        <p className="text-[9px] text-slate-500">{p.businesses} negocios</p>
                      </div>
                      <p className={`text-xs font-bold ${p.color}`}>{p.price}</p>
                    </div>
                  ))}
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                    <Sliders size={12} /> Ajustar planes
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 mt-3 hover:shadow-md transition-all">
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5"><CheckCircle size={13} className="text-indigo-500" /> Últimas Transacciones</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-[9px] font-bold text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left py-2 px-2">Negocio</th>
                      <th className="text-right py-2 px-2">Monto</th>
                      <th className="text-center py-2 px-2 hidden sm:table-cell">Estado</th>
                      <th className="text-right py-2 px-2 hidden md:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { name: 'Kiosco Centro', amount: 10000, status: 'paid', date: '25/05/2026' },
                      { name: 'Ferretería Norte', amount: 5000, status: 'paid', date: '24/05/2026' },
                      { name: 'Carnicería Sur', amount: 10000, status: 'paid', date: '23/05/2026' },
                      { name: 'Distribuidora MG', amount: 5000, status: 'pending', date: '22/05/2026' },
                    ].map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                        <td className="py-2 px-2 font-medium text-slate-900 dark:text-white">{t.name}</td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900 dark:text-white">${t.amount.toLocaleString()}</td>
                        <td className="py-2 px-2 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${t.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {t.status === 'paid' ? <CheckCircle size={9} /> : <Clock size={9} />}
                            {t.status === 'paid' ? 'Pagada' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-slate-500 hidden md:table-cell">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          <Section id="system" icon={Server} label="Sistema">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Server size={13} className="text-slate-500" /> Estado de Servicios</h3>
                <div className="space-y-2">
                  {[
                    { service: 'Servidor Web', status: 'Operativo', usage: '45%' },
                    { service: 'Base de Datos', status: 'Operativo', usage: '62%' },
                    { service: 'Cache (Redis)', status: 'Operativo', usage: '28%' },
                    { service: 'Cola de tareas', status: 'Operativo', usage: '12%' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white">{s.service}</p>
                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {s.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white">{s.usage}</p>
                        <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-0.5">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: s.usage }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5"><Sliders size={13} className="text-violet-500" /> Configuración de Performance</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Compresión', on: true },
                    { label: 'CDN activo', on: true },
                    { label: 'Cache de consultas', on: true },
                    { label: 'Modo mantenimiento', on: false },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{t.label}</span>
                      <button className={`relative w-8 h-4 rounded-full transition-colors ${t.on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${t.on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-slate-500">Versión de plataforma</span>
                    <span className="font-bold text-slate-900 dark:text-white">v2.4.1</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Último deploy</span>
                    <span className="font-bold text-slate-900 dark:text-white">25/05/2026 03:00 UTC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 rounded-xl border border-amber-200 dark:border-amber-800 p-4 mt-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Mantenimiento programado</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">El próximo mantenimiento está previsto para el 01/06/2026 a las 03:00 AM (UTC). Tiempo estimado: 30 minutos.</p>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
