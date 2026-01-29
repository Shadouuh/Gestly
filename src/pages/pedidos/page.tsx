import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, Beer, Candy, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, 
  Cookie, CreditCard, DollarSign, Filter, Flame, GlassWater, Grid, Home, 
  LayoutList, Package, Search, ShoppingBag, ShoppingCart, Smartphone, Sparkles, 
  User, X, Store, Heart, Share2, SlidersHorizontal, Check, Trash2, Tag, ArrowUpDown, Plus, Minus
} from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Slider } from '@shared/components/ui/Slider'
import { Badge } from '@shared/components/ui/Badge'
import { useAuthStore } from '@shared/stores/authStore'
import { useCartStore } from '@shared/stores/cartStore'
import { useSalesStore } from '@shared/stores/salesStore'
import { useToastStore } from '@shared/stores/toastStore'
import { useUiStore } from '@shared/stores/uiStore'
import { getProducts, type Product } from '@shared/services/posService'
import { ProductThumbnail } from '@shared/components/ui/ProductThumbnail'
import { CartItemRow } from './CartItemRow'
import { simpleHash } from '@shared/utils/categoryHelpers'

// --- Types & Utilities ---

type PaymentMethod = 'efectivo' | 'tarjeta' | 'mp'


function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

// Extended product type to support new UI features (mocked for now)
type EnhancedProduct = Product & {
  tags: string[]
  description?: string
  isNew?: boolean
  isBestSeller?: boolean
  unitType: 'unit' | 'weight'
  step: number
}

const enhanceProduct = (p: Product): EnhancedProduct => {
  // Deterministic pseudo-random based on ID to keep it consistent during renders
  const hash = simpleHash(String(p.id))
  
  const possibleTags = ['Sin TACC', 'Vegano', 'Oferta', 'Premium', 'Orgánico', 'Novedad']
  const tags = [p.categoria]
  if (hash % 3 === 0) tags.push(possibleTags[hash % possibleTags.length])
  
  // Determine unit type and step
  const isWeight = ['kg', 'g', 'l', 'ml'].includes(p.unidad?.toLowerCase() || '') || (p.unidad && p.unidad !== 'u')
  const unitType = isWeight ? 'weight' : 'unit'
  
  // Step logic: if kg/l, step is 0.1 (100g/ml). If g/ml, step is 100.
  let step = 1
  if (unitType === 'weight') {
     const u = p.unidad?.toLowerCase()
     if (u === 'kg' || u === 'l' || u === 'lt') step = 0.1
     else if (u === 'g' || u === 'gr' || u === 'ml') step = 100
     else step = 1
  }

  return {
    ...p,
    tags,
    description: `Disfruta de la mejor calidad con ${p.nombre}. Un producto destacado de nuestra categoría ${p.categoria}.`,
    isNew: hash % 10 === 0,
    isBestSeller: hash % 8 === 0,
    unitType,
    step
  }
}

interface ProductCardProps {
  product: EnhancedProduct
  quantityInCart: number
  onAdd: (qty?: number) => void
  onUpdateQuantity?: (qty: number) => void
  layout: 'grid' | 'list'
  onClick?: () => void
}

