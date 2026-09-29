import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const PenguinSvg = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10">
    <ellipse cx="50" cy="65" rx="28" ry="32" fill="#1e293b"/>
    <ellipse cx="50" cy="70" rx="18" ry="22" fill="#f1f5f9"/>
    <circle cx="50" cy="35" r="20" fill="#1e293b"/>
    <circle cx="50" cy="33" r="17" fill="#1e293b"/>
    <ellipse cx="42" cy="30" rx="4" ry="5" fill="white"/>
    <ellipse cx="58" cy="30" rx="4" ry="5" fill="white"/>
    <circle cx="43" cy="30" r="2.5" fill="#1e293b"/>
    <circle cx="57" cy="30" r="2.5" fill="#1e293b"/>
    <ellipse cx="50" cy="38" rx="3" ry="2" fill="#f97316"/>
    <ellipse cx="38" cy="50" rx="5" ry="3" fill="#1e293b" transform="rotate(-15 38 50)"/>
    <ellipse cx="62" cy="50" rx="5" ry="3" fill="#1e293b" transform="rotate(15 62 50)"/>
    <ellipse cx="35" cy="80" rx="8" ry="4" fill="#f97316"/>
    <ellipse cx="65" cy="80" rx="8" ry="4" fill="#f97316"/>
  </svg>
);

const questions = [
  {
    id: 1,
    text: "¿Cuánto cuesta y es seguro?",
    answer: "Gestly tiene planes desde $9.99/mes. Todos los planes incluyen cifrado SSL, backups automáticos y cumplimiento GDPR. Tus datos están protegidos con los más altos estándares de seguridad."
  },
  {
    id: 2,
    text: "¿Cómo cargo productos?",
    answer: "Ve a 'Mi Catálogo' en el menú lateral. Allí puedes agregar productos manualmente, importar desde Excel o usar nuestra carga rápida. Cada producto puede incluir nombre, precio, stock, categoría y código de barras."
  },
  {
    id: 3,
    text: "¿Cómo funciona el sistema?",
    answer: "Gestly es un sistema de gestión integral: control de stock, ventas con POS, clientes, empleados y sucursales. Todo sincronizado en tiempo real. Mira la 'Guía Inicial' en el menú para un tour completo."
  },
  {
    id: 4,
    text: "¿Puedo probarlo gratis?",
    answer: "Sí, ofrecemos 14 días de prueba gratuita sin necesidad de tarjeta. Durante la prueba accedes a todas las funciones del plan Pro."
  },
  {
    id: 5,
    text: "¿Soporta múltiples sucursales?",
    answer: "Sí. Desde el selector de sucursales en la barra superior puedes gestionar varias sucursales, ver stock por local y transferir productos entre ellas."
  },
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '¡Hola! Soy Pingu, el asistente de Gestly. ¿En qué puedo ayudarte?' },
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuestionClick = (q) => {
    setSelectedQuestion(q.id);
    setMessages(prev => [
      ...prev,
      { type: 'user', text: q.text },
      { type: 'bot', text: q.answer },
    ]);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[90vw] sm:w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-zoom-in" style={{ maxHeight: '65vh' }}>
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 flex items-center gap-3 shrink-0">
            <PenguinSvg />
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">Pingu Asistente</p>
              <p className="text-[10px] opacity-70 font-semibold">En línea • Respuesta inmediata</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-slate-900/10 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.type === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white shrink-0 flex items-center justify-center">
                      <PenguinSvg />
                    </div>
                  )}
                  <div className={`px-3 py-2 rounded-2xl leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="grid grid-cols-1 gap-2 pt-2">
                {questions.map(q => (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionClick(q)}
                    className="text-left px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-sm"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            )}

            {messages.length > 1 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                {questions.filter(q => q.id !== selectedQuestion).map(q => (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionClick(q)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <p className="text-[10px] text-center text-slate-400 font-semibold">
              Pingu responde preguntas frecuentes · <button onClick={() => { setMessages([{ type: 'bot', text: '¡Hola! Soy Pingu, el asistente de Gestly. ¿En qué puedo ayudarte?' }]); setSelectedQuestion(null); }} className="underline hover:text-slate-600 dark:hover:text-slate-300">Reiniciar</button>
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        title="Abrir asistente"
      >
        {isOpen ? <X size={24} /> : <PenguinSvg />}
      </button>
    </>
  );
};

export default ChatBot;
