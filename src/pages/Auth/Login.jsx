import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, BarChart3, Users2, Zap, ArrowRight, Phone } from 'lucide-react';
import logo from '../../assets/images/landing/Gestly.png';
import catalogoImg from '../../assets/images/penguin/Catalogo.png';
import estadisticasImg from '../../assets/images/penguin/Estadisticas.png';
import ventasImg from '../../assets/images/penguin/ventas.png';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [registerStep, setRegisterStep] = useState(1);
  const [phoneStep, setPhoneStep] = useState('phone'); // 'phone' or 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const slides = [
    {
      image: catalogoImg,
      icon: <Zap size={24} />,
      quote: "La herramienta definitiva para escalar tu negocio sin complicaciones.",
      subtext: "Gestiona stock, ventas y equipo en un solo lugar."
    },
    {
      image: estadisticasImg,
      icon: <BarChart3 size={24} />,
      quote: "Toma decisiones inteligentes basadas en datos reales.",
      subtext: "Visualiza el crecimiento de tu empresa con reportes detallados."
    },
    {
      image: ventasImg,
      icon: <Users2 size={24} />,
      quote: "Potencia a tu equipo y mejora la atención al cliente.",
      subtext: "Herramientas diseñadas para agilizar cada venta."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (registerStep === 1 && formData.name && formData.email) {
      setRegisterStep(2);
    }
  };

  const handlePhoneLogin = () => {
    setIsPhoneLogin(true);
    setPhoneStep('phone');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (formData.phone) {
      setPhoneStep('otp');
      // Here you would trigger the SMS sending logic
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // Here verify OTP
    navigate('/');
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPhoneLogin) return; // Handled separately
    
    if (!isLogin) {
      if (registerStep === 2) {
        navigate('/onboarding', { state: { name: formData.name } });
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Left Column - Image Carousel (Hidden on mobile) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-slate-900">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={slide.image} 
                alt="Slide" 
                className="w-full h-full object-contain object-center scale-90"
              />
              {/* Modern Grain Overlay */}
              <div className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay" style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
              }}></div>
              
              {/* Gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-12 left-12 right-12 z-10 text-white">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-lg">
                <span className="text-white">{slide.icon}</span>
              </div>
              <blockquote className="text-3xl font-display font-bold leading-tight mb-4 drop-shadow-sm max-w-lg">
                "{slide.quote}"
              </blockquote>
              <p className="text-slate-300 font-medium text-lg max-w-md">{slide.subtext}</p>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-12 right-12 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 relative bg-white max-h-screen overflow-y-auto">
        
        <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 group z-20">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>

        <div className="w-full max-w-sm animate-fadeInUp">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Gestly" className="h-12 w-auto mx-auto hover:scale-105 transition-transform duration-300" />
            </Link>
            <h1 className="text-2xl font-display font-bold text-slate-900 mb-2 tracking-tight">
              {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isLogin ? 'Ingresa tus credenciales para acceder.' : 'Comienza tu prueba gratuita de 14 días.'}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-row gap-2 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-600 text-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-600 text-xs">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.244-4.255c-2.724-2.526-6.255-4.214-10.625-4.214-8.791 0-16 7.188-16 16s7.208 16 16 16c8.98 0 16.104-7.427 16.104-16.104 0-1.443-0.167-2.844-0.479-4.182h-15.625z"></path></svg>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-600 text-xs">
              <svg className="w-4 h-4 text-[#00a4ef]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.55 21H3v-8.55h8.55V21zM21 21h-8.55v-8.55H21V21zM11.55 11.55H3V3h8.55v8.55zM21 11.55h-8.55V3H21v8.55z"/></svg>
            </button>
            <button 
              type="button"
              onClick={handlePhoneLogin}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-600 text-xs ${isPhoneLogin ? 'bg-slate-100 border-indigo-200 ring-2 ring-indigo-50' : 'border-slate-200'}`}
            >
               <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400">
                {isPhoneLogin ? 'Ingresa con tu número móvil' : 'O continúa con email'}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Phone Login Flow */}
            {isPhoneLogin && (
              <div className="space-y-4 animate-fadeIn">
                {phoneStep === 'phone' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 ml-1">Número de teléfono</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <Phone size={18} />
                        </div>
                        <div className="absolute inset-y-0 left-10 flex items-center">
                          <span className="text-sm font-medium text-slate-500 border-r border-slate-200 pr-2 mr-2">+54</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="11 1234 5678"
                          autoFocus
                          className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm text-sm mt-2"
                    >
                      Enviar código
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-2">
                      <p className="text-sm text-slate-600">Ingresa el código enviado al</p>
                      <p className="text-sm font-bold text-slate-900">+54 {formData.phone}</p>
                    </div>
                    <div className="flex justify-center gap-2 my-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-10 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm text-sm mt-2"
                    >
                      Verificar y entrar
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPhoneStep('phone')}
                      className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 py-2"
                    >
                      Cambiar número
                    </button>
                  </>
                )}
                <button 
                  type="button"
                  onClick={() => setIsPhoneLogin(false)}
                  className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-700 py-2"
                >
                  Volver a usar email
                </button>
              </div>
            )}

            {/* Login View (Email) */}
            {isLogin && !isPhoneLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="nombre@empresa.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-700">Contraseña</label>
                    <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                      ¿Olvidaste?
                    </a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm text-sm mt-2"
                >
                  Iniciar Sesión
                </button>
              </>
            )}

            {/* Register View - Multi-step */}
            {!isLogin && !isPhoneLogin && (
              <div className="relative min-h-[220px]">
                {/* Step 1: Personal Info */}
                <div className={`transition-all duration-300 absolute inset-0 ${registerStep === 1 ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 -z-10 -translate-x-10'}`}>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 ml-1">Nombre completo</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          placeholder="Ej. Juan Pérez"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 ml-1">Email profesional</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          placeholder="nombre@empresa.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!formData.name || !formData.email}
                      className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Step 2: Security */}
                <div className={`transition-all duration-300 absolute inset-0 ${registerStep === 2 ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 -z-10 translate-x-10'}`}>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 ml-1">Contraseña</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 ml-1">Confirmar contraseña</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all text-sm"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={!formData.password || formData.password !== formData.confirmPassword}
                        className="flex-[2] bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Crear cuenta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setRegisterStep(1);
                  setIsPhoneLogin(false);
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 ml-1 hover:underline transition-all"
              >
                {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          <button 
            onClick={() => navigate('/app')}
            className="w-full mt-4 bg-indigo-50 text-indigo-600 font-bold py-3 px-4 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Entrar a la App Directamente (Bypass)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
