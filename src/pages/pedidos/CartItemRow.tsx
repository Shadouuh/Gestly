import { useState, useEffect, useRef } from 'react'
import { Minus, Plus, Trash2, Edit2, Check, X, RotateCcw } from 'lucide-react'
import { ProductThumbnail } from '@shared/components/ui/ProductThumbnail'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { type CartItem } from '@shared/services/posService'

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (qty: number) => void
  onRemove: () => void
  isMobile?: boolean
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function CartItemRow({ item, onUpdateQuantity, onRemove, isMobile = false }: CartItemRowProps) {
  // Price Editing State
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [editPriceVal, setEditPriceVal] = useState('')
  const priceInputRef = useRef<HTMLInputElement>(null)

  // Quantity Editing State
  const [isEditingQty, setIsEditingQty] = useState(false)
  const [editQtyVal, setEditQtyVal] = useState('')
  const qtyInputRef = useRef<HTMLInputElement>(null)

  // Determine unit type
  const unit = item.unidad?.toLowerCase() || 'u'
  const isKg = unit === 'kg'
  const isL = unit === 'lt' || unit === 'l'
  const isG = unit === 'g' || unit === 'gr'
  const isMl = unit === 'ml'
  
  const isWeight = isKg || isL || isG || isMl
  
  // Calculate step for +/- buttons
  // If Kg/L -> 0.1 (100g), if g/ml -> 100, others -> 1
  const step = (isKg || isL) ? 0.1 : (isG || isMl) ? 100 : 1

  const currentTotal = item.priceCents * item.quantity

  // Focus management
  useEffect(() => {
    if (isEditingPrice && priceInputRef.current) {
      priceInputRef.current.focus()
      priceInputRef.current.select()
    }
  }, [isEditingPrice])

  useEffect(() => {
    if (isEditingQty && qtyInputRef.current) {
      qtyInputRef.current.focus()
      qtyInputRef.current.select()
    }
  }, [isEditingQty])

  // --- Price Editing Logic ---

  const handleStartEditPrice = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditPriceVal((currentTotal / 100).toFixed(2))
    setIsEditingPrice(true)
    setIsEditingQty(false)
  }

  const handleRoundPrice = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentVal = parseFloat(editPriceVal)
    if (!isNaN(currentVal)) {
      // Round to nearest 50
      const rounded = Math.round(currentVal / 50) * 50
      setEditPriceVal(rounded.toFixed(2))
      priceInputRef.current?.focus()
    }
  }

  const handleSubmitPrice = () => {
    setIsEditingPrice(false)
    const val = parseFloat(editPriceVal)
    
    if (!isNaN(val) && val >= 0) {
      const targetCents = Math.round(val * 100)
      
      if (item.priceCents > 0) {
        // Reverse calculation: Qty = TotalPrice / UnitPrice
        const newQty = targetCents / item.priceCents
        // Keep precision but avoid long floats
        onUpdateQuantity(Number(newQty.toFixed(4)))
      }
    }
  }

  // --- Quantity Editing Logic ---

  const handleStartEditQty = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditQtyVal(item.quantity.toString())
    setIsEditingQty(true)
    setIsEditingPrice(false)
  }

  const handleSubmitQty = () => {
    setIsEditingQty(false)
    const val = parseFloat(editQtyVal)
    if (!isNaN(val) && val > 0) {
      onUpdateQuantity(val)
    } else if (val === 0) {
      onRemove()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, type: 'price' | 'qty') => {
    if (e.key === 'Enter') {
      if (type === 'price') handleSubmitPrice()
      else handleSubmitQty()
    }
    if (e.key === 'Escape') {
      setIsEditingPrice(false)
      setIsEditingQty(false)
    }
  }

  const formatQuantity = (qty: number) => {
    if (isKg) {
      if (qty < 1 && qty > 0) return `${Math.round(qty * 1000)}g`
      return `${Number(qty.toFixed(3))}kg`
    }
    if (isL) {
      if (qty < 1 && qty > 0) return `${Math.round(qty * 1000)}ml`
      return `${Number(qty.toFixed(3))}L`
    }
    if (isG) return `${Math.round(qty)}g`
    if (isMl) return `${Math.round(qty)}ml`
    
    return qty
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex gap-3 p-3 rounded-[var(--radius)] bg-[color:var(--app-bg)] border border-[color:var(--border)] shadow-sm">
        <ProductThumbnail 
           imageUrl={item.imageUrl}
           category={item.category}
           name={item.nombre}
           className="h-16 w-16 rounded-[calc(var(--radius)-4px)] bg-white flex-shrink-0 object-cover"
           iconSize={24}
        />
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
           <div className="flex justify-between items-start gap-2">
              <div className="font-semibold text-sm leading-tight line-clamp-2">{item.nombre}</div>
              <button 
                 onClick={onRemove}
                 className="p-1 text-[color:var(--muted)] hover:text-red-500"
              >
                 <Trash2 size={16} />
              </button>
           </div>
           
           <div className="flex items-end justify-between mt-2">
              <div className="flex items-center gap-1 bg-[color:var(--card-bg)] rounded-[calc(var(--radius)-4px)] p-1 border shadow-sm">
                <button 
                   onClick={() => onUpdateQuantity(Number((item.quantity - step).toFixed(3)))} 
                   className="w-8 h-8 flex items-center justify-center font-bold text-[color:var(--muted)] hover:text-[color:var(--text)] active:bg-[color:var(--ghost-hover-bg)] rounded-md transition-colors"
                >
                   <Minus size={16} strokeWidth={2.5} />
                </button>
                
                {isEditingQty ? (
                  <input
                    ref={qtyInputRef}
                    value={editQtyVal}
                    onChange={e => setEditQtyVal(e.target.value)}
                    onBlur={handleSubmitQty}
                    onKeyDown={e => handleKeyDown(e, 'qty')}
                    className="w-16 text-center text-sm font-bold bg-[color:var(--app-bg)] border border-[color:var(--primary-bg)] rounded outline-none"
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span 
                    onClick={handleStartEditQty}
                    className="text-sm font-bold min-w-[2.5rem] text-center px-1 tabular-nums cursor-pointer hover:text-[color:var(--primary-bg)] underline decoration-dotted underline-offset-4"
                  >
                     {formatQuantity(item.quantity)}
                  </span>
                )}

                <button 
                   onClick={() => onUpdateQuantity(Number((item.quantity + step).toFixed(3)))} 
                   className="w-8 h-8 flex items-center justify-center font-bold text-[color:var(--muted)] hover:text-[color:var(--text)] active:bg-[color:var(--ghost-hover-bg)] rounded-md transition-colors"
                >
                   <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
              
              <div 
                className="relative font-bold text-base cursor-pointer hover:text-[color:var(--primary-bg)] transition-colors group"
                onClick={handleStartEditPrice}
                title="Click para editar precio total"
              >
                {isEditingPrice ? (
                  <div className="absolute bottom-0 right-0 z-10 flex flex-col items-end gap-1 p-2 bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-lg shadow-lg min-w-[140px]" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center w-full">
                      <span className="text-xs mr-1 text-[color:var(--muted)]">$</span>
                      <input
                        ref={priceInputRef}
                        value={editPriceVal}
                        onChange={e => setEditPriceVal(e.target.value)}
                        onBlur={handleSubmitPrice} // Note: This might conflict with button click if not handled carefully. 
                        // Actually onBlur might trigger before button click. 
                        // Better to rely on Enter key or clicking outside for submit, 
                        // but let's keep it simple for now or use a "Done" button if needed.
                        // We'll remove onBlur here to allow clicking the Round button without submitting immediately.
                        onKeyDown={e => handleKeyDown(e, 'price')}
                        className="w-full p-1 text-right text-base font-bold bg-[color:var(--app-bg)] border border-[color:var(--primary-bg)] rounded shadow-sm outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-between w-full gap-1">
                       <button
                          onMouseDown={handleRoundPrice} // Use onMouseDown to prevent blur
                          className="px-2 py-1 text-[10px] font-bold bg-[color:var(--muted)]/10 hover:bg-[color:var(--muted)]/20 text-[color:var(--muted)] rounded flex items-center gap-1"
                          title="Redondear a 10"
                       >
                          <RotateCcw size={10} /> Redondear
                       </button>
                       <button
                          onMouseDown={handleSubmitPrice}
                          className="px-2 py-1 text-[10px] font-bold bg-[color:var(--primary-bg)] text-white rounded"
                       >
                          OK
                       </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {formatMoney(currentTotal)}
                    <Edit2 className="absolute -top-2 -right-3 h-3 w-3 text-[color:var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </div>
           </div>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="group relative flex gap-2 p-2 rounded-[var(--radius)] bg-[color:var(--app-bg)] border border-[color:var(--border)] hover:border-[color:var(--primary-bg)]/30 transition-all shadow-sm">
      <ProductThumbnail 
         imageUrl={item.imageUrl}
         category={item.category}
         name={item.nombre}
         className="h-10 w-10 rounded-[calc(var(--radius)-4px)] bg-[color:var(--card-bg)] border border-[color:var(--border)] flex-shrink-0 object-cover"
         iconSize={16}
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between">
         <div className="flex justify-between items-start gap-1">
            <div className="font-semibold text-xs leading-tight line-clamp-1" title={item.nombre}>{item.nombre}</div>
            <button 
               onClick={onRemove}
               className="text-[color:var(--muted)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
            >
               <Trash2 size={12} />
            </button>
         </div>
         
         <div className="flex items-end justify-between mt-1">
            <div className="flex items-center gap-1 bg-[color:var(--card-bg)] rounded-[calc(var(--radius)-4px)] p-0.5 border border-[color:var(--border)]">
               <button 
                  onClick={() => onUpdateQuantity(Number((item.quantity - step).toFixed(3)))} 
                  className="w-7 h-7 flex items-center justify-center hover:bg-[color:var(--ghost-hover-bg)] rounded-[calc(var(--radius)-4px)] text-xs text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
               >
                  <Minus size={12} strokeWidth={3} />
               </button>
               
               {isEditingQty ? (
                 <input
                   ref={qtyInputRef}
                   value={editQtyVal}
                   onChange={e => setEditQtyVal(e.target.value)}
                   onBlur={handleSubmitQty}
                   onKeyDown={e => handleKeyDown(e, 'qty')}
                   className="w-14 text-center text-xs font-bold bg-[color:var(--app-bg)] border border-[color:var(--primary-bg)] rounded outline-none p-0"
                   onClick={e => e.stopPropagation()}
                 />
               ) : (
                 <span 
                    onClick={handleStartEditQty}
                    className="text-xs font-bold min-w-[2rem] px-1 text-center tabular-nums cursor-pointer hover:text-[color:var(--primary-bg)] underline decoration-dotted underline-offset-4"
                 >
                    {formatQuantity(item.quantity)}
                 </span>
               )}

               <button 
                  onClick={() => onUpdateQuantity(Number((item.quantity + step).toFixed(3)))} 
                  className="w-7 h-7 flex items-center justify-center hover:bg-[color:var(--ghost-hover-bg)] rounded-[calc(var(--radius)-4px)] text-xs text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
               >
                  <Plus size={12} strokeWidth={3} />
               </button>
            </div>
            
            <div 
              className="relative font-bold text-xs tabular-nums cursor-pointer text-[color:var(--text)] hover:text-[color:var(--primary-bg)] transition-colors group/price border-b border-dotted border-[color:var(--muted)] hover:border-[color:var(--primary-bg)] px-0.5"
              onClick={handleStartEditPrice}
              title="Click para ajustar precio o redondear"
            >
               {isEditingPrice ? (
                 <div className="absolute bottom-0 right-0 z-10 flex flex-col items-end gap-1 p-2 bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded shadow-lg min-w-[120px]" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center w-full">
                      <span className="text-[9px] mr-0.5 text-[color:var(--muted)]">$</span>
                      <input
                        ref={priceInputRef}
                        value={editPriceVal}
                        onChange={e => setEditPriceVal(e.target.value)}
                        // Removed onBlur to allow button interaction
                        onKeyDown={e => handleKeyDown(e, 'price')}
                        className="w-full p-0.5 text-right text-xs font-bold bg-[color:var(--app-bg)] border border-[color:var(--primary-bg)] rounded shadow-sm outline-none"
                        autoFocus
                      />
                    </div>
                <div className="flex justify-between w-full gap-1 mt-1">
                   <button
                      onMouseDown={handleRoundPrice}
                      className="flex-1 px-1.5 py-1 text-[10px] font-bold bg-[color:var(--muted)]/10 hover:bg-[color:var(--muted)]/20 text-[color:var(--muted)] rounded flex items-center justify-center gap-1 transition-colors"
                      title="Redondear a 10"
                   >
                      <RotateCcw size={10} /> Redondear
                   </button>
                   <button
                      onMouseDown={handleSubmitPrice}
                      className="px-2 py-1 text-[10px] font-bold bg-[color:var(--primary-bg)] text-white rounded hover:brightness-110 transition-all"
                   >
                      OK
                   </button>
                </div>
                 </div>
               ) : (
                 <>
                   {formatMoney(currentTotal)}
                   <Edit2 className="absolute -top-1.5 -right-2 h-2.5 w-2.5 text-[color:var(--muted)] opacity-0 group-hover/price:opacity-100 transition-opacity" />
                 </>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
