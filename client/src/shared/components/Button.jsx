import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2";
  const variants = {
    primary: "bg-[#111827] text-white hover:bg-[#1f2937] shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
    blue: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-white text-zinc-900 border border-zinc-200 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 hover:-translate-y-0.5 active:translate-y-0 shadow-sm",
    outline: "border-2 border-zinc-200 text-zinc-900 hover:border-primary-600 hover:bg-white hover:text-primary-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
    ghost: "text-zinc-600 hover:text-primary-600 hover:bg-primary-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;