function ProductCard({ product, quantityInCart, onAdd, onUpdateQuantity, layout, onClick }: ProductCardProps) {
  const business = useAuthStore((s) => s.business)
  const isStockSimple = business?.stockMode === 'simple'
  const [isHovered, setIsHovered] = useState(false)
  const [isEditingQty, setIsEditingQty] = useState(false)
  const [editQtyVal, setEditQtyVal] = useState('')
  
  // Weight Logic
  const [weightQty, setWeightQty] = useState(product.step)
  const isByWeight = product.unitType === 'weight'
  
  const ventaCents = product.priceCents
  const priceFormatted = formatMoney(ventaCents)
  const priceLabel = isByWeight ? `${priceFormatted} / ${product.unidad}` : priceFormatted
  const stockLabel = !isStockSimple && product.trackStock && typeof product.stock === 'number' ? `Stock: ${product.stock}` : null

  const handleWeightChange = (e: React.MouseEvent, delta: number) => {
     e.stopPropagation()
     setWeightQty(prev => {
        const next = Number((prev + delta).toFixed(3))
        return next < product.step ? product.step : next
     })
  }

  const formatWeight = (val: number) => {
     const u = product.unidad?.toLowerCase()
     if (u === 'kg') {
        if (val < 1) return `${Math.round(val * 1000)}g`
        return `${val}kg`
     }
     if (u === 'l' || u === 'lt') {
        if (val < 1) return `${Math.round(val * 1000)}ml`
        return `${val}L`
     }
     return `${val}${product.unidad}`
  }

  const handleAdd = (e?: React.MouseEvent) => {
      e?.stopPropagation()
      onAdd(isByWeight ? weightQty : 1)
  }

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isByWeight) return
    setEditQtyVal(String(quantityInCart))
    setIsEditingQty(true)
  }

  const submitEdit = () => {
    setIsEditingQty(false)
    const val = parseFloat(editQtyVal)
    if (!isNaN(val) && val > 0 && onUpdateQuantity) {
      onUpdateQuantity(val)
    }
  }

  // --- LIST LAYOUT ---
  if (layout === 'list') {
    return (
      <div
        className="group relative flex gap-2 sm:gap-4 rounded-[var(--radius)] bg-[color:var(--card-bg)] p-1.5 sm:p-2.5 shadow-sm border border-[color:var(--border)] hover:border-[color:var(--primary-bg)]/30 hover:shadow-md transition-all duration-200 w-full max-w-[100vw] sm:max-w-full overflow-hidden sm:min-h-[90px]"
      >
        <div className="relative h-14 w-14 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-[calc(var(--radius)_-_4px)] bg-[color:var(--app-bg)]/50">
          <ProductThumbnail
            imageUrl={product.imageUrl}
            category={product.categoria}
            name={product.nombre}
            className="h-full w-full object-cover"
            iconSize={20}
          />
          {quantityInCart > 0 && (
            <div className="absolute top-0.5 left-0.5 rounded-full bg-[color:var(--primary-bg)] px-1 py-[1px] text-[8px] font-bold text-[color:var(--primary-fg)] shadow-sm">
              x{quantityInCart}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
          <div>
            <div className="flex justify-between items-start gap-1">
              <h3 className="font-semibold text-[color:var(--text)] line-clamp-2 text-xs sm:text-sm leading-tight">{product.nombre}</h3>
            </div>
             <div className="flex items-center gap-2 mt-0.5 mb-1">
                <span className="text-[9px] text-[color:var(--muted)] font-medium uppercase tracking-wider">{product.categoria}</span>
                {product.isNew && <Badge variant="success" className="text-[8px] h-3 px-1 rounded-full">Nuevo</Badge>}
             </div>
          </div>
          
          <div className="flex items-end justify-between mt-0.5">
             <div className="flex flex-col">
                <div className="text-sm sm:text-base font-bold text-[color:var(--text)] whitespace-nowrap">{priceLabel}</div>
                {stockLabel && <div className="text-[8px] font-medium text-[color:var(--muted)]">{stockLabel}</div>}
             </div>
             
             <Button 
                onClick={handleAdd}
                size="sm"
                className="h-6 px-2.5 rounded-full text-[10px] font-bold shadow-none border border-[color:var(--border)] hover:bg-[color:var(--primary-bg)] hover:text-[color:var(--primary-fg)] hover:border-[color:var(--primary-bg)]"
             >
                Agregar
             </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- STANDARD GRID LAYOUT (Unified & Mobile Optimized) ---
  return (
    <div
      className="group relative flex flex-col rounded-[var(--radius)] bg-[color:var(--card-bg)] shadow-sm border border-[color:var(--border)] transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-[color:var(--primary-bg)]/30 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleAdd}
    >
      {/* Image Section */}
      <div className="aspect-square w-full relative bg-[color:var(--app-bg)]/50 overflow-hidden">
        <ProductThumbnail
          imageUrl={product.imageUrl}
          category={product.categoria}
          name={product.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          iconSize={40}
        />
        
        {/* Mobile-optimized badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
           {product.isNew && (
             <Badge variant="success" className="shadow-sm backdrop-blur-md bg-emerald-500/90 border-0 text-[9px] px-1.5 py-0.5 rounded-full">New</Badge>
           )}
           {product.isBestSeller && (
             <Badge variant="warning" className="shadow-sm backdrop-blur-md bg-amber-500/90 border-0 text-[9px] px-1.5 py-0.5 rounded-full">Top</Badge>
           )}
        </div>

        {quantityInCart > 0 && (
          <div className="absolute top-2 right-2 z-10 rounded-full bg-[color:var(--primary-bg)] px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--primary-fg)] shadow-lg shadow-black/10 animate-in zoom-in-50">
            {isByWeight ? formatWeight(quantityInCart) : `x${quantityInCart}`}
          </div>
        )}
        
        {/* Hover/Touch Controls Overlay */}
        <div 
           onClick={(e) => e.stopPropagation()}
           className="absolute bottom-0 inset-x-0 p-2 flex justify-end items-end z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
        >
           {quantityInCart > 0 ? (
              <div className="flex items-center gap-1 bg-[color:var(--card-bg)] rounded-full shadow-lg border border-[color:var(--border)] p-1.5 animate-in slide-in-from-bottom-2 fade-in zoom-in-95">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onAdd(isByWeight ? -weightQty : -1) }}
                    className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[color:var(--ghost-hover-bg)] text-[color:var(--text)] transition-colors active:scale-90"
                 >
                    <Minus size={16} strokeWidth={3} />
                 </button>
                 <span 
                    onClick={startEditing}
                    className={`text-sm font-bold min-w-[2rem] text-center tabular-nums flex items-center justify-center ${isByWeight ? 'cursor-pointer hover:text-[color:var(--primary-bg)] underline decoration-dotted underline-offset-4' : ''}`}
                 >
                    {isEditingQty ? (
                       <input 
                          autoFocus
                          onClick={e => e.stopPropagation()}
                          value={editQtyVal}
                          onChange={e => setEditQtyVal(e.target.value)}
                          onBlur={submitEdit}
                          onKeyDown={e => e.key === 'Enter' && submitEdit()}
                          className="w-20 h-8 text-center bg-[color:var(--app-bg)] text-[color:var(--text)] rounded-md text-sm p-0 border border-[color:var(--primary-bg)] outline-none shadow-sm"
                       />
                    ) : (
                       isByWeight ? formatWeight(quantityInCart) : quantityInCart
                    )}
                 </span>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onAdd(isByWeight ? weightQty : 1) }}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-sm hover:brightness-110 active:scale-90 transition-all"
                 >
                    <Plus size={16} strokeWidth={3} />
                 </button>
              </div>
           ) : (
              <button 
                 onClick={(e) => { e.stopPropagation(); handleAdd() }}
                 className="h-9 w-9 flex items-center justify-center rounded-full bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-md transition-all active:scale-90 hover:scale-110 hover:shadow-lg translate-y-0"
                 aria-label="Agregar al carrito"
              >
                 <Plus size={18} strokeWidth={2.5} />
              </button>
           )}
        </div>

        {isByWeight && (
          <div className="absolute bottom-2 left-2 rounded-md bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider shadow-sm border border-white/10">
            {product.unidad}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-2 sm:p-3">
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-bold text-[color:var(--muted)] uppercase tracking-wider truncate mb-0.5">
            {product.categoria}
          </div>
          
          <h3 className="text-xs sm:text-sm font-semibold text-[color:var(--text)] leading-tight line-clamp-2 mb-1.5 min-h-[2rem]" title={product.nombre}>
            {product.nombre}
          </h3>
          
          {/* Tags - visible only if space permits or relevant */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5 hidden sm:flex">
               {product.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[color:var(--ghost-hover-bg)] text-[color:var(--muted)] border border-[color:var(--border)]">
                     {tag}
                  </span>
               ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-1.5 flex items-center justify-between gap-2 border-t border-[color:var(--border)]/30 sm:border-none sm:pt-0">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[color:var(--text)]">{priceFormatted}</span>
            {isByWeight && <span className="text-[9px] text-[color:var(--muted)]">/ {product.unidad}</span>}
            {stockLabel && <span className="text-[8px] text-[color:var(--muted)] font-medium hidden sm:inline">{stockLabel}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Quantity Selector Dialog ---

interface QuantitySelectorProps {
   product: EnhancedProduct
   onConfirm: (qty: number) => void
   onCancel: () => void
}

function QuantitySelector({ product, onConfirm, onCancel }: QuantitySelectorProps) {
   const [mode, setMode] = useState<'price' | 'weight'>('price') 
   const [val, setVal] = useState('')
   
   // Calculate qty based on mode
   const calculatedQty = () => {
      const v = parseFloat(val)
      if (isNaN(v) || v <= 0) return 0
      
      if (mode === 'weight') return v 
      
      if (mode === 'price') {
         const price = v
         const unitPrice = product.priceCents / 100
         if (unitPrice <= 0) return 0
         return price / unitPrice
      }
      return v
   }
   
   // Display calculated opposite
   const displayOpposite = () => {
       const qty = calculatedQty()
       if (qty <= 0) return '-'
       
       if (mode === 'price') {
           // Show Weight
           const u = product.unidad?.toLowerCase()
           if (u === 'kg') return `${qty.toFixed(3)} kg`
           if (u === 'l' || u === 'lt') return `${qty.toFixed(3)} L`
           return `${qty.toFixed(1)} ${product.unidad}`
       } else {
           // Show Price
           const price = qty * (product.priceCents / 100)
           return `$${price.toFixed(2)}`
       }
   }

   const placeholder = mode === 'price' ? '0.00' : product.unidad === 'kg' || product.unidad === 'l' ? '0.000' : '0'
   const unitLabel = mode === 'price' ? '$' : product.unidad

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
         <div className="w-full max-w-sm rounded-[var(--radius)] bg-[color:var(--card-bg)] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-[color:var(--border)]">
             {/* Header */}
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-lg font-bold">{product.nombre}</h3>
                   <p className="text-sm text-[color:var(--muted)]">Precio por {product.unidad}: ${product.priceCents/100}</p>
                </div>
                <button onClick={onCancel} className="p-1 hover:bg-[color:var(--ghost-hover-bg)] rounded-full">
                   <X size={20} />
                </button>
             </div>
             
             {/* Toggles */}
             <div className="flex bg-[color:var(--app-bg)] p-1 rounded-lg mb-6 border border-[color:var(--border)]">
                <button 
                   onClick={() => { setMode('price'); setVal('') }}
                   className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'price' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--primary-bg)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                >
                   Por Monto ($)
                </button>
                <button 
                   onClick={() => { setMode('weight'); setVal('') }}
                   className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'weight' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--primary-bg)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                >
                   Por Cantidad
                </button>
             </div>
             
             {/* Input */}
             <div className="space-y-4 mb-6">
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] font-bold uppercase text-xs tracking-wider">
                      {unitLabel}
                   </span>
                   <Input 
                      autoFocus
                      type="number"
                      value={val}
                      onChange={e => setVal(e.target.value)}
                      placeholder={placeholder}
                      className="pl-8 text-lg font-bold h-12"
                      onKeyDown={e => {
                         if (e.key === 'Enter') {
                            const q = calculatedQty()
                            if (q > 0) onConfirm(q)
                         }
                      }}
                   />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-[color:var(--ghost-hover-bg)] rounded-lg border border-[color:var(--border)]/50">
                   <span className="text-sm font-medium text-[color:var(--muted)]">
                      {mode === 'price' ? 'Cantidad estimada:' : 'Precio estimado:'}
                   </span>
                   <span className="text-lg font-bold text-[color:var(--text)]">
                      {displayOpposite()}
                   </span>
                </div>
             </div>
             
             {/* Actions */}
             <div className="flex gap-3">
                <Button variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
                <Button 
                   className="flex-1 bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]"
                   disabled={calculatedQty() <= 0}
                   onClick={() => onConfirm(calculatedQty())}
                >
                   Agregar
                </Button>
             </div>
         </div>
      </div>
   )
}

// --- Main Page Component ---

export function PedidosPage() {
  const business = useAuthStore((s) => s.business)
  const account = useAuthStore((s) => s.account)
  const activeBranchId = useAuthStore((s) => s.activeBranchId)
  
  const items = useCartStore((s) => s.items)
  const addProduct = useCartStore((s) => s.addProduct)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clear = useCartStore((s) => s.clear)
  const itemCount = useCartStore((s) => s.itemCount)
  const totalCents = useCartStore((s) => s.totalCents)

  const registerSale = useSalesStore((s) => s.registerSale)
  const loadSales = useSalesStore((s) => s.loadSales)
  const showToast = useToastStore((s) => s.showToast)
  const navigate = useNavigate()

  // Data State
  const [rawProducts, setRawProducts] = useState<EnhancedProduct[]>([])
  const [productsStatus, setProductsStatus] = useState<'loading' | 'success' | 'error'>('loading')

  // Filter State
  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]) // 0 to 1000
  const [onlyAvailable, setOnlyAvailable] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [activeTab, setActiveTab] = useState('Todos')
  const [unitFilter, setUnitFilter] = useState<'all' | 'unit' | 'weight'>('all')
  
  // View State
  const [sortBy, setSortBy] = useState<'name' | 'priceAsc' | 'priceDesc'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const effectiveViewMode = isMobile ? 'list' : viewMode
  const [showFilters, setShowFilters] = useState(false) // Toggle for filter section
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Cart/Checkout State
  const isCartOpen = useUiStore((s) => s.isCartOpen)
  const setIsCartOpen = useUiStore((s) => s.setIsCartOpen)
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
  const [isPending, setIsPending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [productToAdd, setProductToAdd] = useState<EnhancedProduct | null>(null)

  // Load Products
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!business) return
      setProductsStatus('loading')
      try {
        const products = await getProducts(business.id)
        if (cancelled) return
        
        // Enhance products with mock data
        const enhanced = products.map(enhanceProduct)
        setRawProducts(enhanced)
        
        // Calculate max price for slider
        const maxPrice = Math.max(...enhanced.map(p => p.priceCents / 100), 1000)
        setPriceRange([0, Math.ceil(maxPrice)])
        
        setProductsStatus('success')
      } catch (e) {
        if (cancelled) return
        setProductsStatus('error')
      }
    }
    void run()
    return () => { cancelled = true }
  }, [business, activeBranchId])

  // Derived Data
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of rawProducts) set.add(p.categoria)
    return Array.from(set).sort()
  }, [rawProducts])

  const allTags = useMemo(() => {
     const set = new Set<string>()
     for (const p of rawProducts) {
        p.tags.forEach(t => set.add(t))
     }
     return Array.from(set).sort()
  }, [rawProducts])

  const maxProductPrice = useMemo(() => {
     if (rawProducts.length === 0) return 1000
     return Math.ceil(Math.max(...rawProducts.map(p => p.priceCents / 100)))
  }, [rawProducts])

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let res = rawProducts.filter((p) => {
      // Search
      if (query && !p.nombre.toLowerCase().includes(query.toLowerCase())) return false
      
      // Categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoria)) return false
      
      // Price
      const priceVal = p.priceCents / 100
      if (priceVal < priceRange[0] || priceVal > priceRange[1]) return false
      
      // Availability
      if (onlyAvailable && !p.disponible) return false
      
      // Tags
      if (selectedTags.length > 0 && !selectedTags.some(t => p.tags.includes(t))) return false
      
      // Unit Filter
      const matchesUnit = unitFilter === 'all' 
         ? true 
         : unitFilter === 'unit' 
            ? p.unitType === 'unit'
            : p.unitType === 'weight'

      if (!matchesUnit) return false

      return true
    })

    // Sorting
    res.sort((a, b) => {
      if (sortBy === 'name') return a.nombre.localeCompare(b.nombre)
      if (sortBy === 'priceAsc') return a.priceCents - b.priceCents
      if (sortBy === 'priceDesc') return b.priceCents - a.priceCents
      return 0
    })

    return res
  }, [rawProducts, query, selectedCategories, priceRange, onlyAvailable, selectedTags, sortBy, unitFilter])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
     const start = (currentPage - 1) * itemsPerPage
     return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  // Reset page when filters change
  useEffect(() => {
     setCurrentPage(1)
  }, [query, selectedCategories, priceRange, onlyAvailable, selectedTags, sortBy])

  // Handlers
  const handleAddToCart = (product: EnhancedProduct, qty: number = 1) => {
     addProduct(product, qty)
     showToast(`Agregado: ${product.nombre}`, 'success')
  }

  const handleProductClick = (product: EnhancedProduct) => {
     if (product.unitType === 'weight') {
        setProductToAdd(product)
     } else {
        handleAddToCart(product, 1)
     }
  }

  const toggleCategory = (cat: string) => {
     setSelectedCategories(prev => 
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
     )
  }

  const toggleTag = (tag: string) => {
     setSelectedTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
     )
  }

  const clearFilters = () => {
     setQuery('')
     setSelectedCategories([])
     setPriceRange([0, maxProductPrice])
     setOnlyAvailable(true)
     setSelectedTags([])
     setSortBy('name')
  }

  // Cart/Checkout logic
  const confirmCheckout = async () => {
    if (!business || items.length === 0) return
    const total = totalCents()
    const sale = await registerSale({
      businessId: business.id,
      branchId: (activeBranchId && activeBranchId !== 'all') ? activeBranchId : (account?.branchId || 'main'),
      userId: account?.id,
      userName: account?.nombre,
      date: new Date().toISOString(),
      items,
      totalCents: total,
      paymentMethod,
      customerName: isPending ? customerName.trim() || 'Sin nombre' : undefined,
      isPending,
    })
    
    if (sale) {
      showToast('Venta registrada', 'success')
      clear()
      setPaymentMethodOpen(false)
      setCheckoutOpen(false)
      setIsCartOpen(false)
      setCustomerName('')
      setIsPending(false)
      setPaymentMethod('efectivo')
      await loadSales(business.id)
    } else {
      showToast('Error al registrar venta', 'error')
    }
  }

  // Handle Tab Click
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'Todos') {
      setSelectedCategories([])
    } else {
      setSelectedCategories([tab])
    }
  }

  const renderFilterBar = () => (
     <div className={`w-full bg-[color:var(--card-bg)] border-b border-[color:var(--border)] animate-in slide-in-from-top-2 overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-none'}`}>
        <div className="max-w-full px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Sort & Availability */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] flex items-center gap-2">
                  <ArrowUpDown size={14} /> Ordenar y Estado
               </h3>
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 p-1 bg-[color:var(--app-bg)] rounded-lg border border-[color:var(--border)]">
                     <button 
                        onClick={() => setSortBy('name')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'name' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                     >
                        Nombre
                     </button>
                     <button 
                        onClick={() => setSortBy('priceAsc')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'priceAsc' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                     >
                        $ - $$
                     </button>
                     <button 
                        onClick={() => setSortBy('priceDesc')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'priceDesc' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                     >
                        $$ - $
                     </button>
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--app-bg)]/50 cursor-pointer hover:bg-[color:var(--app-bg)] transition-colors">
                     <span className="text-sm font-medium">Solo disponibles</span>
                     <input 
                        type="checkbox" 
                        checked={onlyAvailable}
                        onChange={(e) => setOnlyAvailable(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[color:var(--primary-bg)] focus:ring-[color:var(--primary-bg)]"
                     />
                  </label>
               </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] flex items-center gap-2">
                     <DollarSign size={14} /> Rango de Precio
                  </h3>
                  <span className="text-xs font-mono font-medium text-[color:var(--primary-bg)]">
                     ${priceRange[0]} - ${priceRange[1]}
                  </span>
               </div>
               <div className="px-2">
                  <Slider 
                     min={0} 
                     max={maxProductPrice} 
                     step={10} 
                     value={priceRange} 
                     onValueChange={setPriceRange}
                     className="py-4"
                  />
               </div>
            </div>

            {/* Tags Filter (Improved Design) */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] flex items-center gap-2">
                  <Tag size={14} /> Etiquetas
               </h3>
               <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {allTags.map(tag => (
                     <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all border ${
                           selectedTags.includes(tag)
                              ? 'bg-[color:var(--text)] text-[color:var(--bg)] border-[color:var(--text)]'
                              : 'bg-[color:var(--app-bg)] text-[color:var(--muted)] border-[color:var(--border)] hover:border-[color:var(--text)]'
                        }`}
                     >
                        {tag}
                     </button>
                  ))}
               </div>
            </div>
        </div>
     </div>
  )

  return (
    <div className="h-full flex flex-col md:flex-row bg-[color:var(--app-bg)] overflow-hidden font-sans">
      
      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
         
         {/* MODERN HEADER - SOLID BACKGROUND */}
         <div className="sticky top-0 z-20 bg-[color:var(--card-bg)] border-b border-[color:var(--border)] shadow-sm transition-all">
            <div className="px-4 py-3 w-full flex flex-col sm:flex-row items-center gap-4 justify-between">
               
               {/* Categories - Segmented Control Style */}
               <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 touch-pan-x custom-scrollbar">
                  <div className="inline-flex p-1 bg-[color:var(--app-bg)] rounded-xl border border-[color:var(--border)] min-w-full sm:min-w-0">
                     <button 
                        onClick={() => handleTabChange('Todos')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                           activeTab === 'Todos' 
                              ? 'bg-[color:var(--card-bg)] text-[color:var(--text)] shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                        }`}
                     >
                        <Store size={14} strokeWidth={2.5} className={activeTab === 'Todos' ? 'text-[color:var(--primary-bg)]' : ''} />
                        Todos
                     </button>

                     {categories.map(cat => (
                        <button
                           key={cat}
                           onClick={() => handleTabChange(cat)}
                           className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                              activeTab === cat
                                 ? 'bg-[color:var(--card-bg)] text-[color:var(--text)] shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                 : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                           }`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Unit Filter Toggle */}
               <div className="flex bg-[color:var(--app-bg)] rounded-lg p-1 border border-[color:var(--border)] h-9">
                  <button 
                     onClick={() => setUnitFilter('all')}
                     className={`px-3 text-xs font-bold rounded-md transition-all ${unitFilter === 'all' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                  >
                     Todos
                  </button>
                  <button 
                     onClick={() => setUnitFilter('unit')}
                     className={`px-3 text-xs font-bold rounded-md transition-all ${unitFilter === 'unit' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                  >
                     x Un
                  </button>
                  <button 
                     onClick={() => setUnitFilter('weight')}
                     className={`px-3 text-xs font-bold rounded-md transition-all ${unitFilter === 'weight' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                  >
                     x Peso
                  </button>
               </div>

               {/* Actions & View Toggles */}
               <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  
                  {/* View Mode Toggle - Improved Contrast */}
                  <div className="hidden sm:flex bg-[color:var(--app-bg)] rounded-lg p-1 border border-[color:var(--border)]">
                     <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${
                           viewMode === 'grid' 
                              ? 'bg-[color:var(--card-bg)] text-[color:var(--text)] shadow-sm' 
                              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                        }`}
                        title="Vista Cuadrícula"
                     >
                        <Grid size={16} strokeWidth={2} />
                     </button>
                     <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${
                           viewMode === 'list' 
                              ? 'bg-[color:var(--card-bg)] text-[color:var(--text)] shadow-sm' 
                              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                        }`}
                        title="Vista Lista"
                     >
                        <LayoutList size={16} strokeWidth={2} />
                     </button>
                  </div>

                  <div className="h-6 w-px bg-[color:var(--border)] mx-1" />

                  <Button 
                     variant={showFilters ? "primary" : "outline"}
                     onClick={() => setShowFilters(!showFilters)}
                     className={`h-9 px-3 gap-2 text-xs font-bold uppercase tracking-wide transition-all ${showFilters ? 'shadow-md' : 'shadow-sm'}`}
                  >
                     <SlidersHorizontal size={14} strokeWidth={2.5} />
                     Filtros
                     {(selectedTags.length > 0 || !onlyAvailable || sortBy !== 'name') && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                     )}
                  </Button>
               </div>
            </div>
            
            {/* Collapsible Filter Bar */}
            {renderFilterBar()}
         </div>

         {/* PRODUCT GRID */}
         <div className="flex-1 overflow-y-auto p-3 scroll-smooth">
            <div className="w-full pb-8">
               {productsStatus === 'loading' ? (
                  <div className="flex items-center justify-center h-64">
                     <div className="animate-spin rounded-full h-10 w-10 border-4 border-[color:var(--primary-bg)] border-t-transparent" />
                  </div>
               ) : paginatedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                     <div className="h-24 w-24 rounded-full bg-[color:var(--ghost-hover-bg)] flex items-center justify-center mb-6">
                        <Search className="h-10 w-10 text-[color:var(--muted)]" />
                     </div>
                     <h3 className="text-xl font-bold mb-2">No se encontraron productos</h3>
                     <p className="text-[color:var(--muted)] max-w-xs mx-auto mb-6">
                        Intenta ajustar los filtros o buscar con otros términos.
                     </p>
                     <Button onClick={clearFilters} variant="outline">
                        Limpiar filtros
                     </Button>
                  </div>
               ) : (
                  <>
                     <div className={`grid gap-3 sm:gap-6 ${
                        effectiveViewMode === 'grid' 
                           ? 'grid-cols-[repeat(auto-fill,minmax(170px,1fr))]' 
                           : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                     }`}>
                        {paginatedProducts.map(product => (
                           <ProductCard 
                              key={product.id}
                              product={product}
                              quantityInCart={items.find(i => String(i.productId) === String(product.id))?.quantity || 0}
                              onAdd={(qty) => handleAddToCart(product, qty)}
                              onUpdateQuantity={(qty) => updateQuantity(product.id, qty)}
                              layout={effectiveViewMode}
                              onClick={() => handleProductClick(product)}
                           />
                        ))}
                     </div>

                     {/* PAGINATION */}
                     {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                           <Button 
                              variant="outline" 
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className="h-9 px-4 rounded-full"
                           >
                              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                           </Button>
                           <span className="text-sm font-medium text-[color:var(--muted)]">
                              Página {currentPage} de {totalPages}
                           </span>
                           <Button 
                              variant="outline" 
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className="h-9 px-4 rounded-full"
                           >
                              Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                           </Button>
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
         
      </div>

      {/* --- RIGHT COLUMN: CART (Desktop) --- */}
      <div className={`hidden md:flex flex-col border-l border-[color:var(--border)] bg-[color:var(--card-bg)] transition-all duration-300 w-[280px] ${!isCartOpen ? '!hidden' : ''}`}>
         <div className="h-14 px-4 border-b border-[color:var(--border)] flex items-center justify-between bg-[color:var(--card-bg)]/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
               <ShoppingBag className="h-4 w-4 text-[color:var(--primary-bg)]" />
               <h2 className="font-bold text-sm tracking-tight">Tu Pedido</h2>
               <Badge variant="outline" className="ml-2 h-4 px-1 text-[9px] bg-[color:var(--bg-secondary)] border-0">
                  {itemCount()}
               </Badge>
            </div>
            <button 
               onClick={() => setIsCartOpen(false)}
               className="p-1.5 hover:bg-[color:var(--ghost-hover-bg)] rounded-[var(--radius)] transition-colors text-[color:var(--muted)] hover:text-[color:var(--text)]"
            >
               <X size={18} />
            </button>
         </div>
         
         <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 custom-scrollbar">
               {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-2 opacity-60">
                     <div className="h-14 w-14 rounded-full bg-[color:var(--ghost-hover-bg)] flex items-center justify-center">
                        <ShoppingBag className="h-7 w-7 text-[color:var(--muted)]" strokeWidth={1.5} />
                     </div>
                     <div>
                        <p className="font-semibold text-xs">El carrito está vacío</p>
                        <p className="text-[10px] text-[color:var(--muted)] mt-0.5">Agrega productos para comenzar</p>
                     </div>
                  </div>
               ) : (
                  items.map(i => (
                     <CartItemRow 
                        key={i.productId}
                        item={i}
                        onUpdateQuantity={(qty) => updateQuantity(i.productId, qty)}
                        onRemove={() => updateQuantity(i.productId, 0)}
                     />
                  ))
               )}
            </div>
            
            {items.length > 0 && (
               <div className="p-3 border-t border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-[color:var(--muted)]">Subtotal</span>
                        <span className="font-medium">{formatMoney(totalCents())}</span>
                     </div>
                     <div className="flex justify-between items-center text-base font-bold">
                        <span>Total</span>
                        <span className="text-[color:var(--primary-bg)]">{formatMoney(totalCents())}</span>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3">
                     <Button 
                        variant="outline" 
                        onClick={() => clear()}
                        className="col-span-1 h-9 px-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        title="Vaciar carrito"
                     >
                        <Trash2 size={16} />
                     </Button>
                     <Button 
                        className="col-span-3 h-9 text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]" 
                        onClick={() => setPaymentMethodOpen(true)}
                     >
                        Pagar <ArrowRight className="ml-2 h-3 w-3" />
                     </Button>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* --- MOBILE CART SHEET --- */}
      {isCartOpen && (
         <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full bg-[color:var(--card-bg)] rounded-t-[var(--radius)] shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-300">
               <div className="w-12 h-1.5 bg-[color:var(--border)] rounded-full mx-auto mt-4 mb-2 opacity-50" />
               <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)]">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                     <ShoppingBag className="h-5 w-5" />
                     Tu Pedido
                     <Badge className="ml-2 h-5 bg-[color:var(--bg-secondary)] text-[color:var(--text)] border-0">
                        {itemCount()}
                     </Badge>
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[color:var(--ghost-hover-bg)] rounded-full">
                     <X className="h-6 w-6" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
                  {items.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-[40vh] text-center opacity-60">
                        <div className="h-20 w-20 rounded-full bg-[color:var(--ghost-hover-bg)] flex items-center justify-center mb-4">
                           <ShoppingBag className="h-10 w-10 text-[color:var(--muted)]" strokeWidth={1.5} />
                        </div>
                        <p className="font-semibold text-lg">Carrito vacío</p>
                        <p className="text-sm text-[color:var(--muted)] mt-1">¡Agrega algo delicioso!</p>
                     </div>
                  ) : (
                     items.map(i => (
                        <CartItemRow 
                           key={i.productId}
                           item={i}
                           onUpdateQuantity={(qty) => updateQuantity(i.productId, qty)}
                           onRemove={() => updateQuantity(i.productId, 0)}
                           isMobile
                        />
                     ))
                  )}
               </div>

               {items.length > 0 && (
                  <div className="p-4 bg-[color:var(--card-bg)] border-t border-[color:var(--border)] pb-8 z-20 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.1)]">
                     <div className="flex justify-between mb-2 text-sm text-[color:var(--muted)]">
                        <span>Subtotal</span>
                        <span>{formatMoney(totalCents())}</span>
                     </div>
                     <div className="flex justify-between mb-5 text-xl font-bold">
                        <span>Total</span>
                        <span className="text-[color:var(--primary-bg)]">{formatMoney(totalCents())}</span>
                     </div>
                     
                     <div className="grid grid-cols-4 gap-3">
                        <Button 
                           variant="outline" 
                           onClick={() => clear()}
                           className="col-span-1 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                           <Trash2 size={20} />
                        </Button>
                        <Button 
                           className="col-span-3 h-12 text-lg font-bold rounded-[var(--radius)] shadow-lg hover:shadow-xl transition-all bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]" 
                           onClick={() => setPaymentMethodOpen(true)}
                        >
                           Finalizar Pedido
                        </Button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* --- PAYMENT MODALS (Reused) --- */}
      {paymentMethodOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[var(--radius)] bg-[color:var(--card-bg)] p-6 shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Método de pago</h3>
              <button onClick={() => setPaymentMethodOpen(false)} className="p-2 rounded-full hover:bg-[color:var(--ghost-hover-bg)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { key: 'efectivo' as const, label: 'Efectivo', Icon: DollarSign },
                { key: 'tarjeta' as const, label: 'Tarjeta', Icon: CreditCard },
                { key: 'mp' as const, label: 'Mercado Pago', Icon: Smartphone },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setPaymentMethod(p.key)
                    setIsPending(false)
                    void confirmCheckout()
                  }}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-[var(--radius)] border-2 border-[color:var(--border)] hover:border-[color:var(--primary-bg)] hover:bg-[color:var(--primary-bg)]/5 transition-all group"
                >
                  <div className="h-10 w-10 rounded-full bg-[color:var(--ghost-hover-bg)] flex items-center justify-center group-hover:bg-[color:var(--primary-bg)] group-hover:text-white transition-colors">
                     <p.Icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">{p.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setIsPending(true)
                  setPaymentMethodOpen(false)
                  setCheckoutOpen(true)
                }}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-[var(--radius)] border-2 border-[color:var(--border)] hover:border-[color:var(--primary-bg)] hover:bg-[color:var(--primary-bg)]/5 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-[color:var(--ghost-hover-bg)] flex items-center justify-center group-hover:bg-[color:var(--primary-bg)] group-hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm">Fiado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-6 py-4">
              <div className="text-lg font-bold tracking-tight">Confirmar Fiado</div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[color:var(--ghost-hover-bg)]"
                onClick={() => {
                  setCheckoutOpen(false)
                  setIsPending(false)
                }}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[color:var(--muted)] uppercase tracking-wider">Nombre del cliente</label>
                <Input 
                  autoFocus
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="Ej: Juan Perez" 
                  className="h-12 text-lg rounded-[calc(var(--radius)-4px)] bg-[color:var(--ghost-hover-bg)] border-transparent px-4"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="h-12 px-6 rounded-[calc(var(--radius)-4px)] font-medium"
                  onClick={() => {
                    setCheckoutOpen(false)
                    setIsPending(false)
                    setCustomerName('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="h-12 px-8 rounded-[calc(var(--radius)-4px)] font-bold text-base shadow-lg shadow-[color:var(--primary-bg)]/20"
                  onClick={() => void confirmCheckout()}
                  disabled={!customerName.trim()}
                >
                  Confirmar Fiado
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {productToAdd && (
         <QuantitySelector 
            product={productToAdd}
            onConfirm={(qty) => {
               handleAddToCart(productToAdd, qty)
               setProductToAdd(null)
            }}
            onCancel={() => setProductToAdd(null)}
         />
      )}

    </div>
  )
}
