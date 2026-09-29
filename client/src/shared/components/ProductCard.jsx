import React from 'react';
import { Package, Edit2, Trash2, Check } from 'lucide-react';

const accentMap = {
  purple: 'purple', blue: 'blue', amber: 'amber', pink: 'pink', rose: 'rose',
  cyan: 'cyan', red: 'red', yellow: 'yellow', orange: 'orange', emerald: 'emerald',
  green: 'green', sky: 'sky', indigo: 'indigo', violet: 'violet', fuchsia: 'fuchsia',
  lime: 'lime', zinc: 'zinc', teal: 'teal', slate: 'slate', gray: 'gray',
};

const getAccent = (colorStr) => {
  if (!colorStr) return { bg: 'bg-slate-500', light: 'from-slate-400/20', ring: 'ring-slate-500/30' };
  for (const [key, val] of Object.entries(accentMap)) {
    if (colorStr.includes(key)) return {
      bg: `bg-${val}-500`,
      light: `from-${val}-400/20`,
      ring: `ring-${val}-500/30`,
    };
  }
  return { bg: 'bg-slate-500', light: 'from-slate-400/20', ring: 'ring-slate-500/30' };
};

const ProductCard = ({ 
  product, 
  categoryData, 
  viewMode = 'grid', 
  onEdit, 
  onDelete, 
  onClick,
  isSelected = false,
  showActions = true,
  className = "",
  children
}) => {
  const Icon = categoryData?.icon || Package;
  const colorStr = categoryData?.color || 'text-slate-500 bg-slate-50';
  const accent = getAccent(colorStr);

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onClick}
        className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 flex items-center gap-4 p-4 relative overflow-hidden ${
          isSelected ? 'border-slate-900 dark:border-white shadow-md ring-1 ring-slate-900/10 dark:ring-white/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm hover:shadow-lg'
        } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accent.bg}`}></div>

        <div className="flex-shrink-0 relative ml-1">
          {product.useIcon ? (
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 ${colorStr}`}>
              <Icon size={24} strokeWidth={2} />
            </div>
          ) : product.image ? (
            <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white dark:bg-slate-800" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package size={24} className="text-slate-300 dark:text-slate-500" strokeWidth={1.5} />
            </div>
          )}
          {isSelected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 shadow-sm z-10">
              <Check size={14} strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm mb-1.5 truncate transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`} title={product.name}>
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${colorStr}`}>
              <Icon size={9} />
              {categoryData?.name || 'Categoría'}
            </span>
          </div>
          {children && <div className="mt-2">{children}</div>}
        </div>

        {!children && (
          <div className="flex-shrink-0 text-right">
            <div className="text-lg font-black text-slate-900 dark:text-white flex items-baseline gap-1">
              ${product.price?.toLocaleString()}
              {product.unit && <span className="text-[10px] font-bold text-slate-400">/ {product.unit}</span>}
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Stock:</span>
               <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${product.stock > 50 ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : product.stock > 20 ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' : 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400'}`}>
                {product.stock}
              </span>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" 
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`group bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 flex flex-col overflow-hidden active:scale-[0.98] relative ${
        isSelected 
          ? 'border-slate-900 dark:border-white shadow-md ring-2 ring-slate-900/10 dark:ring-white/10' 
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm hover:shadow-xl hover:-translate-y-0.5'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Category accent bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent.bg} z-10`} />

      {/* Image area */}
      <div className={`relative h-24 sm:h-28 md:h-32 bg-gradient-to-b ${accent.light} to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-b ${accent.light} opacity-30 dark:opacity-10`} />
        
        {/* Category badge */}
        {categoryData && (
          <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 ${colorStr.split(' ')[0]} z-10`}>
            {categoryData.name}
          </span>
        )}

        {/* Hover actions */}
        {showActions && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
            {onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50" title="Editar">
                <Edit2 size={13} />
              </button>
            )}
            {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                className="p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50" title="Eliminar">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}

        {product.image ? (
          <div className="w-full h-full p-3 sm:p-4 flex items-center justify-center">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
          </div>
        ) : product.useIcon ? (
          <div className="flex items-center justify-center">
            <Icon size={40} strokeWidth={1.5} className={`${colorStr.split(' ')[0]} opacity-60`} />
          </div>
        ) : (
          <Package size={36} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg z-10">
            <Check size={12} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Info area */}
      <div className={`p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5 ${isSelected ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
        <h3 className={`text-[13px] font-bold leading-tight line-clamp-2 transition-colors ${
          isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white'
        }`} title={product.name}>
          {product.name}
        </h3>

        {children ? children : (
          <div className="mt-auto flex items-end justify-between gap-1">
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                ${product.price?.toLocaleString()}
                {product.unit && <span className="text-[9px] font-bold text-slate-400 ml-0.5">/{product.unit}</span>}
              </div>
              {product.stock !== undefined && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 50 ? 'bg-emerald-500' : product.stock > 20 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${product.stock > 50 ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : product.stock > 20 ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' : 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {product.stock} ud.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
