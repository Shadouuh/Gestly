import { useEffect, useMemo, useState } from 'react'
import { 
  Check, Plus, Search, X, Minus, DollarSign,
  LayoutList, LayoutGrid, Table as TableIcon, 
  Eye, EyeOff, Store, ShoppingBasket, Coffee, 
  Croissant, CakeSlice, BookOpen, Hammer, Utensils,
  ArrowLeft, ChevronRight, CheckSquare, Square,
  ChefHat, Wheat, Package, MoreVertical, Edit, Trash, Image as ImageIcon, GlassWater, TrendingUp
} from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { useAuthStore } from '@shared/stores/authStore'
import { useToastStore } from '@shared/stores/toastStore'
import { createProduct, getProducts, patchProduct, deleteProduct, type Product, createStockMovement } from '@shared/services/posService'
import { RUBROS, type Rubro, type Template, type TemplateItem } from './templates'
import { ItemCard } from '@shared/components/ui/ItemCard'
import { ModernSelect } from '@shared/components/ui/ModernSelect'
import { ProductThumbnail } from '@shared/components/ui/ProductThumbnail'
import { Switch } from '@shared/components/ui/Switch'

type ViewMode = 'card' | 'list' | 'table'
type Section = 'products' | 'templates'

const ICON_MAP: Record<string, any> = {
  Store, ShoppingBasket, Coffee, Croissant, CakeSlice, BookOpen, Hammer, Utensils
}

