import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, Beer, Candy, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, 
  Cookie, CreditCard, DollarSign, Filter, Flame, GlassWater, Grid, Home, 
  LayoutList, Package, Search, ShoppingBag, ShoppingCart, Smartphone, Sparkles, 
  User, X, Store
} from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { useAuthStore } from '@shared/stores/authStore'
import { useCartStore } from '@shared/stores/cartStore'
import { useSalesStore } from '@shared/stores/salesStore'
import { useToastStore } from '@shared/stores/toastStore'
import { useUiStore } from '@shared/stores/uiStore'
import { getProducts, type Product } from '@shared/services/posService'

type PaymentMethod = 'efectivo' | 'tarjeta' | 'mp'

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

type PedidoProductCardProps = {
  product: Product
  highlighted: boolean
  quantityInCart: number
  onAdd: () => void
  horizontal?: boolean
}

function simpleHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0
  return Math.abs(hash)
}

function getCategoryColor(category: string) {
  const categoryKey = (category || '').trim().toLowerCase()
  const accentIdx = categoryKey ? simpleHash(categoryKey) % 6 : 0
  const colors = [
    '#0a84ff', // 0 Blue
    '#30d158', // 1 Green
    '#ff2d55', // 2 Red
    '#ffd60a', // 3 Yellow
    '#7d5cff', // 4 Purple
    '#34c759', // 5 Green (Variant)
  ]
  return colors[accentIdx]
}

function getCategoryIcon(category: string) {
  const c = (category || '').toLowerCase()
  if (c.includes('galletita') || c.includes('dulce')) return Cookie
  if (c.includes('golosina') || c.includes('alfajor') || c.includes('chicle')) return Candy
  if (c.includes('cerveza') || c.includes('alcohol') || c.includes('vino') || c.includes('fernet') || c.includes('whisky')) return Beer
  if (c.includes('bebida') || c.includes('jugo') || c.includes('gaseosa')) return GlassWater
  if (c.includes('tabaquer') || c.includes('cigarri')) return Flame
  if (c.includes('higiene') || c.includes('perfum')) return Sparkles
  if (c.includes('hogar') || c.includes('limpieza')) return Home
  return Package
}

function ProductThumbnail({
  imageUrl,
  category,
  name,
  className,
  iconSize = 20,
}: {
  imageUrl?: string | null
  category?: string
  name: string
  className?: string
  iconSize?: number
}) {
  const theme = useUiStore((s) => s.theme)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [imageUrl])

  const color = getCategoryColor(category || '')
  const Icon = getCategoryIcon(category || '')

  const thumbnailStyle = useMemo(() => {
    if (imageUrl && !imageError && !imageLoaded) {
       // Loading state placeholder
       if (theme === 'dark') {
         return { backgroundColor: color, color: '#ffffff' }
       } else {
         return { backgroundColor: `${color}20`, color: color }
       }
    }
    if (!imageUrl || imageError) {
       // Fallback icon
       if (theme === 'dark') {
         return { backgroundColor: color, color: '#ffffff' }
       } else {
         return { backgroundColor: `${color}20`, color: color }
       }
    }
    return {} // Loaded image
  }, [theme, color, imageUrl, imageError, imageLoaded])

  if (imageUrl && !imageError) {
    return (
      <div
        className={`relative overflow-hidden ${className || ''} ${
          !imageLoaded ? '' : 'bg-transparent border border-[color:var(--border)]'
        }`}
        style={!imageLoaded ? thumbnailStyle : undefined}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={iconSize} strokeWidth={1.6} />
          </div>
        )}
        <img
          src={imageUrl}
          alt={name}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div 
      className={`flex items-center justify-center overflow-hidden ${className || ''}`}
      style={thumbnailStyle}
    >
      <Icon size={iconSize} strokeWidth={1.6} />
    </div>
  )
}

