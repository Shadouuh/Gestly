import React from 'react';
import { Package, Edit2, Trash2, Check } from 'lucide-react';

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
  const colorClass = categoryData?.color || 'text-slate-500 bg-slate-50';

  // Mapper seguro para evitar que Tailwind purgue las clases generadas dinámicamente
  const getAccentColor = (colorStr) => {
    if (!colorStr) return 'bg-slate-500';
    if (colorStr.includes('purple')) return 'bg-purple-500';
    if (colorStr.includes('blue')) return 'bg-blue-500';
    if (colorStr.includes('amber')) return 'bg-amber-500';
    if (colorStr.includes('pink')) return 'bg-pink-500';
    if (colorStr.includes('rose')) return 'bg-rose-500';
    if (colorStr.includes('cyan')) return 'bg-cyan-500';
    if (colorStr.includes('red')) return 'bg-red-500';
    if (colorStr.includes('yellow')) return 'bg-yellow-500';
    if (colorStr.includes('orange')) return 'bg-orange-500';
    if (colorStr.includes('emerald')) return 'bg-emerald-500';
    if (colorStr.includes('green')) return 'bg-green-500';
    if (colorStr.includes('sky')) return 'bg-sky-500';
    if (colorStr.includes('indigo')) return 'bg-indigo-500';
    if (colorStr.includes('violet')) return 'bg-violet-500';
    if (colorStr.includes('fuchsia')) return 'bg-fuchsia-500';
    if (colorStr.includes('lime')) return 'bg-lime-500';
    if (colorStr.includes('zinc')) return 'bg-zinc-500';
    if (colorStr.includes('teal')) return 'bg-teal-500';
    return 'bg-slate-500';
  };

  const accentColorClass = getAccentColor(colorClass);

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onClick}
        className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-colors duration-200 flex items-center gap-4 p-4 ${
          isSelected ? 'border-slate-900 dark:border-white shadow-md ring-1 ring-slate-900/10 dark:ring-white/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm'
        } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {/* Barra de color de categoría */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accentColorClass}`}></div>

        {/* Icon/Image */}
        <div className="flex-shrink-0 relative ml-1">
          {product.useIcon ? (
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 ${colorClass}`}>
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm mb-1.5 truncate transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`} title={product.name}>
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${colorClass}`}>
              <Icon size={9} />
              {categoryData?.name || 'Categoría'}
            </span>
          </div>
          {children && <div className="mt-2">{children}</div>}
        </div>

        {/* Price & Stock */}
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

        {/* Actions */}
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

  // Grid View
  return (
    <div 
      onClick={onClick}
      className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 flex flex-col relative overflow-hidden ${
        isSelected ? 'border-slate-900 dark:border-white shadow-md ring-2 ring-slate-900/10 dark:ring-white/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Barra superior de color de categoría */}
      <div className={`absolute top-0 left-0 right-0 h-1 z-20 ${accentColorClass}`}></div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 shadow-sm z-20">
          <Check size={14} strokeWidth={3} />
        </div>
      )}

      {/* Top Section: Icon/Image - MUCH BIGGER */}
      <div className="relative w-full aspect-square bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="absolute top-3 left-3 z-10">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-md shadow-sm border border-white/20 dark:border-slate-700/50 ${colorClass}`}>
            {categoryData?.name || 'Categoría'}
          </span>
        </div>

        {product.image ? (
          <div className="w-full h-full p-4 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
            />
          </div>
        ) : product.useIcon ? (
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${colorClass}`}>
            <Icon size={40} strokeWidth={2} />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm">
            <Package size={40} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col bg-white dark:bg-slate-900">
        <h3 className={`font-bold text-sm mb-3 line-clamp-2 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`} title={product.name}>
          {product.name}
        </h3>
        
        {/* Custom children or Price & Stock compacto */}
        <div className="mt-auto">
          {children ? children : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Precio</span>
                <div className="text-lg font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                  ${product.price?.toLocaleString()}
                  {product.unit && <span className="text-[10px] font-bold text-slate-400">/ {product.unit}</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Stock</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${product.stock > 50 ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : product.stock > 20 ? 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' : 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {product.stock} u.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hover actions */}
      {showActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-30">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" 
              title="Editar"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(product); }}
              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md" 
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;