export function ProductosPage() {
  const business = useAuthStore((s) => s.business)
  const showToast = useToastStore((s) => s.showToast)
  const isStockSimple = business?.stockMode === 'simple'

  // -- Product State --
  const [productsStatus, setProductsStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [products, setProducts] = useState<Product[]>([])
  const [productsError, setProductsError] = useState<string>('')
  
  const [productQuery, setProductQuery] = useState('')
  const [productCategory, setProductCategory] = useState<string>('all')
  const [unitFilter, setUnitFilter] = useState<'all' | 'unit' | 'weight'>('all')
  
  // -- View Configuration --
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [showCost, setShowCost] = useState(!isStockSimple)
  const [showPrice, setShowPrice] = useState(true)

  // -- Navigation State --
  const [activeSection, setActiveSection] = useState<Section>('products')
  
  // -- Template State --
  const [manualRubroId, setManualRubroId] = useState<string | null>(null)
  
  const selectedRubro = useMemo(() => {
    if (manualRubroId) return RUBROS.find(r => r.id === manualRubroId) || null
    if (business?.rubro && business.rubro !== 'general') {
      return RUBROS.find(r => r.id === business.rubro) || null
    }
    return null
  }, [business?.rubro, manualRubroId])

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateItemsSelection, setTemplateItemsSelection] = useState<Set<number>>(new Set()) // Set of indices
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false)

  // -- Modal State --
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Info, 2: Config, 3: Recipe
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const [newProduct, setNewProduct] = useState<{
    nombre: string
    categoria: string
    unidad: string
    priceCents: number
    costCents: number
    stock: number
    trackStock: boolean
    disponible: boolean
    imageUrl: string
    recipe: { ingredientId: string; quantity: number }[]
  }>({
    nombre: '',
    categoria: '',
    unidad: 'u',
    priceCents: 0,
    costCents: 0,
    stock: 0,
    trackStock: true,
    disponible: true,
    imageUrl: '',
    recipe: []
  })

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!business) return
      setProductsStatus('loading')
      try {
        const products = await getProducts(business.id)
        if (cancelled) return
        setProducts(products)
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

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) set.add(p.categoria)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'Todas las categorías' },
    ...categories.map(c => ({ value: c, label: c }))
  ], [categories])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    return products.filter((p) => {
      const matchesQuery = !q || p.nombre.toLowerCase().includes(q)
      const matchesCategory = productCategory === 'all' || p.categoria === productCategory
      const matchesType = activeSection === 'ingredients' 
        ? p.isIngredient 
        : !p.isIngredient

      const matchesUnit = unitFilter === 'all' 
         ? true 
         : unitFilter === 'unit' 
            ? p.unidad === 'u'
            : p.unidad !== 'u'
        
      return matchesQuery && matchesCategory && matchesType && matchesUnit
    })
  }, [products, productQuery, productCategory, activeSection, unitFilter])

  const availableIngredients = useMemo(() => 
    products.filter(p => p.isIngredient), 
    [products]
  )

  // -- Actions --

  async function toggleProductAvailability(p: Product) {
    const updated = await patchProduct(p.id, { disponible: !p.disponible })
    setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)))
  }

  async function toggleTrackStock(p: Product) {
    const updated = await patchProduct(p.id, { trackStock: !p.trackStock })
    setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)))
  }

  async function updateStock(p: Product, stock: number) {
    if (!business) return
    const diff = stock - (p.stock || 0)
    if (diff === 0) return

    const updated = await patchProduct(p.id, { stock })
    
    // Create movement for product
    await createStockMovement({
      businessId: business.id,
      productId: p.id,
      productName: p.nombre,
      quantity: diff,
      costCents: p.costCents || 0,
      date: new Date().toISOString(),
      type: diff > 0 ? 'entry' : 'adjustment'
    }).catch(console.error)

    // Handle Ingredients (Recipe) - Deduct from ingredients when producing (diff > 0)
    if (diff > 0 && p.recipe && p.recipe.length > 0) {
        const ingredientsToUpdate: { ingredient: Product, newStock: number, deducted: number }[] = []
        
        for (const item of p.recipe) {
            const ingredient = products.find(prod => prod.id === item.ingredientId)
            if (ingredient && ingredient.trackStock) {
                const quantityToDeduct = item.quantity * diff
                const newIngredientStock = Math.max(0, (ingredient.stock || 0) - quantityToDeduct)
                
                ingredientsToUpdate.push({
                    ingredient,
                    newStock: newIngredientStock,
                    deducted: quantityToDeduct
                })
            }
        }

        // Execute updates for ingredients
        await Promise.all(ingredientsToUpdate.map(async ({ ingredient, newStock, deducted }) => {
            await patchProduct(ingredient.id, { stock: newStock })
            await createStockMovement({
                businessId: business.id,
                productId: ingredient.id,
                productName: ingredient.nombre,
                quantity: -deducted, 
                costCents: ingredient.costCents || 0,
                date: new Date().toISOString(),
                type: 'adjustment'
            }).catch(console.error)
        }))

        // Update local state for all affected products
        const updatedIngredientsMap = new Map(ingredientsToUpdate.map(x => [x.ingredient.id, x.newStock]))
        
        setProducts(prev => prev.map(x => {
            if (x.id === p.id) return updated
            if (updatedIngredientsMap.has(x.id)) return { ...x, stock: updatedIngredientsMap.get(x.id)! }
            return x
        }))
    } else {
        // Just update the single product in state
        setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)))
    }
  }

  async function updatePrice(p: Product, priceCents: number) {
    if (priceCents < 0) return
    const updated = await patchProduct(p.id, { priceCents })
    setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)))
  }

  async function updateCost(p: Product, costCents: number) {
    if (costCents < 0) return
    const updated = await patchProduct(p.id, { costCents })
    setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)))
  }

  async function createNewProduct() {
    if (!business) return
    if (!newProduct.nombre.trim()) return

    if (editingId) {
       // Update existing product
       const updated = await patchProduct(editingId, {
          nombre: newProduct.nombre.trim(),
          categoria: newProduct.categoria.trim() || 'General',
          unidad: newProduct.unidad,
          priceCents: Math.max(0, Math.round(newProduct.priceCents)),
          costCents: Math.max(0, Math.round(newProduct.costCents)),
          trackStock: newProduct.trackStock,
          imageUrl: newProduct.imageUrl || null,
          recipe: activeSection === 'products' ? newProduct.recipe : undefined,
       })

       // Stock update if changed manually in edit (optional, usually handled by adjustment)
       if (newProduct.trackStock && newProduct.stock !== undefined) {
           const p = products.find(x => x.id === editingId)
           if (p && p.stock !== newProduct.stock) {
               await updateStock(p, newProduct.stock)
               updated.stock = newProduct.stock // Ensure local update reflects this
           }
       }

       setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p)))
       showToast('Producto actualizado', 'success')
    } else {
       // Create new product
       const created = await createProduct({
         businessId: business.id,
         nombre: newProduct.nombre.trim(),
         categoria: newProduct.categoria.trim() || 'General',
         unidad: newProduct.unidad,
         priceCents: Math.max(0, Math.round(newProduct.priceCents)),
         costCents: Math.max(0, Math.round(newProduct.costCents)),
         stock: newProduct.trackStock ? Math.max(0, Math.round(newProduct.stock)) : null,
         trackStock: newProduct.trackStock,
         disponible: newProduct.disponible,
         isIngredient: activeSection === 'ingredients',
         imageUrl: newProduct.imageUrl || null,
         recipe: activeSection === 'products' ? newProduct.recipe : undefined,
       })
       
       if (created.trackStock && (created.stock || 0) > 0) {
           await createStockMovement({
               businessId: business.id,
               productId: created.id,
               productName: created.nombre,
               quantity: created.stock || 0,
               costCents: created.costCents || 0,
               date: new Date().toISOString(),
               type: 'entry'
           }).catch(console.error)
       }
   
       setProducts((prev) => [...prev, created])
       showToast('Producto creado', 'success')
    }

    setProductModalOpen(false)
    setEditingId(null)
    setNewProduct({ nombre: '', categoria: '', unidad: 'u', priceCents: 0, costCents: 0, stock: 0, trackStock: true, disponible: true, imageUrl: '', recipe: [] })
  }

  // -- Template Logic --

  const handleTemplateSelect = (t: Template) => {
    setSelectedTemplate(t)
    // Select all by default
    const allIndices = new Set<number>()
    t.items.forEach((_, i) => allIndices.add(i))
    setTemplateItemsSelection(allIndices)
  }

  const toggleTemplateItem = (index: number) => {
    const next = new Set(templateItemsSelection)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    setTemplateItemsSelection(next)
  }

  const toggleAllTemplateItems = () => {
    if (!selectedTemplate) return
    if (templateItemsSelection.size === selectedTemplate.items.length) {
      setTemplateItemsSelection(new Set())
    } else {
      const allIndices = new Set<number>()
      selectedTemplate.items.forEach((_, i) => allIndices.add(i))
      setTemplateItemsSelection(allIndices)
    }
  }

  const applyTemplate = async (mode: 'merge' | 'replace') => {
    if (!business || !selectedTemplate) return
    setIsApplyingTemplate(true)

    try {
      if (mode === 'replace') {
        const currentProducts = await getProducts(business.id)
        await Promise.all(currentProducts.map((p) => deleteProduct(p.id)))
      }

      const itemsToCreate = selectedTemplate.items.filter((_, i) => templateItemsSelection.has(i))
      
      // Separate ingredients and products
      const ingredients = itemsToCreate.filter(i => i.isIngredient)
      const products = itemsToCreate.filter(i => !i.isIngredient)

      // 1. Create Ingredients first
      const createdIngredients = await Promise.all(
        ingredients.map(p => 
          createProduct({
            businessId: business.id,
            nombre: p.nombre,
            categoria: p.categoria,
            unidad: p.unidad,
            priceCents: p.priceCents,
            costCents: p.costCents,
            stock: p.trackStock ? p.stock : null,
            trackStock: p.trackStock,
            disponible: p.disponible,
            imageUrl: p.imageUrl,
            isIngredient: true
          })
        )
      )

      // Map ingredient names to new IDs
      const ingredientMap = new Map<string, string>()
      createdIngredients.forEach(ing => {
        ingredientMap.set(ing.nombre, String(ing.id))
      })

      // 2. Create Products with resolved recipe IDs
      await Promise.all(
        products.map((p) => {
          const resolvedRecipe = p.recipe?.map(r => ({
            ingredientId: ingredientMap.get(r.ingredientName) || '',
            quantity: r.quantity
          })).filter(r => r.ingredientId !== '')

          return createProduct({
            businessId: business.id,
            nombre: p.nombre,
            categoria: p.categoria,
            unidad: p.unidad,
            priceCents: p.priceCents,
            costCents: p.costCents,
            stock: p.trackStock ? p.stock : null,
            trackStock: p.trackStock,
            disponible: p.disponible,
            imageUrl: p.imageUrl,
            recipe: resolvedRecipe
          })
        }),
      )

      const next = await getProducts(business.id)
      setProducts(next)
      showToast('Plantilla aplicada correctamente', 'success')
      
      // Reset navigation
      setSelectedTemplate(null)
      setManualRubroId(null)
      setActiveSection('products')
    } catch (e) {
      console.error(e)
      showToast('Error al aplicar la plantilla', 'error')
    } finally {
      setIsApplyingTemplate(false)
    }
  }

  const handleEditProduct = (p: Product) => {
      setEditingId(String(p.id))
      setCurrentStep(1)
      setNewProduct({
          nombre: p.nombre,
          categoria: p.categoria,
          unidad: p.unidad,
          priceCents: p.priceCents,
          costCents: p.costCents || 0,
          stock: p.stock || 0,
          trackStock: p.trackStock,
          disponible: p.disponible,
          imageUrl: p.imageUrl || '',
          recipe: p.recipe || []
      })
      setProductModalOpen(true)
      setOpenDropdownId(null)
  }

  const handleOpenRecipe = (p: Product) => {
      setEditingId(String(p.id))
      setNewProduct({
          nombre: p.nombre,
          categoria: p.categoria,
          unidad: p.unidad,
          priceCents: p.priceCents,
          costCents: p.costCents || 0,
          stock: p.stock || 0,
          trackStock: p.trackStock,
          disponible: p.disponible,
          imageUrl: p.imageUrl || '',
          recipe: p.recipe || []
      })
      setCurrentStep(3)
      setProductModalOpen(true)
      setOpenDropdownId(null)
  }

  const handleDeleteProduct = async (p: Product) => {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
          await deleteProduct(p.id)
          setProducts(prev => prev.filter(x => x.id !== p.id))
          showToast('Producto eliminado', 'success')
      }
      setOpenDropdownId(null)
  }

  // -- Render Helpers --

  const renderProductCard = (p: Product) => (
    <div key={p.id} className="group relative flex flex-col rounded-[var(--radius)] bg-[color:var(--card-bg)] shadow-sm border border-[color:var(--border)] transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-[color:var(--primary-bg)]/30">
      <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={() => setOpenDropdownId(openDropdownId === String(p.id) ? null : String(p.id))}
            className="p-1 rounded-[var(--radius)] text-[color:var(--muted)] hover:text-[color:var(--text)] bg-[color:var(--card-bg)]/80 backdrop-blur-sm border border-[color:var(--border)] hover:bg-[color:var(--ghost-hover-bg)] transition-colors shadow-sm"
          >
              <MoreVertical className="h-3.5 w-3.5" />
          </button>
          
          {openDropdownId === String(p.id) && (
             <>
               <div className="fixed inset-0 z-0" onClick={() => setOpenDropdownId(null)} />
               <div className="absolute right-0 top-6 w-40 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
                  <button onClick={() => handleEditProduct(p)} className="w-full text-left px-2 py-1.5 text-xs rounded-[var(--radius)] hover:bg-[color:var(--ghost-hover-bg)] flex items-center gap-2">
                     <Edit className="h-3.5 w-3.5 text-[color:var(--muted)]" />
                     Editar
                  </button>
                  {!p.isIngredient && (
                     <button onClick={() => handleOpenRecipe(p)} className="w-full text-left px-2 py-1.5 text-xs rounded-[var(--radius)] hover:bg-[color:var(--ghost-hover-bg)] flex items-center gap-2">
                        <ChefHat className="h-3.5 w-3.5 text-[color:var(--muted)]" />
                        Ver Receta
                     </button>
                  )}
                  <div className="h-px bg-[color:var(--border)] my-1" />
                  <button onClick={() => handleDeleteProduct(p)} className="w-full text-left px-2 py-1.5 text-xs rounded-[var(--radius)] hover:bg-red-50 text-red-600 flex items-center gap-2">
                     <Trash className="h-3.5 w-3.5" />
                     Eliminar
                  </button>
               </div>
             </>
          )}
      </div>

      <div className="flex items-start gap-2 p-3">
        {/* Image Display */}
        <ProductThumbnail 
            imageUrl={p.imageUrl} 
            category={p.categoria} 
            name={p.nombre} 
            className="h-9 w-9 rounded-[var(--radius)] border border-[color:var(--border)] flex-shrink-0"
            iconSize={16}
        />

        <div className="min-w-0 flex-1 pr-4">
          <div className="truncate text-sm font-semibold tracking-tight leading-tight">{p.nombre}</div>
          <div className="mt-0.5 text-[9px] tracking-tight text-[color:var(--muted)] font-medium uppercase">
            {p.categoria}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 mt-auto">
        <div className="flex items-center gap-2 mb-2">
            {isStockSimple ? (
              <button
                type="button"
                onClick={() => void toggleProductAvailability(p)}
                className={[
                  'flex h-5 items-center justify-center rounded-[var(--radius)] border px-1.5 text-[9px] font-bold tracking-tight transition-colors',
                  p.disponible
                    ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]'
                    : 'border-[color:var(--border)] bg-[color:var(--outline-bg)] text-[color:var(--text)]',
                ].join(' ')}
              >
                {p.disponible ? 'Disponible' : 'Agotado'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void toggleProductAvailability(p)}
                className={[
                  'flex h-5 items-center justify-center rounded-[var(--radius)] border px-1.5 text-[9px] font-bold tracking-tight transition-colors',
                  p.disponible
                    ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]'
                    : 'border-[color:var(--border)] bg-[color:var(--outline-bg)] text-[color:var(--text)]',
                ].join(' ')}
              >
                {p.disponible ? 'Activo' : 'Pausado'}
              </button>
            )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {showPrice && !p.isIngredient && (
            <div className="space-y-0.5">
               <label className="text-[8px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Precio</label>
               <div className="relative">
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-[color:var(--muted)]">$</span>
                  <Input 
                    className="h-7 pl-3 text-xs font-bold tabular-nums bg-[color:var(--ghost-hover-bg)] border-transparent focus:bg-[color:var(--card-bg)]"
                    value={String(p.priceCents / 100)}
                    onChange={(e) => {
                       const val = parseFloat(e.target.value)
                       if (!isNaN(val)) void updatePrice(p, Math.round(val * 100))
                    }}
                  />
               </div>
            </div>
          )}
          {showCost && !isStockSimple && (
            <div className="space-y-0.5">
               <label className="text-[8px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Costo</label>
               <div className="relative">
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-[color:var(--muted)]">$</span>
                  <Input 
                    className="h-7 pl-3 text-xs font-medium tabular-nums bg-[color:var(--ghost-hover-bg)] border-transparent focus:bg-[color:var(--card-bg)] text-[color:var(--muted)]"
                    value={String((p.costCents || 0) / 100)}
                    onChange={(e) => {
                       const val = parseFloat(e.target.value)
                       if (!isNaN(val)) void updateCost(p, Math.round(val * 100))
                    }}
                  />
               </div>
            </div>
          )}
        </div>

        {!isStockSimple && (
          <div className="mt-2 pt-2 border-t border-[color:var(--border)]">
             {p.recipe && p.recipe.length > 0 && !p.isIngredient && (
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-[color:var(--muted)]">
                            Receta ({p.recipe.length})
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-[color:var(--muted)]">
                            ${(p.recipe.reduce((acc, r) => {
                                const ing = products.find(x => x.id === r.ingredientId)
                                return acc + (ing ? (ing.costCents || 0) * r.quantity : 0)
                            }, 0) / 100).toFixed(2)}
                        </span>
                    </div>
                </div>
             )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <button
                    type="button"
                    onClick={() => void toggleTrackStock(p)}
                    className={`text-[10px] font-medium transition-colors ${p.trackStock ? 'text-[color:var(--primary-bg)]' : 'text-[color:var(--muted)]'}`}
                 >
                    {p.trackStock ? 'Stock' : 'No Stock'}
                 </button>
              </div>

              {p.trackStock && (
                <div className="flex items-center gap-1 bg-[color:var(--outline-bg)] rounded-[var(--radius)] p-1">
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors font-bold text-lg"
                    onClick={() => void updateStock(p, Math.max(0, (p.stock ?? 0) - 1))}
                  >
                    −
                  </button>
                  <div className="w-12 text-center text-sm font-bold tabular-nums">{p.stock ?? 0}</div>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors font-bold text-lg"
                    onClick={() => void updateStock(p, (p.stock ?? 0) + 1)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductList = (p: Product) => (
    <div key={p.id} className={`flex items-center gap-4 rounded-[var(--radius)] border bg-[color:var(--card-bg)] p-3 shadow-sm transition-all group ${p.disponible ? 'border-[color:var(--border)] hover:border-[color:var(--primary-bg)]' : 'border-[color:var(--border)] opacity-70'}`}>
      
      <div onClick={() => handleEditProduct(p)} className="cursor-pointer">
        <ProductThumbnail 
            imageUrl={p.imageUrl}
            category={p.categoria}
            name={p.nombre}
            className="h-10 w-10 rounded-[var(--radius)] border border-[color:var(--border)] flex-shrink-0"
            iconSize={16}
        />
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEditProduct(p)}>
        <div className={`font-medium truncate transition-all ${!p.disponible ? 'line-through text-[color:var(--muted)]' : ''}`}>{p.nombre}</div>
        <div className="text-xs text-[color:var(--muted)]">{p.categoria}</div>
      </div>
      
      {showCost && !isStockSimple && (
        <div className="w-24">
          <Input 
             className={`h-8 text-xs tabular-nums bg-[color:var(--ghost-hover-bg)] border-transparent ${!p.disponible ? 'line-through text-[color:var(--muted)]' : ''}`}
             value={String((p.costCents || 0) / 100)}
             onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val)) void updateCost(p, Math.round(val * 100))
             }}
             placeholder="Costo"
             disabled={!p.disponible}
           />
        </div>
      )}
      
      {showPrice && !p.isIngredient && (
        <div className="w-24">
           <Input 
             className={`h-8 text-xs font-semibold tabular-nums bg-[color:var(--ghost-hover-bg)] border-transparent ${!p.disponible ? 'line-through text-[color:var(--muted)]' : ''}`}
             value={String(p.priceCents / 100)}
             onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val)) void updatePrice(p, Math.round(val * 100))
             }}
             placeholder="Precio"
             disabled={!p.disponible}
           />
        </div>
      )}

      {!isStockSimple ? (
        p.trackStock ? (
          <div className={`flex items-center gap-1 bg-[color:var(--outline-bg)] rounded-[var(--radius)] p-1 ${!p.disponible ? 'opacity-50 pointer-events-none' : ''}`}>
              <button className="h-8 w-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-white/50 font-bold text-lg" onClick={() => void updateStock(p, Math.max(0, (p.stock ?? 0) - 1))}>−</button>
              <div className="w-12 text-center text-sm font-bold tabular-nums">{p.stock ?? 0}</div>
              <button className="h-8 w-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-white/50 font-bold text-lg" onClick={() => void updateStock(p, (p.stock ?? 0) + 1)}>+</button>
          </div>
        ) : (
          <div className="text-sm text-[color:var(--muted)] w-24 text-center">Sin stock</div>
        )
      ) : (
        <div className="w-24"></div>
      )}

      <button
        onClick={() => void toggleProductAvailability(p)}
        className={`h-8 w-8 rounded-[var(--radius)] flex items-center justify-center transition-colors ${p.disponible ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}
      >
        <Check className={`h-4 w-4 ${!p.disponible ? 'opacity-0' : 'opacity-100'}`} />
      </button>
    </div>
  );

  const renderProductTable = () => (
    <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[color:var(--ghost-hover-bg)] text-xs uppercase font-semibold text-[color:var(--muted)]">
          <tr>
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Categoría</th>
            {showCost && !isStockSimple && <th className="px-4 py-3 w-32">Costo</th>}
            {showPrice && activeSection !== 'ingredients' && <th className="px-4 py-3 w-32">Precio</th>}
            {!isStockSimple && <th className="px-4 py-3 w-40 text-center">Stock</th>}
            <th className="px-4 py-3 w-20 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--border)]">
          {filteredProducts.map((p) => (
            <tr key={p.id} className="hover:bg-[color:var(--ghost-hover-bg)]">
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-3">
                  <ProductThumbnail 
                      imageUrl={p.imageUrl}
                      category={p.categoria}
                      name={p.nombre}
                      className="h-8 w-8 rounded-[var(--radius)] border border-[color:var(--border)] flex-shrink-0"
                      iconSize={14}
                  />
                  {p.nombre}
                </div>
              </td>
              <td className="px-4 py-3 text-[color:var(--muted)]">{p.categoria}</td>
              {showCost && !isStockSimple && (
                <td className="px-4 py-3">
                  <Input 
                    className="h-8 text-xs tabular-nums bg-transparent border-transparent hover:bg-[color:var(--outline-bg)]"
                    value={String((p.costCents || 0) / 100)}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val)) void updateCost(p, Math.round(val * 100))
                    }}
                  />
                </td>
              )}
              {showPrice && activeSection !== 'ingredients' && (
                <td className="px-4 py-3">
                  <Input 
                    className="h-8 text-xs font-semibold tabular-nums bg-transparent border-transparent hover:bg-[color:var(--outline-bg)]"
                    value={String(p.priceCents / 100)}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val)) void updatePrice(p, Math.round(val * 100))
                    }}
                  />
                </td>
              )}
              {!isStockSimple && (
                <td className="px-4 py-3">
                  {p.trackStock ? (
                    <div className="flex items-center justify-center gap-1">
                        <button className="h-6 w-6 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--outline-bg)]" onClick={() => void updateStock(p, Math.max(0, (p.stock ?? 0) - 1))}>−</button>
                        <div className="w-10 text-center text-xs font-semibold tabular-nums">{p.stock ?? 0}</div>
                        <button className="h-6 w-6 flex items-center justify-center rounded-[var(--radius)] hover:bg-[color:var(--outline-bg)]" onClick={() => void updateStock(p, (p.stock ?? 0) + 1)}>+</button>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-[color:var(--muted)]">−</div>
                  )}
                </td>
              )}
              <td className="px-4 py-3 text-center">
                 <button onClick={() => void toggleProductAvailability(p)}>
                    <div className={`w-3 h-3 rounded-full mx-auto ${p.disponible ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // -- Main View --

  if (activeSection === 'templates') {
    return (
      <div className="h-full overflow-y-auto bg-[color:var(--app-bg)]">
         {/* Header de Sección */}
         <div className="sticky top-0 z-10 bg-[color:var(--app-bg)]/80 backdrop-blur-md border-b border-[color:var(--border)] px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={() => {
                   if (selectedTemplate) setSelectedTemplate(null)
                   else if (manualRubroId) setManualRubroId(null)
                   else setActiveSection('products')
               }} className="rounded-full hover:bg-[color:var(--ghost-hover-bg)]">
                  <ArrowLeft className="h-5 w-5" />
               </Button>
               <div>
                  <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                     {selectedTemplate ? selectedTemplate.name : selectedRubro ? selectedRubro.name : 'Galería de Plantillas'}
                  </h1>
                  <p className="text-xs text-[color:var(--muted)] font-medium">
                     {selectedTemplate ? 'Personalizá tu importación' : selectedRubro ? 'Seleccioná un catálogo' : 'Elegí el rubro de tu negocio'}
                  </p>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!selectedRubro ? (
               // Rubro Selection
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {RUBROS.map((rubro, idx) => {
                     const Icon = ICON_MAP[rubro.icon] || Store
                     const gradients = [
                        'from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border-blue-200/50 dark:border-blue-800/30',
                        'from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 border-purple-200/50 dark:border-purple-800/30',
                        'from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 hover:to-emerald-600/10 border-emerald-200/50 dark:border-emerald-800/30',
                        'from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 border-amber-200/50 dark:border-amber-800/30',
                        'from-rose-500/10 to-rose-600/5 hover:from-rose-500/20 hover:to-rose-600/10 border-rose-200/50 dark:border-rose-800/30',
                        'from-cyan-500/10 to-cyan-600/5 hover:from-cyan-500/20 hover:to-cyan-600/10 border-cyan-200/50 dark:border-cyan-800/30',
                        'from-indigo-500/10 to-indigo-600/5 hover:from-indigo-500/20 hover:to-indigo-600/10 border-indigo-200/50 dark:border-indigo-800/30',
                     ]
                     const gradientClass = gradients[idx % gradients.length]
                     
                     return (
                        <button
                           key={rubro.id}
                           onClick={() => setManualRubroId(rubro.id)}
                           className={`relative overflow-hidden rounded-[var(--radius)] border p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br ${gradientClass} group`}
                        >
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Icon className="w-24 h-24 -mr-6 -mt-6 rotate-12" strokeWidth={1} />
                           </div>
                           
                           <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                              <div className="w-10 h-10 rounded-[var(--radius)] bg-white/80 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                                 <Icon className="h-5 w-5 text-[color:var(--text)]" strokeWidth={1.5} />
                              </div>
                              <div>
                                 <div className="font-bold text-base tracking-tight mb-1 leading-tight">{rubro.name}</div>
                                 <div className="text-xs font-medium text-[color:var(--muted)] flex items-center gap-1">
                                    {rubro.templates.length} plantillas
                                    <ChevronRight className="h-3 w-3" />
                                 </div>
                              </div>
                           </div>
                        </button>
                     )
                  })}
               </div>
            ) : !selectedTemplate ? (
               // Template Selection
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {selectedRubro.templates.map((template, idx) => (
                     <div key={template.id} className="group relative rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[color:var(--outline-bg)] to-transparent opacity-50" />
                        
                        <div className="relative p-3 flex flex-col h-full">
                           <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius)] bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)] text-sm font-bold uppercase tracking-wider">
                                   <LayoutList className="h-4 w-4" />
                                   Plantilla
                                </div>
                                <span className="text-sm font-medium text-[color:var(--muted)]">{template.items.length} items</span>
                              </div>
                              <h3 className="text-xl font-bold tracking-tight leading-tight mb-1 truncate" title={template.name}>{template.name}</h3>
                              <p className="text-base text-[color:var(--muted)] font-medium leading-relaxed line-clamp-2">{template.description}</p>
                           </div>
                           
                           <div className="flex-1 space-y-1.5 mb-3 overflow-hidden">
                              <div className="grid grid-cols-1 gap-1.5">
                                 {template.items.slice(0, 6).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-[var(--radius)] bg-[color:var(--ghost-hover-bg)] text-base font-medium leading-none">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--primary-bg)] flex-shrink-0" />
                                       <span className="truncate flex-1">{item.nombre}</span>
                                    </div>
                                 ))}
                                 {template.items.length > 6 && (
                                    <div className="text-center text-sm font-bold text-[color:var(--muted)] pt-1">
                                       + {template.items.length - 6} más...
                                    </div>
                                 )}
                              </div>
                           </div>
                           
                           <Button size="sm" className="w-full h-9 rounded-[var(--radius)] text-sm font-semibold shadow-sm mt-auto" onClick={() => handleTemplateSelect(template)}>
                              Ver Detalles
                              <ChevronRight className="ml-1 h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               // Template Detail & Selection
               <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                     {/* Sidebar de Resumen */}
                     <div className="lg:w-72 flex-shrink-0 space-y-4">
                        <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setSelectedTemplate(null)}
                           className="w-full justify-start text-[color:var(--muted)] hover:text-[color:var(--text)] mb-2 -ml-2 h-8 text-xs"
                        >
                           <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                           Volver a plantillas
                        </Button>

                        <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-4 shadow-xl sticky top-24">
                           <h3 className="font-bold text-sm mb-3">Resumen de Importación</h3>
                           
                           <div className="space-y-3">
                              <div className="flex justify-between items-center p-2 rounded-[var(--radius)] bg-[color:var(--ghost-hover-bg)]">
                                 <span className="text-xs font-medium text-[color:var(--muted)]">Seleccionados</span>
                                 <span className="text-lg font-bold tabular-nums">{templateItemsSelection.size}</span>
                              </div>
                              
                              <div className="space-y-2 pt-1">
                                 <Button 
                                    className="w-full h-9 text-xs rounded-[var(--radius)] font-bold shadow-md shadow-[color:var(--primary-bg)]/20"
                                    onClick={() => applyTemplate('merge')}
                                    disabled={isApplyingTemplate || templateItemsSelection.size === 0}
                                 >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Agregar a mis productos
                                 </Button>
                                 <Button 
                                    variant="outline" 
                                    className="w-full h-9 text-xs rounded-[var(--radius)] border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:text-red-400 font-bold"
                                    onClick={() => applyTemplate('replace')}
                                    disabled={isApplyingTemplate || templateItemsSelection.size === 0}
                                 >
                                    Reemplazar todo mi catálogo
                                 </Button>
                              </div>
                              <p className="text-[10px] text-center text-[color:var(--muted)] px-1 leading-tight">
                                 "Agregar" suma productos. "Reemplazar" borra tu catálogo actual.
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Lista de Items */}
                     <div className="flex-1 min-w-0">
                        <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] overflow-hidden shadow-md">
                           <div className="p-3 border-b border-[color:var(--border)] bg-[color:var(--ghost-hover-bg)]/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between gap-4">
                              <div>
                                 <h2 className="text-sm font-bold">{selectedTemplate.name}</h2>
                                 <p className="text-[10px] text-[color:var(--muted)] line-clamp-1">{selectedTemplate.description}</p>
                              </div>
                              <button 
                                 onClick={toggleAllTemplateItems} 
                                 className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] bg-[color:var(--card-bg)] border border-[color:var(--border)] text-xs font-semibold hover:bg-[color:var(--ghost-hover-bg)] transition-colors shadow-sm"
                              >
                                 {templateItemsSelection.size === selectedTemplate.items.length ? (
                                    <>
                                       <CheckSquare className="h-3.5 w-3.5 text-[color:var(--primary-bg)]" />
                                       Todos
                                    </>
                                 ) : (
                                    <>
                                       <Square className="h-3.5 w-3.5" />
                                       Todos
                                    </>
                                 )}
                              </button>
                           </div>
                           
                           <div className="divide-y divide-[color:var(--border)] grid grid-cols-1">
                              {selectedTemplate.items.map((item, index) => {
                                 const isSelected = templateItemsSelection.has(index)
                                 return (
                                    <div 
                                       key={index} 
                                       className={`group flex items-center gap-3 p-2 transition-all cursor-pointer ${isSelected ? 'bg-[color:var(--card-bg)] hover:bg-[color:var(--ghost-hover-bg)]' : 'bg-[color:var(--ghost-hover-bg)]/30 opacity-60 hover:opacity-80'}`}
                                       onClick={() => toggleTemplateItem(index)}
                                    >
                                       <div className={`flex-shrink-0 transition-transform duration-200 ${isSelected ? 'scale-105 text-[color:var(--primary-bg)]' : 'scale-100 text-[color:var(--muted)]'}`}>
                                          {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                       </div>
                                       
                                       {item.imageUrl && (
                                          <div className="h-12 w-12 rounded-[var(--radius)] bg-white border border-[color:var(--border)] overflow-hidden flex-shrink-0 shadow-sm">
                                             <img src={item.imageUrl} alt={item.nombre} className="h-full w-full object-cover" />
                                          </div>
                                       )}

                                       <div className="flex-1 min-w-0">
                                          <div className={`font-bold text-sm leading-tight ${!isSelected && 'line-through text-[color:var(--muted)]'}`}>{item.nombre}</div>
                                          <div className="flex items-center gap-1.5 mt-1">
                                             <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius)] bg-[color:var(--outline-bg)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)] border border-[color:var(--border)]">
                                                {item.categoria}
                                             </span>
                                             {item.trackStock && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius)] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/30">
                                                   Stock: {item.stock}
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                       
                                       <div className="text-right">
                                          <div className="font-bold text-base tabular-nums text-[color:var(--text)]">${item.priceCents / 100}</div>
                                          <div className="text-xs font-medium text-[color:var(--muted)]">Costo: ${item.costCents / 100}</div>
                                       </div>
                                    </div>
                                 )
                              })}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    )
  }

  // -- Products View --
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {activeSection === 'ingredients' ? 'Ingredientes y Stock' : 'Productos'}
          </h1>
          <p className="mt-2 text-sm tracking-tight text-[color:var(--muted)]">
            {activeSection === 'ingredients' 
               ? 'Gestioná tu materia prima y costos.' 
               : 'Gestioná tu inventario y precios de venta.'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-[color:var(--outline-bg)] p-1 rounded-[var(--radius)] mr-2">
             <button
                onClick={() => setActiveSection('products')}
                className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-all ${activeSection === 'products' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
             >
                Productos
             </button>
             <button
                onClick={() => setActiveSection('ingredients')}
                className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-all ${activeSection === 'ingredients' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
             >
                <div className="flex items-center gap-2">
                   <Wheat className="h-4 w-4" />
                   Ingredientes
                </div>
             </button>
          </div>

          <Button variant="outline" className="h-10 rounded-[var(--radius)]" onClick={() => setActiveSection('templates')}>
            <Store className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Plantillas
          </Button>
          <Button className="h-10 rounded-[var(--radius)]" onClick={() => {
             setNewProduct({
                nombre: '',
                categoria: '',
                unidad: 'u',
                priceCents: 0,
                costCents: 0,
                stock: 0,
                trackStock: true,
                disponible: true,
                imageUrl: '',
                recipe: []
             })
             setEditingId(null)
             // If in specific section, pre-select type, otherwise ask
             if (activeSection === 'ingredients') {
                 // Force ingredient
                 setNewProduct(prev => ({ ...prev, categoria: 'Materia Prima' }))
                 // We need a way to flag it as ingredient. Currently inferred by category or usage?
                 // The app seems to distinguish by `isIngredient` prop or similar?
                 // Looking at code: `p.isIngredient` exists in filter.
                 // But `newProduct` state doesn't have `isIngredient`.
                 // I should check `createProduct` service or if it's based on something else.
                 // Ah, `filteredProducts` uses `p.isIngredient`.
                 // I'll check `createProduct` usage.
                 setCurrentStep(1)
             } else if (activeSection === 'products') {
                 // Force product
                 setCurrentStep(1)
             } else {
                 setCurrentStep(0) 
             }
             // User requested explicit selection: "al darle a nuevo pone que seleccione..."
             // So I will force Step 0 always, or at least when general.
             // But for better UX, I'll force Step 0 always as requested.
             setCurrentStep(0)
             setProductModalOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Nuevo
          </Button>
        </div>
      </div>

      <div className="animate-slide-in-up space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
           <div className="flex flex-col gap-2 md:flex-row md:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
                <Input className="pl-11" value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Buscar productos…" />
              </div>
              <div className="w-[200px]">
                <ModernSelect 
                  value={productCategory} 
                  onChange={setProductCategory} 
                  options={categoryOptions}
                  placeholder="Filtrar categoría..."
                />
              </div>
           </div>

           <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <div className="flex bg-[color:var(--outline-bg)] p-1 rounded-[var(--radius)]">
                 <button 
                    onClick={() => setUnitFilter('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[calc(var(--radius)-4px)] transition-all ${unitFilter === 'all' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                 >
                    Todos
                 </button>
                 <button 
                    onClick={() => setUnitFilter('unit')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[calc(var(--radius)-4px)] transition-all ${unitFilter === 'unit' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                 >
                    x Un
                 </button>
                 <button 
                    onClick={() => setUnitFilter('weight')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[calc(var(--radius)-4px)] transition-all ${unitFilter === 'weight' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                 >
                    x Peso
                 </button>
              </div>

              <div className="h-8 w-[1px] bg-[color:var(--border)] mx-1" />

              <div className="flex items-center gap-1 bg-[color:var(--outline-bg)] p-1 rounded-[var(--radius)]">
                 <button onClick={() => setViewMode('card')} className={`p-2 rounded-[var(--radius)] transition-colors ${viewMode === 'card' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}>
                    <LayoutGrid className="h-4 w-4" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`p-2 rounded-[var(--radius)] transition-colors ${viewMode === 'list' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}>
                    <LayoutList className="h-4 w-4" />
                 </button>
                 <button onClick={() => setViewMode('table')} className={`p-2 rounded-[var(--radius)] transition-colors ${viewMode === 'table' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}>
                    <TableIcon className="h-4 w-4" />
                 </button>
              </div>
              
              <div className="h-8 w-[1px] bg-[color:var(--border)] mx-1" />

              <button 
                 onClick={() => setShowCost(!showCost)}
                 className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-xs font-medium border transition-colors ${showCost ? 'bg-[color:var(--primary-bg)]/10 border-[color:var(--primary-bg)]/20 text-[color:var(--primary-bg)]' : 'border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--outline-bg)]'}`}
              >
                 {showCost ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                 Costo
              </button>
              <button 
                 onClick={() => setShowPrice(!showPrice)}
                 className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-xs font-medium border transition-colors ${showPrice ? 'bg-[color:var(--primary-bg)]/10 border-[color:var(--primary-bg)]/20 text-[color:var(--primary-bg)]' : 'border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--outline-bg)]'}`}
              >
                 {showPrice ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                 Venta
              </button>
           </div>
        </div>

        {productsStatus === 'loading' && (
          <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5 text-sm text-[color:var(--muted)] shadow-[0_10px_30px_var(--shadow)]">
            Cargando…
          </div>
        )}
        {productsStatus === 'error' && (
          <div className="rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5 text-sm shadow-[0_10px_30px_var(--shadow)]">
            {productsError}
          </div>
        )}

        {productsStatus === 'success' && (
           <>
              {viewMode === 'card' && (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map(p => (
                      <ItemCard 
                         key={p.id}
                         id={String(p.id)}
                         name={p.nombre}
                         category={p.categoria}
                         imageUrl={p.imageUrl}
                         price={p.priceCents}
                         cost={p.costCents}
                         stock={p.stock || 0}
                         unit={p.unidad}
                         type={p.isIngredient ? 'ingredient' : 'product'}
                         layout="grid"
                         trackStock={p.trackStock}
                         onEdit={() => handleEditProduct(p)}
                         onDelete={() => handleDeleteProduct(p)}
                         onStockUpdate={p.trackStock ? ((s) => updateStock(p, s)) : undefined}
                      />
                   ))}
                 </div>
              )}
              {viewMode === 'list' && (
                 <div className="space-y-2">
                    {filteredProducts.map(p => (
                      <ItemCard 
                         key={p.id}
                         id={String(p.id)}
                         name={p.nombre}
                         category={p.categoria}
                         imageUrl={p.imageUrl}
                         price={p.priceCents}
                         cost={p.costCents}
                         stock={p.stock || 0}
                         unit={p.unidad}
                         type={p.isIngredient ? 'ingredient' : 'product'}
                         layout="list"
                         trackStock={p.trackStock}
                         onEdit={() => handleEditProduct(p)}
                         onDelete={() => handleDeleteProduct(p)}
                         onStockUpdate={p.trackStock ? ((s) => updateStock(p, s)) : undefined}
                      />
                   ))}
                 </div>
              )}
              {viewMode === 'table' && renderProductTable()}
           </>
        )}

        {productsStatus === 'success' && filteredProducts.length === 0 && (
           <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--outline-bg)] mb-4">
                 <Package className="h-6 w-6 text-[color:var(--muted)]" />
              </div>
              <h3 className="text-lg font-medium">No se encontraron productos</h3>
              <p className="text-[color:var(--muted)] mt-1">Intenta con otra búsqueda o creá un nuevo producto.</p>
           </div>
        )}
      </div>

      {/* Modal Nuevo/Editar Producto */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-2 md:p-4">
          <div className="w-full max-w-3xl rounded-xl border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[95vh] overflow-hidden">
            
            {/* Header & Stepper */}
            <div className="bg-[color:var(--card-bg)] border-b border-[color:var(--border)] p-3 pb-0">
               <div className="flex items-center justify-between mb-3">
                  <div>
                     <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                        {editingId ? <Edit className="h-4 w-4 text-[color:var(--primary-bg)]"/> : <Plus className="h-4 w-4 text-[color:var(--primary-bg)]"/>}
                        {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                     </h2>
                     <p className="text-xs text-[color:var(--muted)]">Configura los detalles del producto.</p>
                  </div>
                  <button onClick={() => setProductModalOpen(false)} className="p-1.5 rounded-full hover:bg-[color:var(--ghost-hover-bg)] text-[color:var(--muted)] transition-colors">
                     <X className="h-4 w-4" />
                  </button>
               </div>

               {/* Timeline Steps */}
               <div className="flex items-center justify-between relative px-2 pb-3">
                  {/* Progress Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[color:var(--border)] -z-10" />
                  
                  {[
                     { step: 1, title: 'Info', icon: Package },
                     { step: 2, title: 'Precios', icon: Store },
                     { step: 3, title: 'Receta', icon: ChefHat, hidden: activeSection === 'ingredients' },
                  ].filter(s => !s.hidden).map((s, idx, arr) => {
                     const isActive = currentStep === s.step
                     const isCompleted = currentStep > s.step
                     return (
                        <div key={s.step} className="flex flex-col items-center gap-1 bg-[color:var(--card-bg)] px-2">
                           <button
                              onClick={() => setCurrentStep(s.step)}
                              disabled={!editingId && s.step > currentStep + 1} // Prevent jumping ahead if new
                              className={`
                                 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                                 ${isActive ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] scale-110 shadow-sm' : ''}
                                 ${isCompleted ? 'border-[color:var(--primary-bg)] bg-[color:var(--card-bg)] text-[color:var(--primary-bg)]' : ''}
                                 ${!isActive && !isCompleted ? 'border-[color:var(--border)] bg-[color:var(--card-bg)] text-[color:var(--muted)]' : ''}
                              `}
                           >
                              {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : <s.icon className="h-4 w-4" />}
                           </button>
                           <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-[color:var(--primary-bg)]' : 'text-[color:var(--muted)]'}`}>
                              {s.title}
                           </span>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-[color:var(--ghost-hover-bg)]/20">
               <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 fade-in duration-300 key={currentStep}">
                  
                  {/* STEP 0: TYPE SELECTION */}
                  {currentStep === 0 && (
                     <div className="grid grid-cols-2 gap-4 h-full p-4">
                        <button
                           onClick={() => {
                              setNewProduct(s => ({...s, categoria: ''}))
                              setActiveSection('products')
                              setCurrentStep(1)
                           }}
                           className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--card-bg)] hover:border-[color:var(--primary-bg)] hover:bg-[color:var(--primary-bg)]/5 transition-all gap-4 group"
                        >
                           <div className="h-16 w-16 rounded-full bg-[color:var(--primary-bg)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Package className="h-8 w-8 text-[color:var(--primary-bg)]" />
                           </div>
                           <div className="text-center">
                              <h3 className="font-bold text-lg mb-1">Producto Final</h3>
                              <p className="text-xs text-[color:var(--muted)] leading-relaxed">
                                 Para la venta al público. <br/>Puede tener receta e ingredientes.
                              </p>
                           </div>
                        </button>

                        <button
                           onClick={() => {
                              setNewProduct(s => ({...s, categoria: 'Materia Prima'}))
                              setActiveSection('ingredients')
                              setCurrentStep(1)
                           }}
                           className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--card-bg)] hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all gap-4 group"
                        >
                           <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ChefHat className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                           </div>
                           <div className="text-center">
                              <h3 className="font-bold text-lg mb-1">Ingrediente / Insumo</h3>
                              <p className="text-xs text-[color:var(--muted)] leading-relaxed">
                                 Materia prima para recetas. <br/>Control de stock preciso.
                              </p>
                           </div>
                        </button>
                     </div>
                  )}

                  {/* STEP 1: INFO */}
                  {currentStep === 1 && (
                     <div className="flex flex-col md:flex-row gap-5">
                        {/* Image Uploader Visual */}
                        <div className="flex-shrink-0">
                           <label className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider mb-1.5 block">Imagen</label>
                           <div className="h-32 w-32 rounded-lg border-2 border-dashed border-[color:var(--border)] bg-[color:var(--card-bg)] flex flex-col items-center justify-center relative overflow-hidden group hover:border-[color:var(--primary-bg)] transition-colors">
                              {newProduct.imageUrl ? (
                                 <>
                                    <img src={newProduct.imageUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-white hover:text-white border-white/20 hover:bg-white/20" onClick={() => setNewProduct(s => ({...s, imageUrl: ''}))}>
                                          <Trash className="h-3 w-3 mr-1"/> Quitar
                                       </Button>
                                    </div>
                                 </>
                              ) : (
                                 <div className="text-center p-2">
                                    <div className="h-10 w-10 rounded-full bg-[color:var(--outline-bg)] flex items-center justify-center mx-auto mb-2">
                                       <ImageIcon className="h-5 w-5 text-[color:var(--muted)]" />
                                    </div>
                                    <p className="text-[9px] text-[color:var(--muted)] font-medium leading-tight">URL imagen</p>
                                 </div>
                              )}
                              <Input 
                                 className="absolute inset-x-2 bottom-2 h-6 bg-[color:var(--card-bg)]/90 backdrop-blur shadow-sm text-[9px] px-1" 
                                 placeholder="https://..."
                                 value={newProduct.imageUrl}
                                 onChange={(e) => setNewProduct(s => ({...s, imageUrl: e.target.value}))}
                              />
                           </div>
                        </div>

                        {/* Basic Fields */}
                        <div className="flex-1 space-y-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Nombre</label>
                              <Input 
                                 value={newProduct.nombre} 
                                 onChange={(e) => setNewProduct((s) => ({ ...s, nombre: e.target.value }))} 
                                 className="h-9 bg-[color:var(--card-bg)] text-sm font-medium" 
                                 placeholder="Ej. Hamburguesa Doble"
                                 autoFocus
                              />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Categoría</label>
                                 <div className="relative">
                                    <ModernSelect 
                                       value={newProduct.categoria} 
                                       onChange={(val) => setNewProduct((s) => ({ ...s, categoria: val }))} 
                                       options={categoryOptions.filter(c => c.value !== 'all')}
                                       placeholder="Seleccionar o crear..."
                                       creatable={true}
                                       searchable={true}
                                       className="w-full"
                                    />
                                 </div>
                              </div>

                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Unidad</label>
                                 <div className="flex rounded-md bg-[color:var(--card-bg)] border border-[color:var(--border)] p-0.5 h-9 overflow-hidden">
                                    {[
                                       {val: 'u', label: 'Unidad'},
                                       {val: 'kg', label: 'Kg'},
                                       {val: 'g', label: 'gr'},
                                       {val: 'lt', label: 'Lts'},
                                       {val: 'ml', label: 'ml'},
                                    ].map(opt => (
                                       <button
                                          key={opt.val}
                                          onClick={() => setNewProduct(s => ({...s, unidad: opt.val}))}
                                          className={`flex-1 flex items-center justify-center rounded text-[10px] font-bold transition-all ${newProduct.unidad === opt.val ? 'bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)] shadow-sm' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
                                       >
                                          {opt.label}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* STEP 2: PRICES & STOCK */}
                  {currentStep === 2 && (
                     <div className="space-y-4">
                        {/* Prices Card */}
                        <div className="bg-[color:var(--card-bg)] rounded-lg border border-[color:var(--border)] p-4 shadow-sm">
                           <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                              <DollarSign className="h-4 w-4 text-emerald-500" /> Precios y Costos
                           </h3>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <div className="flex justify-between items-baseline">
                                    <label className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">
                                       {['g', 'ml'].includes(newProduct.unidad) ? `Precio por ${newProduct.unidad}` : 'Precio Venta'}
                                    </label>
                                    {['g', 'ml', 'kg', 'lt'].includes(newProduct.unidad) && (
                                       <span className="text-[10px] text-[color:var(--muted)]">
                                          x 100{newProduct.unidad === 'kg' || newProduct.unidad === 'g' ? 'g' : 'ml'}: 
                                          <span className="font-bold text-emerald-500 ml-1">
                                             ${((newProduct.priceCents / 100) * (['kg', 'lt'].includes(newProduct.unidad) ? 0.1 : 100)).toFixed(2)}
                                          </span>
                                       </span>
                                    )}
                                 </div>
                                 <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[color:var(--muted)]">$</span>
                                    <Input
                                       type="number"
                                       value={newProduct.priceCents / 100}
                                       onChange={(e) => setNewProduct(s => ({...s, priceCents: Math.round(Number(e.target.value) * 100)}))}
                                       className="h-10 pl-7 text-base font-bold bg-[color:var(--ghost-hover-bg)]/50 border-transparent focus:bg-[color:var(--card-bg)] transition-all"
                                       placeholder="0.00"
                                    />
                                 </div>
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Costo Estimado</label>
                                 <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[color:var(--muted)]">$</span>
                                    <Input
                                       type="number"
                                       value={newProduct.costCents ? newProduct.costCents / 100 : ''}
                                       onChange={(e) => setNewProduct(s => ({...s, costCents: Math.round(Number(e.target.value) * 100)}))}
                                       className="h-10 pl-7 text-base font-medium bg-[color:var(--ghost-hover-bg)]/30 border-transparent focus:bg-[color:var(--card-bg)] transition-all"
                                       placeholder="0.00"
                                       disabled={isStockSimple}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Stock Card */}
                        {!isStockSimple && (
                           <div className="bg-[color:var(--card-bg)] rounded-lg border border-[color:var(--border)] p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                 <h3 className="text-sm font-bold flex items-center gap-1.5">
                                    <Package className="h-4 w-4 text-blue-500" /> Control de Stock
                                 </h3>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-[color:var(--muted)] uppercase">Rastrear</span>
                                    <Switch
                                       checked={newProduct.trackStock}
                                       onCheckedChange={(c) => setNewProduct(s => ({...s, trackStock: c}))}
                                       className="scale-75 origin-right"
                                    />
                                 </div>
                              </div>
                              
                              {newProduct.trackStock && (
                                 <div className="animate-in slide-in-from-top-2 fade-in">
                                    <div className="flex items-center gap-3 p-2 bg-[color:var(--ghost-hover-bg)]/50 rounded-lg border border-[color:var(--border)]">
                                       <Button 
                                          variant="outline" 
                                          size="icon" 
                                          className="h-8 w-8 rounded-full border-2 hover:border-[color:var(--primary-bg)] hover:text-[color:var(--primary-bg)] transition-colors"
                                          onClick={() => setNewProduct(s => ({...s, stock: Math.max(0, (s.stock || 0) - 1)}))}
                                       >
                                          <Minus className="h-3 w-3" />
                                       </Button>
                                       <div className="flex-1 text-center">
                                          <span className="text-2xl font-black tracking-tighter tabular-nums">{newProduct.stock || 0}</span>
                                          <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase block -mt-1">Unidades</span>
                                       </div>
                                       <Button 
                                          variant="outline" 
                                          size="icon" 
                                          className="h-8 w-8 rounded-full border-2 hover:border-[color:var(--primary-bg)] hover:text-[color:var(--primary-bg)] transition-colors"
                                          onClick={() => setNewProduct(s => ({...s, stock: (s.stock || 0) + 1}))}
                                       >
                                          <Plus className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  )}

                  {/* STEP 3: RECIPE */}
                  {currentStep === 3 && (
                     <div className="space-y-4 h-full flex flex-col">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-[color:var(--card-bg)] p-2.5 rounded-lg border border-[color:var(--border)] shadow-sm flex items-center justify-between">
                              <div>
                                 <p className="text-[9px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Costo Receta</p>
                                 <p className="text-base font-black tracking-tight">${((newProduct.recipe?.reduce((sum, item) => {
                                       const ing = availableIngredients.find(i => i.id === item.ingredientId)
                                       return sum + ((ing?.costCents || 0) * item.quantity)
                                    }, 0) || 0) / 100).toFixed(2)}</p>
                              </div>
                              <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                 <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                              </div>
                           </div>
                           <div className="bg-[color:var(--card-bg)] p-2.5 rounded-lg border border-[color:var(--border)] shadow-sm flex items-center justify-between">
                              <div>
                                 <p className="text-[9px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Margen Est.</p>
                                 <p className={`text-base font-black tracking-tight ${((newProduct.priceCents - (newProduct.recipe?.reduce((sum, item) => {
                                       const ing = availableIngredients.find(i => i.id === item.ingredientId)
                                       return sum + ((ing?.costCents || 0) * item.quantity)
                                    }, 0) || 0)) / newProduct.priceCents) < 0.3 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {newProduct.priceCents > 0 
                                       ? Math.round(((newProduct.priceCents - (newProduct.recipe?.reduce((sum, item) => {
                                          const ing = availableIngredients.find(i => i.id === item.ingredientId)
                                          return sum + ((ing?.costCents || 0) * item.quantity)
                                       }, 0) || 0)) / newProduct.priceCents) * 100) 
                                       : 0}%
                                 </p>
                              </div>
                              <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                 <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                           </div>
                        </div>

                        {/* Ingredients List */}
                        <div className="bg-[color:var(--card-bg)] rounded-lg border border-[color:var(--border)] shadow-sm flex-1 flex flex-col min-h-[250px] overflow-hidden">
                           <div className="p-2 border-b border-[color:var(--border)] flex items-center justify-between bg-[color:var(--ghost-hover-bg)]/30">
                              <div className="flex flex-col">
                                 <h3 className="text-xs font-bold flex items-center gap-1.5">
                                    <ChefHat className="h-3.5 w-3.5 text-orange-500" /> Composición
                                    <span className="bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)] text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[color:var(--primary-bg)]/20">
                                       {newProduct.recipe?.length || 0} items
                                    </span>
                                 </h3>
                              </div>
                              
                              {/* Add Ingredient Dropdown */}
                              <div className="relative group">
                                 <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <Search className="h-3 w-3 text-[color:var(--muted)] group-hover:text-[color:var(--primary-bg)] transition-colors" />
                                 </div>
                                 <div className="w-48">
                                    <ModernSelect 
                                       value=""
                                       onChange={(val) => {
                                          if (!val) return
                                          const exists = newProduct.recipe.find(r => r.ingredientId === val)
                                          if (exists) return
                                          setNewProduct(s => ({...s, recipe: [...s.recipe, { ingredientId: val, quantity: 1 }]}))
                                       }}
                                       options={availableIngredients.map(ing => ({
                                          value: String(ing.id),
                                          label: `${ing.nombre} (${ing.unidad})`
                                       }))}
                                       placeholder="Buscar ingrediente..."
                                       searchable
                                       className="text-xs"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="flex-1 overflow-y-auto p-1 bg-[color:var(--ghost-hover-bg)]/10">
                              {(!newProduct.recipe || newProduct.recipe.length === 0) ? (
                                 <div className="h-full flex flex-col items-center justify-center text-[color:var(--muted)] p-6 text-center animate-in fade-in duration-500">
                                    <div className="h-12 w-12 rounded-full bg-[color:var(--primary-bg)]/5 border border-[color:var(--primary-bg)]/10 flex items-center justify-center mb-3 group">
                                       <ChefHat className="h-6 w-6 text-[color:var(--primary-bg)]/40 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <p className="text-xs font-bold text-[color:var(--text)] mb-1">Armá tu receta</p>
                                    <p className="text-[10px] leading-relaxed max-w-[200px]">
                                       Agregá los ingredientes que componen este producto para calcular el costo real y controlar el stock automáticamente.
                                    </p>
                                 </div>
                              ) : (
                                 <div className="space-y-1">
                                    {newProduct.recipe.map((item, idx) => {
                                       const ing = availableIngredients.find(i => i.id === item.ingredientId)
                                       const itemCost = ((ing?.costCents || 0) * item.quantity / 100)
                                       
                                       return (
                                          <div key={idx} className="group flex items-center gap-2 p-1.5 rounded-[var(--radius)] border border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--card-bg)] hover:shadow-sm transition-all bg-[color:var(--card-bg)]/50">
                                             <div className="h-8 w-8 rounded-[var(--radius)] bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-[10px] shadow-sm">
                                                {ing?.nombre?.charAt(0).toUpperCase() || '?'}
                                             </div>
                                             
                                             <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                   <p className="text-[10px] font-bold truncate text-[color:var(--text)]">{ing?.nombre}</p>
                                                   <p className="text-[10px] font-bold text-[color:var(--muted)] tabular-nums">
                                                      ${itemCost.toFixed(2)}
                                                   </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   <div className="flex items-center bg-[color:var(--card-bg)] rounded-[var(--radius)] border border-[color:var(--border)] h-5 shadow-sm overflow-hidden">
                                                      <button 
                                                         className="px-1.5 hover:bg-red-50 hover:text-red-500 h-full flex items-center transition-colors border-r border-[color:var(--border)]"
                                                         onClick={() => {
                                                            const copy = [...newProduct.recipe]
                                                            if (copy[idx].quantity > 0.1) {
                                                               copy[idx].quantity = Number((copy[idx].quantity - 0.1).toFixed(2))
                                                               setNewProduct(s => ({...s, recipe: copy}))
                                                            }
                                                         }}
                                                      >
                                                         <Minus className="h-2 w-2" />
                                                      </button>
                                                      <span className="text-[9px] font-mono font-bold w-8 text-center bg-[color:var(--ghost-hover-bg)]/30 tabular-nums">
                                                         {item.quantity}
                                                      </span>
                                                      <button 
                                                         className="px-1.5 hover:bg-emerald-50 hover:text-emerald-500 h-full flex items-center transition-colors border-l border-[color:var(--border)]"
                                                         onClick={() => {
                                                            const copy = [...newProduct.recipe]
                                                            copy[idx].quantity = Number((copy[idx].quantity + 0.1).toFixed(2))
                                                            setNewProduct(s => ({...s, recipe: copy}))
                                                         }}
                                                      >
                                                         <Plus className="h-2 w-2" />
                                                      </button>
                                                   </div>
                                                   <span className="text-[9px] font-bold text-[color:var(--muted)] lowercase bg-[color:var(--ghost-hover-bg)] px-1 rounded-[2px]">{ing?.unidad}</span>
                                                </div>
                                             </div>

                                             <button 
                                                onClick={() => setNewProduct(s => ({...s, recipe: s.recipe.filter((_, i) => i !== idx)}))}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-[var(--radius)] transition-all transform hover:scale-110"
                                                title="Quitar ingrediente"
                                             >
                                                <Trash className="h-3.5 w-3.5" />
                                             </button>
                                          </div>
                                       )
                                    })}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Footer Actions */}
            {currentStep > 0 && (
               <div className="p-3 border-t border-[color:var(--border)] bg-[color:var(--card-bg)] flex justify-between items-center">
                  <Button 
                     variant="ghost" 
                     size="sm"
                     onClick={() => currentStep > 1 ? setCurrentStep(c => c - 1) : setProductModalOpen(false)}
                     className="h-9 px-4 rounded-lg font-medium text-[color:var(--muted)] hover:text-[color:var(--text)] text-xs"
                  >
                     {currentStep > 1 ? 'Atrás' : 'Cancelar'}
                  </Button>
                  
                  <Button 
                     size="sm"
                     onClick={() => {
                        const isLastStep = activeSection === 'ingredients' ? currentStep === 2 : currentStep === 3
                        if (isLastStep) {
                           void createNewProduct()
                        } else {
                           setCurrentStep(c => c + 1)
                        }
                     }}
                     className="h-9 px-6 rounded-lg font-bold shadow-sm hover:shadow transition-all text-xs"
                  >
                     {((activeSection === 'ingredients' && currentStep === 2) || currentStep === 3) 
                        ? (editingId ? 'Guardar Cambios' : 'Crear Producto') 
                        : 'Siguiente Paso'
                     }

                     {((activeSection !== 'ingredients' && currentStep < 3) || (activeSection === 'ingredients' && currentStep < 2)) && <ChevronRight className="ml-2 h-5 w-5" />}
                  </Button>
               </div>
            )}
          </div>
        </div>
      )}
      {/* Modal Receta (Ficha Técnica) - Integrado en el paso 3 del modal de producto */}

    </div>
  )
}
