import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BarChart3,
  Package,
  FileBarChart,
  Shield,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { login as apiLogin, register as apiRegister } from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';
import logo from '../../assets/images/landing/Gestly.png';
import bgHero from '../../assets/hero/bg-hero.png';
import heroImage from '../../assets/hero/hero-image.png';

const FEATURE_CHIPS = [
  { icon: BarChart3, text: 'Ventas en tiempo real', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Package, text: 'Control de inventario', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: FileBarChart, text: 'Reportes inteligentes', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const InputField = ({ label, icon: Icon, right, ...props }) => (
  <div className="space-y-1">
    <label className="text-[0.78rem] font-semibold text-slate-700 block">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Icon size={15} strokeWidth={2.25} />
      </div>
      <input
        {...props}
        className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-[0.85rem] text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
      />
      {right && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{right}</div>}
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: 'admin@kiosco.com', password: 'admin123', confirmPassword: '' });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!isLogin) {
        if (registerStep === 1 && formData.name && formData.email) { setIsLoading(false); setRegisterStep(2); return; }
        if (registerStep === 2) {
          const result = await apiRegister({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            businessName: `${formData.name.split(' ')[0]}'s Kiosco`,
            templateId: 'kiosco',
          });
          if (result.success) { notify.success('Cuenta creada correctamente. ¡Bienvenido!'); navigate('/app'); }
        }
      } else {
        const result = await apiLogin(formData.email, formData.password);
        if (result.success) { notify.success('Inicio de sesión exitoso'); navigate('/app'); }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error de conexión con el servidor';
      setError(msg);
      if (!err.response) notify.error('No se puede conectar con el servidor. Verificá que el backend esté corriendo en :3001');
    } finally {
      setIsLoading(false);
    }
  };

  const eyeBtn = (
    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-slate-400 hover:text-slate-600 transition-colors">
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-sans selection:bg-blue-100 selection:text-blue-900 p-4"
      style={{ backgroundImage: `url(${bgHero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 border border-white/60" style={{ minHeight: '600px' }}>

        {/* ── LEFT: hero image panel ───────────────────────────────── */}
        <div className="hidden lg:flex w-[58%] flex-col relative overflow-hidden">
          {/* bg tint so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#b8d4f5]/60 to-[#d6e9ff]/40 backdrop-blur-[1px]" />

          {/* Top logo */}
          <div className="relative z-10 p-7 flex items-center gap-2">
            <img src={logo} alt="Gestly" className="h-8 w-8 rounded-lg border border-white/80 shadow-sm object-cover" />
            <span className="font-display font-bold text-[0.95rem] text-[#1a3a8f]">Gestly</span>
          </div>

          {/* Headline */}
          <div className="relative z-10 px-8 pt-1">
            <h2 className="font-display font-bold text-[1.65rem] leading-tight text-[#0f2562]">
              Gestiona tu kiosco,<br />
              <span className="text-[#2563EB]">impulsa tus ventas</span>
            </h2>
            <p className="text-[#3d5a99] text-[0.8rem] mt-2.5 max-w-xs leading-relaxed">
              Administrá ventas, productos e inventario desde un solo lugar.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {FEATURE_CHIPS.map(({ icon: Icon, text, color, bg }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/70 rounded-lg px-2.5 py-1.5 shadow-sm"
                >
                  <div className={`w-6 h-6 rounded-md ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={13} className={color} strokeWidth={2.25} />
                  </div>
                  <span className="text-[0.68rem] font-semibold text-[#1a3a8f]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image — bottom-anchored, overflows slightly */}
          <div className="relative z-10 flex-1 flex items-end justify-center mt-4">
            <img
              src={heroImage}
              alt="Kiosco Gestly"
              className="w-full object-contain object-bottom"
              style={{ maxHeight: '360px' }}
            />
          </div>
        </div>

        {/* ── RIGHT: form card ─────────────────────────────────────── */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 lg:p-10 overflow-y-auto">

          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2 mb-5 lg:hidden">
            <img src={logo} alt="Gestly" className="h-8 w-8 rounded-lg border border-slate-200 object-cover" />
            <span className="font-display font-bold text-[0.95rem] text-slate-900">Gestly</span>
          </div>

          {/* Logo (desktop) */}
          <div className="hidden lg:flex items-center gap-2 mb-4 self-start">
            <img src={logo} alt="Gestly" className="h-8 w-8 rounded-lg border border-slate-200 object-cover" />
            <span className="font-display font-bold text-[0.95rem] text-slate-900">Gestly</span>
          </div>

          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-5">
              {!isLogin && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[0.65rem] font-medium text-blue-700 mb-2">
                  <Sparkles size={11} strokeWidth={2.5} />
                  Gratis · sin tarjeta
                </div>
              )}
              <h1 className="font-display font-bold text-[1.35rem] text-slate-900 mb-1">
                {isLogin ? 'Bienvenido de vuelta' : 'Creá tu cuenta gratis'}
              </h1>
              <p className="text-[0.8rem] text-slate-500">
                {isLogin
                  ? 'Inicia sesión para continuar gestionando tu kiosco.'
                  : 'En menos de 2 minutos tenés todo listo.'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-[0.78rem] font-medium text-red-700 mb-3">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* Register step indicator */}
              {!isLogin && (
                <div className="flex items-center gap-2 mb-1">
                  {[1, 2].map(n => (
                    <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${registerStep >= n ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  ))}
                  <span className="text-xs text-slate-400 font-medium ml-1">{registerStep}/2</span>
                </div>
              )}

              {/* LOGIN */}
              {isLogin && (
                <>
                  <InputField label="Correo electrónico" icon={Mail} type="email" name="email" value={formData.email} placeholder="tu@kiosco.com" onChange={handleChange} />
                  <InputField label="Contraseña" icon={Lock} type={showPassword ? 'text' : 'password'} name="password" value={formData.password} placeholder="••••••••" onChange={handleChange} right={eyeBtn} />
                  <div className="flex items-center justify-between -mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                      <span className="text-[0.78rem] text-slate-600">Recordarme</span>
                    </label>
                    <a href="#" className="text-[0.78rem] font-semibold text-blue-600 hover:text-blue-700">¿Olvidaste tu contraseña?</a>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-[0.85rem] hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:-translate-y-px transition-all duration-200 mt-0.5 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 size={16} className="animate-spin" /> Conectando…</> : 'Iniciar sesión'}
                  </button>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-[0.7rem] text-slate-500 leading-relaxed">
                    Demo: <strong className="text-slate-700">admin@kiosco.com</strong> / <strong className="text-slate-700">admin123</strong>
                  </div>
                </>
              )}

              {/* REGISTER step 1 */}
              {!isLogin && registerStep === 1 && (
                <>
                  <InputField label="Tu nombre" icon={User} type="text" name="name" value={formData.name} placeholder="Ej. Juan Pérez" onChange={handleChange} />
                  <InputField label="Correo electrónico" icon={Mail} type="email" name="email" value={formData.email} placeholder="tu@kiosco.com" onChange={handleChange} />
                  <button type="submit" disabled={!formData.name || !formData.email}
                    className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-[0.85rem] hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:-translate-y-px transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
                    Continuar <ArrowRight size={15} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {/* REGISTER step 2 */}
              {!isLogin && registerStep === 2 && (
                <>
                  <InputField label="Contraseña" icon={Lock} type={showPassword ? 'text' : 'password'} name="password" placeholder="Mínimo 8 caracteres" onChange={handleChange} right={eyeBtn} />
                  <InputField label="Confirmar contraseña" icon={Lock} type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} />
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setRegisterStep(1)}
                      className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[0.85rem] hover:bg-slate-200 transition-all">
                      Atrás
                    </button>
                    <button type="submit" disabled={!formData.password || formData.password !== formData.confirmPassword}
                      className="flex-[2] py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-[0.85rem] hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:-translate-y-px transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none">
                      Crear cuenta gratis
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[0.68rem] text-slate-400 font-medium">o continúa con</span>
              </div>
            </div>

            {/* Google SSO */}
            <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span className="text-[0.85rem] font-semibold text-slate-700">Continuar con Google</span>
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[0.68rem] text-slate-400 mt-3">
              <Shield size={12} strokeWidth={2.25} />
              Tus datos están protegidos
            </p>

            <p className="text-center text-[0.8rem] text-slate-500 mt-4">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
              <button
                type="button"
                onClick={() => { setError(''); setIsLogin(p => !p); setRegisterStep(1); }}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>

            {/* Dev bypass */}
            <button type="button" onClick={() => navigate('/app')}
              className="w-full mt-3 py-2 rounded-lg bg-slate-50 text-slate-400 text-[0.68rem] font-medium hover:bg-slate-100 transition-colors border border-slate-200">
              Entrar directo (dev bypass)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
