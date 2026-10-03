import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Box, Zap, BarChart3, Loader2, AlertCircle,
} from 'lucide-react';
import { login as apiLogin } from '../../services/api';
import { useNotification } from '../../shared/components/Notification/NotificationContext';

/* Logos SSO inline */
const GoogleMark = () => (
  <svg className="h-[16px] w-[16px]" viewBox="0 0 24 24" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const MicrosoftMark = () => (
  <span className="grid h-[16px] w-[16px] grid-cols-2 gap-[2px]" aria-hidden>
    <span className="rounded-[2px] bg-[#F25022]" />
    <span className="rounded-[2px] bg-[#7FBA00]" />
    <span className="rounded-[2px] bg-[#00A4EF]" />
    <span className="rounded-[2px] bg-[#FFB900]" />
  </span>
);

const HIGHLIGHTS = [
  { icon: Box, t: 'Control total', d: 'de tu stock' },
  { icon: Zap, t: 'Procesos', d: 'más rápidos' },
  { icon: BarChart3, t: 'Tu negocio', d: 'en tiempo real' },
];

const Login = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('rememberedEmail'));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await apiLogin(email, password);
      if (result.success) {
        if (remember) localStorage.setItem('rememberedEmail', email);
        else localStorage.removeItem('rememberedEmail');
        notify.success('¡Bienvenido de vuelta!');
        navigate('/app');
      } else {
        setError(result.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0d1526] font-urbanist lg:h-screen">
      {/* fondo: escena completa desde arriba, en grande y cargada a la izquierda (la sección recorta sin scroll) */}
      <img
        src="/LoginPenguin.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-100 object-cover object-[20%_0%]"
      />

      {/* logo superior izquierdo */}
      <Link
        to="/"
        className="absolute left-5 top-4 z-20 font-heading text-[1.25rem] font-bold tracking-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.45)] sm:left-8"
      >
        Gestly
      </Link>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-start gap-8 px-5 pb-12 pt-16 sm:px-8 lg:h-full lg:min-h-0 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-6 lg:pt-20">
        {/* ── Columna izquierda: textos (desplazados arriba y a la derecha) ── */}
        <div className="w-full max-w-md justify-self-end sm:max-w-lg">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-geist text-[0.56rem] font-semibold uppercase tracking-[0.24em] text-sky-200 ring-1 ring-white/20 backdrop-blur-sm">
            Tu negocio, más simple
          </span>
          <h1 className="mt-3 font-poppins text-[1.9rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[2.5rem]">
            <span className="text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]">Todo tu stock</span>
            <br />
            <span className="text-[#a9c6ff] [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]">en un solo lugar.</span>
          </h1>
          <p className="mt-3 max-w-md font-urbanist text-[0.82rem] leading-relaxed text-slate-200 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
            Compras, ventas, stock y proveedores. Para mayoristas,
            almacenes y todos los rubros.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.t} className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm">
                  <h.icon size={15} />
                </span>
                <span className="leading-tight [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                  <span className="block font-geist text-[0.74rem] font-bold text-white">{h.t}</span>
                  <span className="block font-urbanist text-[0.7rem] text-slate-200">{h.d}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha: tarjeta de acceso ── */}
        <div className="w-full max-w-[400px] justify-self-center rounded-[1.5rem] bg-white p-6 shadow-2xl shadow-black/30 sm:p-7 lg:justify-self-end">
          <p className="font-heading text-[1.2rem] font-bold tracking-tight text-slate-900">Gestly</p>
          <h2 className="mt-3 font-poppins text-[1.4rem] font-bold tracking-tight text-slate-900">
            Iniciá sesión
          </h2>
          <p className="mt-0.5 font-urbanist text-[0.8rem] text-slate-500">
            Volvé a tu negocio en segundos.
          </p>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[0.74rem] font-medium text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail size={15} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 font-urbanist text-[0.82rem] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 font-urbanist text-[0.82rem] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#111827]"
                />
                <span className="font-urbanist text-[0.74rem] font-medium text-slate-500">Recordarme</span>
              </label>
              <a href="#recordar" className="font-urbanist text-[0.74rem] font-semibold text-blue-600 transition hover:text-blue-700">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] py-3 font-geist text-[0.84rem] font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-px hover:bg-[#1f2937] disabled:pointer-events-none disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="font-urbanist text-[0.7rem] text-slate-400">o continúa con</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2 font-geist text-[0.78rem] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:bg-slate-50 hover:shadow"
            >
              <GoogleMark /> Google
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2 font-geist text-[0.78rem] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:bg-slate-50 hover:shadow"
            >
              <MicrosoftMark /> Microsoft
            </button>
          </div>

          <p className="mt-4 text-center font-urbanist text-[0.74rem] text-slate-500">
            ¿No tenés una cuenta?{' '}
            <a href="/#contacto" className="font-semibold text-blue-600 transition hover:text-blue-700">
              Contactanos <ArrowRight size={12} className="inline" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
