import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder = "Seleccionar", icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 outline-none group relative
          ${isOpen 
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100' 
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
      >
        {selectedOption?.code && (
          <span className="text-xs font-bold tracking-wider">{selectedOption.code}</span>
        )}
        
        {Icon && !selectedOption?.code && <Icon size={16} />}
        
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} 
        />

        {/* Tooltip for current selection */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {selectedOption ? selectedOption.label : placeholder}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-[140px] bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-1 z-50 animate-fadeIn">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                ${value === option.value 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-3">
                {option.code && <span className="text-xs font-bold tracking-wider w-8">{option.code}</span>}
                <span>{option.label}</span>
              </div>
              
              {value === option.value && (
                <Check size={14} className="text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
