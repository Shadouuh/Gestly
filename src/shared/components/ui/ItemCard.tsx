import React, { useState } from 'react'
import { Edit, Trash2, MoreVertical, Package, ChefHat, TrendingUp, AlertCircle, CheckCircle2, Plus, Minus } from 'lucide-react'
import { ProductThumbnail } from './ProductThumbnail'
import { Badge } from './Badge'
import { Button } from './Button'

export interface ItemCardProps {
  id: string
  imageUrl?: string
  name: string
  category: string
  price?: number
  cost?: number
  stock?: number
  unit?: string
  type: 'product' | 'ingredient'
  layout: 'grid' | 'list'
  onEdit?: () => void
  onDelete?: () => void
  onStockUpdate?: (newStock: number) => void
  className?: string
  trackStock?: boolean
}

export function ItemCard({
  id,
  imageUrl,
  name,
  category,
  price,
  cost,
  stock = 0,
  unit,
  type,
  layout,
  onEdit,
  onDelete,
  onStockUpdate,
  className = '',
  trackStock
}: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatMoney = (val?: number) => val !== undefined ? `$${(val / 100).toFixed(2)}` : '-'
  
  const margin = (price && cost) ? ((price - cost) / price) * 100 : 0
  const isLowStock = trackStock && stock !== undefined && stock <= 5

  // --- LIST LAYOUT ---
  if (layout === 'list') {
    return (
      <div
        className={`group relative flex gap-3 rounded-xl bg-[color:var(--card-bg)] p-2 shadow-sm border border-[color:var(--border)] hover:border-[color:var(--primary-bg)]/30 hover:shadow-md transition-all duration-300 ${className}`}
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[color:var(--app-bg)]/50">
          <ProductThumbnail
            imageUrl={imageUrl}
            category={category}
            name={name}
            className="h-full w-full object-cover"
            iconSize={24}
          />
          <div className="absolute top-0.5 left-0.5">
             <Badge variant={type === 'product' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 rounded-sm shadow-sm">
                {type === 'product' ? 'P' : 'I'}
             </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
          <div className="flex justify-between items-start">
            <div>
               <h3 className="font-bold text-[color:var(--text)] text-sm leading-tight truncate pr-6">{name}</h3>
               <p className="text-[10px] text-[color:var(--muted)] font-medium uppercase tracking-wider mt-0.5">{category}</p>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               {onEdit && (
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onEdit() }}>
                     <Edit className="h-3.5 w-3.5" />
                  </Button>
               )}
               {onDelete && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={(e) => { e.stopPropagation(); onDelete() }}>
                     <Trash2 className="h-3.5 w-3.5" />
                  </Button>
               )}
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
             <div className="flex items-center gap-3">
                {price !== undefined && (
                   <div className="flex flex-col">
                      <span className="text-[9px] text-[color:var(--muted)]">Precio</span>
                      <span className="text-sm font-bold text-[color:var(--text)]">{formatMoney(price)}</span>
                   </div>
                )}
                {cost !== undefined && (
                   <div className="flex flex-col">
                      <span className="text-[9px] text-[color:var(--muted)]">Costo</span>
                      <span className="text-xs font-medium text-[color:var(--text)]">{formatMoney(cost)}</span>
                   </div>
                )}
                {trackStock && (
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] text-[color:var(--muted)]">Stock</span>
                      {onStockUpdate ? (
                        <div className="flex items-center gap-1 bg-[color:var(--outline-bg)] rounded-[var(--radius)] p-0.5" onClick={e => e.stopPropagation()}>
                           <button 
                              className="h-5 w-5 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
                              onClick={() => onStockUpdate(Math.max(0, stock - 1))}
                           >
                              <Minus className="h-3 w-3" />
                           </button>
                           <span className={`text-xs font-bold tabular-nums min-w-[1.5rem] text-center ${isLowStock ? 'text-red-500' : 'text-[color:var(--text)]'}`}>{stock}</span>
                           <button 
                              className="h-5 w-5 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
                              onClick={() => onStockUpdate(stock + 1)}
                           >
                              <Plus className="h-3 w-3" />
                           </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold ${isLowStock ? 'text-red-500' : 'text-[color:var(--text)]'}`}>
                           {stock} {unit}
                        </span>
                      )}
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    )
  }

  // --- GRID LAYOUT ---
  return (
    <div
      className={`group relative flex flex-col rounded-xl bg-[color:var(--card-bg)] shadow-sm border border-[color:var(--border)] transition-all duration-300 overflow-hidden hover:shadow-xl hover:border-[color:var(--primary-bg)]/40 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="aspect-[4/3] w-full relative bg-[color:var(--app-bg)]/50 overflow-hidden">
        <ProductThumbnail
          imageUrl={imageUrl}
          category={category}
          name={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          iconSize={48}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
           <Badge variant={type === 'product' ? 'default' : 'secondary'} className="shadow-lg backdrop-blur-md border-0 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {type === 'product' ? 'Producto' : 'Ingrediente'}
           </Badge>
           {trackStock && isLowStock && (
              <Badge variant="danger" className="shadow-lg backdrop-blur-md border-0 text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                 Bajo Stock
              </Badge>
           )}
        </div>

        {/* Actions Overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
           {onEdit && (
              <Button size="icon" className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white text-black dark:bg-black/80 dark:text-white backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onEdit() }}>
                 <Edit className="h-4 w-4" />
              </Button>
           )}
           {onDelete && (
              <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); onDelete() }}>
                 <Trash2 className="h-4 w-4" />
              </Button>
           )}
        </div>
        
        {/* Margin Tag */}
        {type === 'product' && margin > 0 && (
           <div className="absolute bottom-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {margin.toFixed(0)}%
           </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider truncate mb-1">
            {category}
          </div>
          
          <h3 className="text-sm font-bold text-[color:var(--text)] leading-tight line-clamp-2 mb-3 h-10" title={name}>
            {name}
          </h3>
          
          <div className="grid grid-cols-2 gap-2 py-2 border-t border-[color:var(--border)]/50 border-dashed">
             <div className="flex flex-col">
                <span className="text-[9px] text-[color:var(--muted)] font-medium">Precio</span>
                <span className="text-sm font-bold text-[color:var(--text)]">{formatMoney(price)}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] text-[color:var(--muted)] font-medium">Costo</span>
                <span className="text-sm font-medium text-[color:var(--muted)]">{formatMoney(cost)}</span>
             </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-2 flex items-center justify-between pt-2 border-t border-[color:var(--border)]">
           <div className="flex items-center gap-1.5 text-[color:var(--muted)]">
              {type === 'product' ? <Package className="h-3.5 w-3.5" /> : <ChefHat className="h-3.5 w-3.5" />}
              <span className="text-[10px] font-medium">{type === 'product' ? 'Venta directa' : 'Insumo'}</span>
           </div>
           
           {trackStock && (
              onStockUpdate ? (
                 <div className="flex items-center gap-1 bg-[color:var(--outline-bg)] rounded-[var(--radius)] p-0.5" onClick={e => e.stopPropagation()}>
                    <button 
                       className="h-5 w-5 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
                       onClick={() => onStockUpdate(Math.max(0, stock - 1))}
                    >
                       <Minus className="h-3 w-3" />
                    </button>
                    <span className={`text-[10px] font-bold tabular-nums min-w-[1.5rem] text-center ${isLowStock ? 'text-red-500' : 'text-[color:var(--text)]'}`}>{stock}</span>
                    <button 
                       className="h-5 w-5 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
                       onClick={() => onStockUpdate(stock + 1)}
                    >
                       <Plus className="h-3 w-3" />
                    </button>
                 </div>
              ) : (
                 <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isLowStock ? 'text-red-500' : 'text-[color:var(--text)]'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {stock} {unit}
                 </div>
              )
           )}
        </div>
      </div>
    </div>
  )
}