function PedidoProductCard({ product, highlighted, quantityInCart, onAdd, horizontal }: PedidoProductCardProps) {
  const theme = useUiStore((s) => s.theme)
  const business = useAuthStore((s) => s.business)
  const isStockSimple = business?.stockMode === 'simple'

  const ventaCents = product.priceCents
  const isByWeight = product.unidad && product.unidad !== 'u'
  
  const priceFormatted = formatMoney(ventaCents)
  const priceLabel = isByWeight ? `${priceFormatted} / ${product.unidad}` : priceFormatted
  const stockLabel = !isStockSimple && product.trackStock && typeof product.stock === 'number' ? `Stock: ${product.stock}` : null

  if (horizontal) {
    const color = getCategoryColor(product.categoria)
    const cardStyle = theme === 'dark' 
       ? { borderColor: `${color}40`, backgroundColor: `${color}08` }
       : { borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)' }

    return (
      <div
        className={[
          'relative rounded-2xl border shadow-sm active:scale-[0.98] transition-all duration-200 overflow-hidden',
          highlighted ? 'ring-2 ring-[color:var(--primary-bg)]' : '',
        ].join(' ')}
        style={cardStyle}
        role="button"
        tabIndex={0}
        onClick={onAdd}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onAdd()
        }}
        aria-label={`Agregar ${product.nombre}`}
      >
        <div className="flex items-center gap-3 p-2 md:p-3">
          <ProductThumbnail
            imageUrl={product.imageUrl}
            category={product.categoria}
            name={product.nombre}
            className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-xl shadow-sm"
            iconSize={24}
          />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="truncate text-sm font-bold tracking-tight text-[color:var(--text)]">{product.nombre}</div>
              {quantityInCart > 0 && (
                <div className="shrink-0 rounded-full bg-[color:var(--primary-bg)] px-2 py-0.5 text-[10px] font-bold tracking-tight text-[color:var(--primary-fg)] shadow-sm">
                  {quantityInCart}
                </div>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="text-xs font-semibold tracking-tight text-[color:var(--text)]">
                {priceLabel}
              </div>
              {stockLabel && <div className="text-[10px] tracking-tight text-[color:var(--muted)] font-medium">{stockLabel}</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={[
        'group relative flex flex-col rounded-2xl md:rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-sm hover:shadow-xl transition-all duration-300 active:scale-[0.98] overflow-hidden',
        highlighted ? 'ring-2 ring-[color:var(--primary-bg)]' : '',
      ].join(' ')}
      role="button"
      tabIndex={0}
      onClick={onAdd}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onAdd()
      }}
      aria-label={`Agregar ${product.nombre}`}
    >
      {quantityInCart > 0 && (
        <div className="absolute right-2 top-2 md:right-3 md:top-3 z-10 rounded-full bg-[color:var(--primary-bg)] px-1.5 py-0.5 md:px-2 md:py-0.5 text-[10px] md:text-[11px] font-bold tracking-tight text-[color:var(--primary-fg)] shadow-lg shadow-black/10">
          x{quantityInCart}
        </div>
      )}

      <div className="aspect-[4/3] md:aspect-square w-full relative">
        <ProductThumbnail
          imageUrl={product.imageUrl}
          category={product.categoria}
          name={product.nombre}
          className="h-full w-full"
          iconSize={32}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isByWeight && (
          <div className="absolute bottom-2 right-2 rounded-lg bg-black/40 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm border border-white/10">
            {product.unidad}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5 md:mb-2">
            <span className="inline-flex items-center rounded-md bg-[color:var(--ghost-hover-bg)] px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)] truncate max-w-full">
               {product.categoria}
            </span>
          </div>
          <div className="line-clamp-2 text-xs md:text-sm font-bold tracking-tight text-[color:var(--text)] leading-snug mb-2 md:mb-3">
            {product.nombre}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {stockLabel && (
              <div className="mb-0.5 md:mb-1 text-[9px] md:text-[10px] font-medium tracking-tight text-[color:var(--muted)]">
                {stockLabel}
              </div>
            )}
            <div className="text-sm md:text-base font-bold tracking-tight text-[color:var(--text)]">
              {priceLabel}
            </div>
          </div>
          
          <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-lg shadow-[color:var(--primary-bg)]/30 group-hover:scale-110 transition-transform duration-300">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PedidosPage() {
  const business = useAuthStore((s) => s.business)
  const account = useAuthStore((s) => s.account)
  const activeBranchId = useAuthStore((s) => s.activeBranchId)
  const isStockSimple = business?.stockMode === 'simple'

  const items = useCartStore((s) => s.items)
  const addProduct = useCartStore((s) => s.addProduct)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const itemCount = useCartStore((s) => s.itemCount)
  const totalCents = useCartStore((s) => s.totalCents)

  const registerSale = useSalesStore((s) => s.registerSale)
  const loadSales = useSalesStore((s) => s.loadSales)

  const showToast = useToastStore((s) => s.showToast)

  const [productsStatus, setProductsStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [products, setProducts] = useState<Product[]>([])
  const [productsError, setProductsError] = useState<string>('')

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'priceAsc' | 'priceDesc'>('name')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped')
  // New state for mobile view toggle (grid or list/horizontal)
  const [mobileViewMode, setMobileViewMode] = useState<'grid' | 'list'>('grid')

  const navigate = useNavigate()

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
  const [isPending, setIsPending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [lastAddedId, setLastAddedId] = useState<Product['id'] | null>(null)
  const [cartCollapsed, setCartCollapsed] = useState(false)
  
  // Mobile Cart State
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!business) return
      setProductsStatus('loading')
      try {
        const products = await getProducts(business.id)
        if (cancelled) return
        setProducts(products.filter((p) => p.disponible))
        setProductsStatus('success')
      } catch (e: unknown) {
        if (cancelled) return
        setProductsStatus('error')
        setProductsError(e instanceof Error ? e.message : 'Error al cargar productos')
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [business])

  const count = itemCount()
  const total = totalCents()

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) set.add(p.categoria)
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    let res = products.filter((p) => {
      const matchesQuery = !q || p.nombre.toLowerCase().includes(q)
      const matchesCategory = category === 'all' || p.categoria === category
      return matchesQuery && matchesCategory
    })

    if (sortBy === 'name') {
      res.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else if (sortBy === 'priceAsc') {
      res.sort((a, b) => a.priceCents - b.priceCents)
    } else if (sortBy === 'priceDesc') {
      res.sort((a, b) => b.priceCents - a.priceCents)
    }
    
    return res
  }, [products, query, category, sortBy])

  const groupedProducts = useMemo(() => {
    if (category !== 'all') {
       return [{ categoria: category, items: filteredProducts }]
    }

    const map = new Map<string, Product[]>()
    for (const p of filteredProducts) {
      const key = p.categoria?.trim() ? p.categoria : 'Sin categoría'
      const list = map.get(key)
      if (list) list.push(p)
      else map.set(key, [p])
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([categoria, items]) => ({ categoria, items }))
  }, [filteredProducts, category])

  const productById = useMemo(() => {
    const map = new Map<string, Product>()
    for (const p of products) map.set(String(p.id), p)
    return map
  }, [products])

  const quantityByProductId = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) map.set(String(i.productId), i.quantity)
    return map
  }, [items])

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const keys = groupedProducts.map((g) => g.categoria)
    setOpenCategories((prev) => {
      const next: Record<string, boolean> = {}
      for (const k of keys) next[k] = prev[k] ?? true
      return next
    })
  }, [groupedProducts])

  async function confirmCheckout() {
    if (!business) return
    if (items.length === 0) return
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
    if (!sale) {
      showToast('No se pudo registrar la venta', 'error')
      return
    }
    showToast('Venta registrada', 'success')
    clear()
    setPaymentMethodOpen(false)
    setCheckoutOpen(false)
    setIsCartOpen(false)
    setCustomerName('')
    setIsPending(false)
    setPaymentMethod('efectivo')
    await loadSales(business.id)
  }

  const renderProductGrid = () => {
    if (productsStatus === 'success' && filteredProducts.length === 0 && !query && category === 'all') {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="w-24 h-24 bg-[color:var(--primary-bg)]/10 rounded-full flex items-center justify-center mb-6">
              <Store className="h-12 w-12 text-[color:var(--primary-bg)]" strokeWidth={1.5} />
           </div>
           <h2 className="text-2xl font-bold tracking-tight mb-2">¡Bienvenido a Gestly!</h2>
           <p className="text-[color:var(--muted)] max-w-md mb-8 leading-relaxed">
              Tu catálogo está vacío. Para empezar a vender, necesitamos configurar tu negocio y agregar tus primeros productos.
           </p>
           <Button 
             className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg shadow-[color:var(--primary-bg)]/20 hover:scale-105 transition-transform"
             onClick={() => navigate('/app/configuracion')}
           >
              Configurar mi Negocio
              <ArrowRight className="ml-2 h-5 w-5" />
           </Button>
        </div>
      )
    }

    if (groupedProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="h-16 w-16 rounded-full bg-[color:var(--ghost-hover-bg)] flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-[color:var(--muted)]" />
          </div>
          <h3 className="text-lg font-semibold">No encontramos productos</h3>
          <p className="text-sm text-[color:var(--muted)] max-w-[200px]">
            Intenta con otra búsqueda o cambia los filtros.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6 pb-24 md:pb-6">
        {viewMode === 'flat' ? (
           <div className={`grid gap-2 md:gap-4 px-1 ${mobileViewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
              {filteredProducts.map((p) => (
                  <PedidoProductCard
                    key={p.id}
                    product={p}
                    horizontal={mobileViewMode === 'list'}
                    highlighted={String(lastAddedId) === String(p.id)}
                    quantityInCart={quantityByProductId.get(String(p.id)) ?? 0}
                    onAdd={() => {
                      const nextQty = (quantityByProductId.get(String(p.id)) ?? 0) + 1
                      addProduct(p)
                      const stockSuffix =
                        !isStockSimple && p.trackStock && typeof p.stock === 'number' ? ` · ${p.stock} disp.` : ''
                      showToast(`+1 ${p.nombre} (x${nextQty}${stockSuffix})`, 'success')
                      setLastAddedId(p.id)
                      window.setTimeout(() => setLastAddedId(null), 420)
                    }}
                  />
              ))}
           </div>
        ) : (
            groupedProducts.map((g) => (
              <div key={g.categoria} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <h3 className="text-lg font-bold tracking-tight">{g.categoria}</h3>
                  <div className="h-px flex-1 bg-[color:var(--border)] opacity-50" />
                  <span className="text-xs font-medium text-[color:var(--muted)] uppercase tracking-wider">{g.items.length} productos</span>
                </div>

                <div className={`grid gap-2 md:gap-4 px-1 ${mobileViewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                  {g.items.map((p) => (
                      <PedidoProductCard
                        key={p.id}
                        product={p}
                        horizontal={mobileViewMode === 'list'}
                        highlighted={String(lastAddedId) === String(p.id)}
                        quantityInCart={quantityByProductId.get(String(p.id)) ?? 0}
                        onAdd={() => {
                          const nextQty = (quantityByProductId.get(String(p.id)) ?? 0) + 1
                          addProduct(p)
                          const stockSuffix =
                            !isStockSimple && p.trackStock && typeof p.stock === 'number' ? ` · ${p.stock} disp.` : ''
                          showToast(`+1 ${p.nombre} (x${nextQty}${stockSuffix})`, 'success')
                          setLastAddedId(p.id)
                          window.setTimeout(() => setLastAddedId(null), 420)
                        }}
                      />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    )
  }

  const renderCartContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4 opacity-50">
             <ShoppingBag className="h-16 w-16 stroke-1" />
             <p className="font-medium">Tu carrito está vacío</p>
          </div>
        ) : (
          items.map((i) => (
            <div
              key={i.productId}
              className="flex gap-4 p-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-sm"
            >
              <ProductThumbnail
                imageUrl={productById.get(String(i.productId))?.imageUrl}
                category={productById.get(String(i.productId))?.categoria}
                name={i.nombre}
                className="h-16 w-16 shrink-0 rounded-xl"
                iconSize={24}
              />
              
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm tracking-tight line-clamp-2">{i.nombre}</div>
                  <div className="text-xs text-[color:var(--muted)] font-medium mt-0.5">
                    {formatMoney(i.priceCents)} c/u
                  </div>
                </div>
                
                <div className="flex items-end justify-between gap-2 mt-2">
                   <div className="flex items-center gap-1 bg-[color:var(--ghost-hover-bg)] rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(i.productId, i.quantity - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black/20 shadow-sm transition-all"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold tabular-nums">{i.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(i.productId, i.quantity + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-black/20 shadow-sm transition-all"
                      >
                        +
                      </button>
                   </div>
                   <div className="font-bold tabular-nums">
                      {formatMoney(i.priceCents * i.quantity)}
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[color:var(--border)] bg-[color:var(--card-bg)] p-4 space-y-4 pb-8 md:pb-4">
         <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-[color:var(--muted)]">
               <span>Subtotal ({count} items)</span>
               <span>{formatMoney(total)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-bold tracking-tight">
               <span>Total</span>
               <span>{formatMoney(total)}</span>
            </div>
         </div>
         
         <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="h-12 rounded-xl border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10" onClick={clear} disabled={items.length === 0}>
                Vaciar
             </Button>
             <Button className="h-12 rounded-xl text-base font-bold shadow-lg shadow-[color:var(--primary-bg)]/20" onClick={() => setPaymentMethodOpen(true)} disabled={items.length === 0}>
                Cobrar
                <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
         </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col md:flex-row bg-[color:var(--bg-secondary)]">
      
      {/* LEFT COLUMN: Products */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[color:var(--bg)]/95 backdrop-blur-xl border-b border-[color:var(--border)] px-3 py-2 md:px-6 md:py-4 transition-all">
           <div className="flex flex-col gap-3 md:gap-4 max-w-[1400px] mx-auto w-full">
              <div className="flex items-center gap-2 md:gap-3">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted)]" />
                    <Input 
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                       placeholder="Buscar productos..."
                       className="pl-10 h-11 rounded-2xl bg-[color:var(--card-bg)] border-transparent shadow-sm focus:border-[color:var(--primary-bg)] transition-all"
                    />
                 </div>
                 <div className="flex items-center gap-2 bg-[color:var(--card-bg)] p-1 rounded-2xl border border-[color:var(--border)] shadow-sm">
                    {/* Mobile View Toggle */}
                    <div className="flex md:hidden">
                       <button 
                          onClick={() => setMobileViewMode('grid')}
                          className={`p-2 rounded-xl transition-all ${mobileViewMode === 'grid' ? 'bg-[color:var(--ghost-hover-bg)] text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                       >
                          <Grid className="h-5 w-5" />
                       </button>
                       <button 
                          onClick={() => setMobileViewMode('list')}
                          className={`p-2 rounded-xl transition-all ${mobileViewMode === 'list' ? 'bg-[color:var(--ghost-hover-bg)] text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                       >
                          <LayoutList className="h-5 w-5" />
                       </button>
                    </div>
                    {/* Desktop View Toggle */}
                    <div className="hidden md:flex">
                       <button 
                          onClick={() => setViewMode('grouped')}
                          className={`p-2 rounded-xl transition-all ${viewMode === 'grouped' ? 'bg-[color:var(--ghost-hover-bg)] text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                       >
                          <LayoutList className="h-5 w-5" />
                       </button>
                       <button 
                          onClick={() => setViewMode('flat')}
                          className={`p-2 rounded-xl transition-all ${viewMode === 'flat' ? 'bg-[color:var(--ghost-hover-bg)] text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                       >
                          <Grid className="h-5 w-5" />
                       </button>
                    </div>
                 </div>
              </div>

              {/* Categories Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-x">
                 {categories.map((c) => (
                    <button
                       key={c}
                       onClick={() => setCategory(c)}
                       className={`px-4 py-2 rounded-full text-sm font-bold tracking-tight whitespace-nowrap transition-all border ${
                          category === c
                             ? 'bg-[color:var(--primary-bg)] border-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-lg shadow-[color:var(--primary-bg)]/20 scale-105'
                             : 'bg-[color:var(--card-bg)] border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--primary-bg)] hover:text-[color:var(--text)]'
                       }`}
                    >
                       {c === 'all' ? 'Todo' : c}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
           <div className="max-w-[1400px] mx-auto">
              {productsStatus === 'loading' ? (
                 <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--primary-bg)]" />
                 </div>
              ) : (
                 renderProductGrid()
              )}
           </div>
        </div>

        {/* Mobile Floating Cart Button (FAB) */}
        <div className="md:hidden fixed bottom-6 right-4 z-30 pointer-events-none">
           {items.length > 0 && (
              <button 
                 onClick={() => setIsCartOpen(true)}
                 className="pointer-events-auto bg-[color:var(--text)] text-[color:var(--bg)] rounded-full h-16 w-16 shadow-2xl shadow-black/20 flex flex-col items-center justify-center animate-in zoom-in-50 duration-300 active:scale-90 transition-all border border-white/10 relative"
              >
                 <ShoppingCart className="h-6 w-6" />
                 {count > 0 && (
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] rounded-full flex items-center justify-center text-xs font-bold border-2 border-[color:var(--bg)]">
                       {count}
                    </div>
                 )}
                 <div className="text-[10px] font-bold mt-0.5">{formatMoney(total)}</div>
              </button>
           )}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart (Desktop) */}
      <div className={`hidden md:flex flex-col border-l border-[color:var(--border)] bg-[color:var(--card-bg)] transition-all duration-300 ${cartCollapsed ? 'w-[80px]' : 'w-[400px]'}`}>
         <div className="p-4 border-b border-[color:var(--border)] flex items-center justify-between">
            {!cartCollapsed && <h2 className="font-bold text-xl">Pedido Actual</h2>}
            <button 
               onClick={() => setCartCollapsed(!cartCollapsed)}
               className="p-2 hover:bg-[color:var(--ghost-hover-bg)] rounded-xl transition-colors mx-auto"
            >
               {cartCollapsed ? <ChevronLeft /> : <ChevronRight />}
            </button>
         </div>
         
         {!cartCollapsed ? renderCartContent() : (
            <div className="flex flex-col items-center py-8 gap-4">
               <div className="relative">
                  <ShoppingBag className="h-8 w-8 text-[color:var(--muted)]" />
                  {count > 0 && (
                     <div className="absolute -top-1 -right-1 h-5 w-5 bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] rounded-full flex items-center justify-center text-xs font-bold">
                        {count}
                     </div>
                  )}
               </div>
               <div className="text-xs font-bold [writing-mode:vertical-lr] rotate-180 tracking-widest text-[color:var(--muted)] uppercase">
                  Total: {formatMoney(total)}
               </div>
            </div>
         )}
      </div>

      {/* MOBILE CART SHEET */}
      {isCartOpen && (
         <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full bg-[color:var(--card-bg)] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-300">
               <div className="w-12 h-1.5 bg-[color:var(--border)] rounded-full mx-auto mt-4 mb-2 opacity-50" />
               <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)]">
                  <h2 className="text-2xl font-bold">Tu Pedido</h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[color:var(--ghost-hover-bg)] rounded-full">
                     <X className="h-6 w-6" />
                  </button>
               </div>
               {renderCartContent()}
            </div>
         </div>
      )}

      {/* Payment Method Modal */}
      {paymentMethodOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] bg-[color:var(--card-bg)] p-6 shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
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
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 border-[color:var(--border)] hover:border-[color:var(--primary-bg)] hover:bg-[color:var(--primary-bg)]/5 transition-all group"
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
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 border-[color:var(--border)] hover:border-[color:var(--primary-bg)] hover:bg-[color:var(--primary-bg)]/5 transition-all group"
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

      {/* Fiado Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-2xl animate-in zoom-in-95 duration-200">
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
                  className="h-12 text-lg rounded-xl bg-[color:var(--ghost-hover-bg)] border-transparent px-4"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="h-12 px-6 rounded-xl font-medium"
                  onClick={() => {
                    setCheckoutOpen(false)
                    setIsPending(false)
                    setCustomerName('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="h-12 px-8 rounded-xl font-bold text-base shadow-lg shadow-[color:var(--primary-bg)]/20"
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
    </div>
  )
}
