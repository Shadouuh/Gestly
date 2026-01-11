import { useEffect, useMemo, useState } from 'react'
import { 
  Check, Plus, Search, X, 
  LayoutList, LayoutGrid, Table as TableIcon, 
  Eye, EyeOff, Store, ShoppingBasket, Coffee, 
  Croissant, CakeSlice, BookOpen, Hammer, 
  ArrowLeft, ChevronRight, CheckSquare, Square,
  ChefHat, Wheat, Package, MoreVertical, Edit, Trash, Image as ImageIcon
} from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { useAuthStore } from '@shared/stores/authStore'
import { useToastStore } from '@shared/stores/toastStore'
import { createProduct, getProducts, patchProduct, deleteProduct, type Product, createStockMovement } from '@shared/services/posService'
import { RUBROS, type Rubro, type Template, type TemplateItem } from './templates'

type ViewMode = 'card' | 'list' | 'table'
type Section = 'products' | 'templates'

const ICON_MAP: Record<string, any> = {
  Store, ShoppingBasket, Coffee, Croissant, CakeSlice, BookOpen, Hammer
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
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Recipe Modal State
  const [recipeModalOpen, setRecipeModalOpen] = useState(false)
  const [activeProductForRecipe, setActiveProductForRecipe] = useState<Product | null>(null)

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

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    return products.filter((p) => {
      const matchesQuery = !q || p.nombre.toLowerCase().includes(q)
      const matchesCategory = productCategory === 'all' || p.categoria === productCategory
      const matchesType = activeSection === 'ingredients' 
        ? p.isIngredient 
        : !p.isIngredient
        
      return matchesQuery && matchesCategory && matchesType
    })
  }, [products, productQuery, productCategory, activeSection])

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
      setActiveProductForRecipe(p)
      setRecipeModalOpen(true)
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
    <div key={p.id} className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5 shadow-[0_10px_30px_var(--shadow)] group hover:border-[color:var(--primary-bg)] transition-colors relative">
      <div className="absolute top-5 right-5 z-10">
          <button 
            onClick={() => setOpenDropdownId(openDropdownId === String(p.id) ? null : String(p.id))}
            className="p-1.5 rounded-lg text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)] transition-colors"
          >
              <MoreVertical className="h-4 w-4" />
          </button>
          
          {openDropdownId === String(p.id) && (
             <>
               <div className="fixed inset-0 z-0" onClick={() => setOpenDropdownId(null)} />
               <div className="absolute right-0 top-8 w-48 rounded-xl border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={() => handleEditProduct(p)} className="w-full text-left px-4 py-3 text-sm hover:bg-[color:var(--ghost-hover-bg)] flex items-center gap-2">
                     <Edit className="h-4 w-4 text-[color:var(--muted)]" />
                     Editar
                  </button>
                  {!p.isIngredient && (
                     <button onClick={() => handleOpenRecipe(p)} className="w-full text-left px-4 py-3 text-sm hover:bg-[color:var(--ghost-hover-bg)] flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-[color:var(--muted)]" />
                        Ver Receta
                     </button>
                  )}
                  <div className="h-px bg-[color:var(--border)] my-1" />
                  <button onClick={() => handleDeleteProduct(p)} className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                     <Trash className="h-4 w-4" />
                     Eliminar
                  </button>
               </div>
             </>
          )}
      </div>

      <div className="flex items-start gap-4">
        {/* Image Display */}
        <div className="h-12 w-12 rounded-xl bg-[color:var(--ghost-hover-bg)] border border-[color:var(--border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
            {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.nombre} className="h-full w-full object-cover" />
            ) : (
                <Package className="h-6 w-6 text-[color:var(--muted)] opacity-50" />
            )}
        </div>

        <div className="min-w-0 flex-1 pr-8">
          <div className="truncate text-sm font-semibold tracking-tight">{p.nombre}</div>
          <div className="mt-1 text-xs tracking-tight text-[color:var(--muted)]">
            {p.categoria}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
          {isStockSimple ? (
            <button
              type="button"
              onClick={() => void toggleProductAvailability(p)}
              className={[
                'flex h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-semibold tracking-tight transition-colors',
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
                'flex h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-semibold tracking-tight transition-colors',
                p.disponible
                  ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]'
                  : 'border-[color:var(--border)] bg-[color:var(--outline-bg)] text-[color:var(--text)]',
              ].join(' ')}
            >
              {p.disponible ? 'Activo' : 'Pausado'}
            </button>
          )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {showPrice && !p.isIngredient && (
          <div className="space-y-1">
             <label className="text-[10px] font-medium text-[color:var(--muted)] uppercase tracking-wider">Precio Venta</label>
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--muted)]">$</span>
                <Input 
                  className="h-9 pl-6 text-sm font-semibold tabular-nums bg-[color:var(--ghost-hover-bg)] border-transparent focus:bg-[color:var(--card-bg)]"
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
          <div className="space-y-1">
             <label className="text-[10px] font-medium text-[color:var(--muted)] uppercase tracking-wider">Costo</label>
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[color:var(--muted)]">$</span>
                <Input 
                  className="h-9 pl-6 text-sm tabular-nums bg-[color:var(--ghost-hover-bg)] border-transparent focus:bg-[color:var(--card-bg)] text-[color:var(--muted)]"
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
        <div className="mt-4 pt-4 border-t border-[color:var(--border)]">
           {p.recipe && p.recipe.length > 0 && !p.isIngredient && (
              <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)] mb-2">
                      Receta ({p.recipe.length} ingr.)
                  </div>
                  <div className="space-y-1 bg-[color:var(--ghost-hover-bg)]/50 p-2 rounded-lg">
                      {p.recipe.map((r, i) => {
                          const ing = products.find(x => x.id === r.ingredientId)
                          return (
                              <div key={i} className="flex justify-between text-xs">
                                  <span className="text-[color:var(--muted)] truncate pr-2">{ing?.nombre || '???'} (x{r.quantity})</span>
                                  <span className="tabular-nums opacity-70">${ing ? ((ing.costCents || 0) * r.quantity / 100).toFixed(2) : '-'}</span>
                              </div>
                          )
                      })}
                      <div className="flex justify-between text-xs font-bold pt-1 border-t border-[color:var(--border)] mt-1">
                          <span>Costo Total</span>
                          <span className="tabular-nums">
                              ${(p.recipe.reduce((acc, r) => {
                                  const ing = products.find(x => x.id === r.ingredientId)
                                  return acc + (ing ? (ing.costCents || 0) * r.quantity : 0)
                              }, 0) / 100).toFixed(2)}
                          </span>
                      </div>
                  </div>
              </div>
           )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button
                  type="button"
                  onClick={() => void toggleTrackStock(p)}
                  className={`text-xs font-medium transition-colors ${p.trackStock ? 'text-[color:var(--primary-bg)]' : 'text-[color:var(--muted)]'}`}
               >
                  {p.trackStock ? 'Stock Activo' : 'Sin control'}
               </button>
            </div>

            {p.trackStock && (
              <div className="flex items-center gap-2 bg-[color:var(--outline-bg)] rounded-lg p-1">
                <button
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
                  onClick={() => void updateStock(p, Math.max(0, (p.stock ?? 0) - 1))}
                >
                  −
                </button>
                <div className="w-12 text-center text-sm font-semibold tabular-nums">{p.stock ?? 0}</div>
                <button
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
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
  );

  const renderProductList = (p: Product) => (
    <div key={p.id} className={`flex items-center gap-4 rounded-2xl border bg-[color:var(--card-bg)] p-3 shadow-sm transition-all group ${p.disponible ? 'border-[color:var(--border)] hover:border-[color:var(--primary-bg)]' : 'border-[color:var(--border)] opacity-70'}`}>
      
      <div className="h-10 w-10 rounded-lg bg-[color:var(--ghost-hover-bg)] border border-[color:var(--border)] overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={() => handleEditProduct(p)}>
            {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.nombre} className="h-full w-full object-cover" />
            ) : (
                <Package className="h-4 w-4 text-[color:var(--muted)] opacity-50" />
            )}
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
          <div className={`flex items-center gap-1 bg-[color:var(--outline-bg)] rounded-lg p-1 ${!p.disponible ? 'opacity-50 pointer-events-none' : ''}`}>
              <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/50" onClick={() => void updateStock(p, Math.max(0, (p.stock ?? 0) - 1))}>−</button>
              <div className="w-10 text-center text-xs font-semibold tabular-nums">{p.stock ?? 0}</div>
              <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/50" onClick={() => void updateStock(p, (p.stock ?? 0) + 1)}>+</button>
          </div>
        ) : (
          <div className="text-xs text-[color:var(--muted)] w-24 text-center">Sin stock</div>
        )
      ) : (
        <div className="w-24"></div>
      )}

      <button
        onClick={() => void toggleProductAvailability(p)}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${p.disponible ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}
      >
        <Check className={`h-4 w-4 ${!p.disponible ? 'opacity-0' : 'opacity-100'}`} />
      </button>
    </div>
  );

  const renderProductTable = () => (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] overflow-hidden">
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
              <td className="px-4 py-3 font-medium">{p.nombre}</td>
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
                        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-[color:var(--outline-bg)]" onClick={() => void updateStock(p, Math.max(0, (p.stock ?? 0) - 1))}>−</button>
                        <div className="w-10 text-center text-xs font-semibold tabular-nums">{p.stock ?? 0}</div>
                        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-[color:var(--outline-bg)]" onClick={() => void updateStock(p, (p.stock ?? 0) + 1)}>+</button>
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
      <div className="h-full overflow-y-auto bg-[color:var(--bg-secondary)]">
         {/* Header de Sección */}
         <div className="sticky top-0 z-10 bg-[color:var(--bg)]/80 backdrop-blur-md border-b border-[color:var(--border)] px-6 py-4">
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

         <div className="max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!selectedRubro ? (
               // Rubro Selection
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                           className={`relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-br ${gradientClass}`}
                        >
                           <div className="absolute top-0 right-0 p-6 opacity-10">
                              <Icon className="w-32 h-32 -mr-8 -mt-8 rotate-12" strokeWidth={1} />
                           </div>
                           
                           <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                              <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                                 <Icon className="h-7 w-7 text-[color:var(--text)]" strokeWidth={1.5} />
                              </div>
                              <div>
                                 <div className="font-bold text-xl tracking-tight mb-1">{rubro.name}</div>
                                 <div className="text-sm font-medium text-[color:var(--muted)] flex items-center gap-1">
                                    Ver {rubro.templates.length} plantillas
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
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedRubro.templates.map((template, idx) => (
                     <div key={template.id} className="group relative rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--card-bg)] overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[color:var(--outline-bg)] to-transparent opacity-50" />
                        
                        <div className="relative p-6 flex flex-col h-full">
                           <div className="mb-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)] text-xs font-bold uppercase tracking-wider mb-3">
                                 <LayoutList className="h-3 w-3" />
                                 Plantilla
                              </div>
                              <h3 className="text-xl font-bold tracking-tight leading-tight">{template.name}</h3>
                              <p className="text-sm text-[color:var(--muted)] mt-2 font-medium leading-relaxed">{template.description}</p>
                           </div>
                           
                           <div className="flex-1 space-y-4 mb-8">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
                                 <div className="h-px flex-1 bg-[color:var(--border)]" />
                                 Contenido Destacado
                                 <div className="h-px flex-1 bg-[color:var(--border)]" />
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                 {template.items.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[color:var(--ghost-hover-bg)] text-sm font-medium">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--primary-bg)]" />
                                       <span className="truncate flex-1">{item.nombre}</span>
                                       <span className="text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-wider">{item.categoria}</span>
                                    </div>
                                 ))}
                                 {template.items.length > 3 && (
                                    <div className="text-center text-xs font-semibold text-[color:var(--muted)] mt-1">
                                       + {template.items.length - 3} productos más
                                    </div>
                                 )}
                              </div>
                           </div>
                           
                           <Button className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-[color:var(--primary-bg)]/20" onClick={() => handleTemplateSelect(template)}>
                              Explorar Plantilla
                              <ChevronRight className="ml-2 h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               // Template Detail & Selection
               <div className="max-w-5xl mx-auto">
                  <div className="flex flex-col lg:flex-row gap-8">
                     {/* Sidebar de Resumen */}
                     <div className="lg:w-80 flex-shrink-0 space-y-6">
                        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-xl sticky top-24">
                           <h3 className="font-bold text-lg mb-4">Resumen de Importación</h3>
                           
                           <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 rounded-2xl bg-[color:var(--ghost-hover-bg)]">
                                 <span className="text-sm font-medium text-[color:var(--muted)]">Productos</span>
                                 <span className="text-xl font-bold tabular-nums">{templateItemsSelection.size}</span>
                              </div>
                              
                              <div className="space-y-2 pt-2">
                                 <Button 
                                    className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-[color:var(--primary-bg)]/20"
                                    onClick={() => applyTemplate('merge')}
                                    disabled={isApplyingTemplate || templateItemsSelection.size === 0}
                                 >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar a mis productos
                                 </Button>
                                 <Button 
                                    variant="outline" 
                                    className="w-full h-12 rounded-xl border-red-200 hover:bg-red-50 text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20 dark:text-red-400 font-medium"
                                    onClick={() => applyTemplate('replace')}
                                    disabled={isApplyingTemplate || templateItemsSelection.size === 0}
                                 >
                                    Reemplazar todo mi catálogo
                                 </Button>
                              </div>
                              <p className="text-xs text-center text-[color:var(--muted)] px-2">
                                 "Agregar" sumará estos productos a los que ya tenés. "Reemplazar" borrará todo tu catálogo actual.
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Lista de Items */}
                     <div className="flex-1 min-w-0">
                        <div className="rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--card-bg)] overflow-hidden shadow-2xl">
                           <div className="p-6 border-b border-[color:var(--border)] bg-[color:var(--ghost-hover-bg)]/50 backdrop-blur-sm sticky top-0 z-10">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                 <div>
                                    <h2 className="text-lg font-bold">Selección de Productos</h2>
                                    <p className="text-sm text-[color:var(--muted)]">Desmarcá los productos que no necesites.</p>
                                 </div>
                                 <button 
                                    onClick={toggleAllTemplateItems} 
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--card-bg)] border border-[color:var(--border)] text-sm font-semibold hover:bg-[color:var(--ghost-hover-bg)] transition-colors shadow-sm"
                                 >
                                    {templateItemsSelection.size === selectedTemplate.items.length ? (
                                       <>
                                          <CheckSquare className="h-4 w-4 text-[color:var(--primary-bg)]" />
                                          Deseleccionar Todo
                                       </>
                                    ) : (
                                       <>
                                          <Square className="h-4 w-4" />
                                          Seleccionar Todo
                                       </>
                                    )}
                                 </button>
                              </div>
                           </div>
                           
                           <div className="divide-y divide-[color:var(--border)]">
                              {selectedTemplate.items.map((item, index) => {
                                 const isSelected = templateItemsSelection.has(index)
                                 return (
                                    <div 
                                       key={index} 
                                       className={`group flex items-center gap-4 p-5 transition-all cursor-pointer ${isSelected ? 'bg-[color:var(--card-bg)] hover:bg-[color:var(--ghost-hover-bg)]' : 'bg-[color:var(--ghost-hover-bg)]/30 opacity-60 hover:opacity-80'}`}
                                       onClick={() => toggleTemplateItem(index)}
                                    >
                                       <div className={`flex-shrink-0 transition-transform duration-200 ${isSelected ? 'scale-110 text-[color:var(--primary-bg)]' : 'scale-100 text-[color:var(--muted)]'}`}>
                                          {isSelected ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
                                       </div>
                                       
                                       {item.imageUrl && (
                                          <div className="h-12 w-12 rounded-xl bg-white border border-[color:var(--border)] overflow-hidden flex-shrink-0 shadow-sm">
                                             <img src={item.imageUrl} alt={item.nombre} className="h-full w-full object-cover" />
                                          </div>
                                       )}

                                       <div className="flex-1 min-w-0">
                                          <div className={`font-semibold text-base ${!isSelected && 'line-through text-[color:var(--muted)]'}`}>{item.nombre}</div>
                                          <div className="flex items-center gap-2 mt-1">
                                             <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[color:var(--outline-bg)] text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)]">
                                                {item.categoria}
                                             </span>
                                             {item.trackStock && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                                   Stock: {item.stock}
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                       
                                       <div className="text-right">
                                          <div className="font-bold text-base tabular-nums">${item.priceCents / 100}</div>
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
          <div className="flex bg-[color:var(--outline-bg)] p-1 rounded-xl mr-2">
             <button
                onClick={() => setActiveSection('products')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'products' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
             >
                Productos
             </button>
             <button
                onClick={() => setActiveSection('ingredients')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === 'ingredients' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
             >
                <div className="flex items-center gap-2">
                   <Wheat className="h-4 w-4" />
                   Ingredientes
                </div>
             </button>
          </div>

          <Button variant="outline" className="h-10 rounded-xl" onClick={() => setActiveSection('templates')}>
            <Store className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Plantillas
          </Button>
          <Button className="h-10 rounded-xl" onClick={() => {
             setNewProduct(prev => ({ 
                ...prev, 
                categoria: activeSection === 'ingredients' ? 'Materia Prima' : '' 
             }))
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
              <Select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="md:w-[200px]">
                <option value="all">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
           </div>

           <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <div className="flex items-center gap-1 bg-[color:var(--outline-bg)] p-1 rounded-xl">
                 <button onClick={() => setViewMode('card')} className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}>
                    <LayoutGrid className="h-4 w-4" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}>
                    <LayoutList className="h-4 w-4" />
                 </button>
                 <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[color:var(--card-bg)] shadow-sm text-[color:var(--text)]' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}>
                    <TableIcon className="h-4 w-4" />
                 </button>
              </div>
              
              <div className="h-8 w-[1px] bg-[color:var(--border)] mx-1" />

              <button 
                 onClick={() => setShowCost(!showCost)}
                 className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${showCost ? 'bg-[color:var(--primary-bg)]/10 border-[color:var(--primary-bg)]/20 text-[color:var(--primary-bg)]' : 'border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--outline-bg)]'}`}
              >
                 {showCost ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                 Costo
              </button>
              <button 
                 onClick={() => setShowPrice(!showPrice)}
                 className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${showPrice ? 'bg-[color:var(--primary-bg)]/10 border-[color:var(--primary-bg)]/20 text-[color:var(--primary-bg)]' : 'border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--outline-bg)]'}`}
              >
                 {showPrice ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                 Venta
              </button>
           </div>
        </div>

        {productsStatus === 'loading' && (
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5 text-sm text-[color:var(--muted)] shadow-[0_10px_30px_var(--shadow)]">
            Cargando…
          </div>
        )}
        {productsStatus === 'error' && (
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5 text-sm shadow-[0_10px_30px_var(--shadow)]">
            {productsError}
          </div>
        )}

        {productsStatus === 'success' && (
           <>
              {viewMode === 'card' && (
                 <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map(renderProductCard)}
                 </div>
              )}
              {viewMode === 'list' && (
                 <div className="space-y-2">
                    {filteredProducts.map(renderProductList)}
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-8 shadow-[0_20px_50px_var(--shadow)] animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                 <div className="text-xl font-bold tracking-tight">{editingId ? 'Editar Producto' : 'Nuevo producto'}</div>
                 <p className="text-sm text-[color:var(--muted)] mt-1">
                    {editingId ? 'Modificá los detalles de tu producto.' : 'Completá la información para crear uno nuevo.'}
                 </p>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[color:var(--ghost-hover-bg)] transition-colors"
                onClick={() => {
                  setProductModalOpen(false)
                  setEditingId(null)
                  setNewProduct({ nombre: '', categoria: '', unidad: 'u', priceCents: 0, costCents: 0, stock: 0, trackStock: true, disponible: true, imageUrl: '', recipe: [] })
                }}
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 -mx-2 px-2">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Columna Izquierda: Info Básica */}
                  <div className="space-y-5">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">Nombre del Producto</label>
                        <Input 
                           value={newProduct.nombre} 
                           onChange={(e) => setNewProduct((s) => ({ ...s, nombre: e.target.value }))} 
                           className="bg-[color:var(--ghost-hover-bg)] border-transparent h-11" 
                           placeholder="Ej. Pan Francés"
                        />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">Categoría</label>
                           <Input 
                              value={newProduct.categoria} 
                              onChange={(e) => setNewProduct((s) => ({ ...s, categoria: e.target.value }))} 
                              className="bg-[color:var(--ghost-hover-bg)] border-transparent h-11" 
                              placeholder="Ej. Panadería"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">Unidad</label>
                           <Select 
                              value={newProduct.unidad} 
                              onChange={(e) => setNewProduct((s) => ({ ...s, unidad: e.target.value }))} 
                              className="bg-[color:var(--ghost-hover-bg)] border-transparent h-11"
                           >
                              <option value="u">Unidad (u)</option>
                              <option value="kg">Kilogramos (kg)</option>
                              <option value="lt">Litros (lt)</option>
                           </Select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">Imagen (URL)</label>
                        <div className="flex gap-4">
                           <div className="h-11 w-11 rounded-lg bg-[color:var(--ghost-hover-bg)] border border-[color:var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                              {newProduct.imageUrl ? (
                                 <img src={newProduct.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                 <ImageIcon className="h-5 w-5 text-[color:var(--muted)]" />
                              )}
                           </div>
                           <Input 
                              value={newProduct.imageUrl} 
                              onChange={(e) => setNewProduct((s) => ({ ...s, imageUrl: e.target.value }))} 
                              className="bg-[color:var(--ghost-hover-bg)] border-transparent h-11 flex-1" 
                              placeholder="https://ejemplo.com/imagen.jpg" 
                           />
                        </div>
                     </div>
                  </div>

                  {/* Columna Derecha: Precios y Stock */}
                  <div className="space-y-5">
                     <div className="p-5 rounded-2xl bg-[color:var(--ghost-hover-bg)]/50 border border-[color:var(--border)] space-y-4">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                           <span className="w-1 h-4 bg-[color:var(--primary-bg)] rounded-full"/>
                           Precios y Costos
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">Precio Venta</label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[color:var(--muted)] font-medium">$</span>
                                 <Input
                                    inputMode="decimal"
                                    value={String(newProduct.priceCents / 100)}
                                    onChange={(e) => {
                                       const n = Number(e.target.value)
                                       if (Number.isNaN(n)) return
                                       setNewProduct((s) => ({ ...s, priceCents: Math.round(n * 100) }))
                                    }}
                                    className="bg-[color:var(--card-bg)] border-transparent h-11 pl-7 font-semibold"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">Costo</label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[color:var(--muted)] font-medium">$</span>
                                 <Input
                                    inputMode="decimal"
                                    value={String(newProduct.costCents / 100)}
                                    onChange={(e) => {
                                       const n = Number(e.target.value)
                                       if (Number.isNaN(n)) return
                                       setNewProduct((s) => ({ ...s, costCents: Math.round(n * 100) }))
                                    }}
                                    className="bg-[color:var(--card-bg)] border-transparent h-11 pl-7"
                                    disabled={isStockSimple}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     {!isStockSimple && (
                        <div className="p-5 rounded-2xl bg-[color:var(--ghost-hover-bg)]/50 border border-[color:var(--border)] space-y-4">
                           <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm flex items-center gap-2">
                                 <span className="w-1 h-4 bg-emerald-500 rounded-full"/>
                                 Control de Stock
                              </h3>
                              <button
                                 type="button"
                                 onClick={() => setNewProduct((s) => ({ ...s, trackStock: !s.trackStock }))}
                                 className={[
                                    'h-6 w-11 rounded-full border px-0.5 transition-colors relative',
                                    newProduct.trackStock
                                    ? 'border-[color:var(--primary-bg)] bg-[color:var(--primary-bg)]'
                                    : 'border-[color:var(--border)] bg-[color:var(--outline-bg)]',
                                 ].join(' ')}
                              >
                                 <div
                                    className={[
                                    'h-4 w-4 rounded-full transition-transform bg-white shadow-sm',
                                    newProduct.trackStock ? 'translate-x-5' : 'translate-x-0',
                                    ].join(' ')}
                                 />
                              </button>
                           </div>

                           {newProduct.trackStock && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                 <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">Stock Actual</label>
                                 <div className="flex items-center gap-3">
                                    <button 
                                       onClick={() => setNewProduct(s => ({...s, stock: Math.max(0, s.stock - 1)}))}
                                       className="h-11 w-11 rounded-xl bg-[color:var(--card-bg)] border border-[color:var(--border)] flex items-center justify-center hover:bg-[color:var(--outline-bg)]"
                                    >
                                       -
                                    </button>
                                    <Input
                                       inputMode="numeric"
                                       value={String(newProduct.stock)}
                                       onChange={(e) => setNewProduct((s) => ({ ...s, stock: Number(e.target.value || 0) }))}
                                       className="bg-[color:var(--card-bg)] border-transparent h-11 text-center font-bold text-lg"
                                    />
                                    <button 
                                       onClick={() => setNewProduct(s => ({...s, stock: s.stock + 1}))}
                                       className="h-11 w-11 rounded-xl bg-[color:var(--card-bg)] border border-[color:var(--border)] flex items-center justify-center hover:bg-[color:var(--outline-bg)]"
                                    >
                                       +
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[color:var(--border)] flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setProductModalOpen(false)} className="rounded-xl h-12 px-6">
                  Cancelar
               </Button>
               <Button className="h-12 rounded-xl px-8 text-base font-semibold shadow-lg shadow-[color:var(--primary-bg)]/20" onClick={() => void createNewProduct()}>
                  {editingId ? 'Guardar Cambios' : 'Crear Producto'}
               </Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Receta (Ficha Técnica) */}
      {recipeModalOpen && activeProductForRecipe && (
         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-5xl h-[80vh] rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--card-bg)] shadow-[0_50px_100px_var(--shadow)] animate-in zoom-in-95 flex overflow-hidden">
               
               {/* Sidebar Visual */}
               <div className="w-1/3 bg-[color:var(--ghost-hover-bg)] border-r border-[color:var(--border)] flex flex-col relative overflow-hidden">
                  {/* Background Image Effect */}
                  <div className="absolute inset-0 z-0">
                     {activeProductForRecipe.imageUrl && (
                        <img src={activeProductForRecipe.imageUrl} className="w-full h-full object-cover opacity-20 blur-xl scale-110" />
                     )}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full p-8">
                     <button
                        type="button"
                        className="self-start mb-6 p-2 rounded-full bg-[color:var(--card-bg)]/30 hover:bg-[color:var(--card-bg)]/50 transition-colors backdrop-blur-md border border-[color:var(--border)]"
                        onClick={() => setRecipeModalOpen(false)}
                     >
                        <ArrowLeft className="h-5 w-5" />
                     </button>

                     <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="h-40 w-40 rounded-[2rem] bg-[color:var(--card-bg)] shadow-2xl flex items-center justify-center mb-6 overflow-hidden border-4 border-[color:var(--card-bg)] ring-1 ring-[color:var(--border)]">
                           {activeProductForRecipe.imageUrl ? (
                              <img src={activeProductForRecipe.imageUrl} alt={activeProductForRecipe.nombre} className="h-full w-full object-cover" />
                           ) : (
                              <ChefHat className="h-16 w-16 text-[color:var(--primary-bg)] opacity-50" strokeWidth={1.5} />
                           )}
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">{activeProductForRecipe.nombre}</h2>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[color:var(--primary-bg)]/10 border border-[color:var(--primary-bg)]/20 text-[color:var(--primary-bg)] text-xs font-bold uppercase tracking-wider">
                           {activeProductForRecipe.categoria}
                        </div>
                     </div>

                     {/* Stats Cards */}
                     <div className="grid grid-cols-2 gap-3 mt-8">
                        <div className="p-4 rounded-2xl bg-[color:var(--card-bg)]/60 backdrop-blur-sm border border-[color:var(--border)] shadow-sm">
                           <div className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider mb-1">Costo Total</div>
                           <div className="text-xl font-bold tabular-nums">
                              ${(activeProductForRecipe.recipe?.reduce((acc, item) => {
                                 const ing = availableIngredients.find(i => i.id === item.ingredientId)
                                 return acc + (ing ? (ing.costCents || 0) * item.quantity : 0)
                              }, 0) / 100).toFixed(2) || '0.00'}
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[color:var(--card-bg)]/60 backdrop-blur-sm border border-[color:var(--border)] shadow-sm">
                           <div className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider mb-1">Margen</div>
                           <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                              {activeProductForRecipe.priceCents > 0 ? (
                                 `${Math.round(((activeProductForRecipe.priceCents - (activeProductForRecipe.recipe?.reduce((acc, item) => {
                                    const ing = availableIngredients.find(i => i.id === item.ingredientId)
                                    return acc + (ing ? (ing.costCents || 0) * item.quantity : 0)
                                 }, 0) || 0)) / activeProductForRecipe.priceCents) * 100)}%`
                              ) : '-'}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Main Content */}
               <div className="flex-1 flex flex-col bg-[color:var(--card-bg)]">
                  <div className="p-8 border-b border-[color:var(--border)] flex items-center justify-between bg-[color:var(--card-bg)]/80 backdrop-blur-xl sticky top-0 z-20">
                     <div>
                        <h3 className="text-xl font-bold">Composición de Receta</h3>
                        <p className="text-sm text-[color:var(--muted)]">Gestioná los ingredientes y cantidades.</p>
                     </div>
                     <div className="text-sm font-medium text-[color:var(--muted)] bg-[color:var(--ghost-hover-bg)] px-3 py-1.5 rounded-lg">
                        {activeProductForRecipe.recipe?.length || 0} Ingredientes
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                     {activeProductForRecipe.recipe?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[color:var(--muted)] opacity-50">
                           <ShoppingBasket className="h-16 w-16 mb-4" strokeWidth={1} />
                           <p className="text-lg font-medium">No hay ingredientes</p>
                           <p className="text-sm">Agregá el primer ingrediente abajo</p>
                        </div>
                     ) : (
                        activeProductForRecipe.recipe?.map((item, idx) => {
                           const ing = availableIngredients.find(i => i.id === item.ingredientId)
                           const itemCost = ing ? ((ing.costCents || 0) * item.quantity / 100) : 0
                           
                           return (
                              <div key={idx} className="group flex items-center gap-4 p-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card-bg)] hover:border-[color:var(--primary-bg)]/30 hover:shadow-lg hover:shadow-[color:var(--primary-bg)]/5 transition-all duration-300">
                                 <div className="h-14 w-14 rounded-2xl bg-[color:var(--ghost-hover-bg)] flex items-center justify-center overflow-hidden border border-[color:var(--border)] shadow-sm">
                                    {ing?.imageUrl ? (
                                       <img src={ing.imageUrl} className="h-full w-full object-cover" />
                                    ) : (
                                       <Package className="h-6 w-6 text-[color:var(--muted)] opacity-50" />
                                    )}
                                 </div>
                                 
                                 <div className="flex-1 min-w-0">
                                    <div className="font-bold text-base truncate text-[color:var(--text)]">{ing?.nombre || 'Desconocido'}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <div className="text-xs font-medium px-2 py-0.5 rounded-md bg-[color:var(--ghost-hover-bg)] text-[color:var(--muted)]">
                                          ${((ing?.costCents || 0) / 100).toFixed(2)} / {ing?.unidad}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                       <div className="flex items-center gap-2 bg-[color:var(--ghost-hover-bg)] p-1 rounded-xl border border-[color:var(--border)]">
                                          <Input
                                             type="number"
                                             className="w-16 h-8 bg-transparent border-transparent text-center font-bold text-sm tabular-nums p-0 focus:ring-0 text-[color:var(--text)]"
                                             value={item.quantity}
                                             onChange={async (e) => {
                                                const val = parseFloat(e.target.value)
                                                if (isNaN(val) || val < 0) return
                                                const newRecipe = [...(activeProductForRecipe.recipe || [])]
                                                newRecipe[idx].quantity = val
                                                setActiveProductForRecipe({ ...activeProductForRecipe, recipe: newRecipe })
                                                await patchProduct(activeProductForRecipe.id, { recipe: newRecipe })
                                                setProducts(prev => prev.map(p => p.id === activeProductForRecipe.id ? { ...p, recipe: newRecipe } : p))
                                             }}
                                          />
                                          <span className="text-xs font-bold text-[color:var(--muted)] pr-2 border-l border-[color:var(--border)] pl-2">
                                             {ing?.unidad}
                                          </span>
                                       </div>
                                       <div className="text-xs font-medium text-[color:var(--muted)] mt-1 tabular-nums">
                                          = ${itemCost.toFixed(2)}
                                       </div>
                                    </div>

                                    <button 
                                       className="h-10 w-10 rounded-xl flex items-center justify-center text-[color:var(--muted)] hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent transition-all"
                                       onClick={async () => {
                                          const newRecipe = activeProductForRecipe.recipe?.filter((_, i) => i !== idx) || []
                                          setActiveProductForRecipe({ ...activeProductForRecipe, recipe: newRecipe })
                                          await patchProduct(activeProductForRecipe.id, { recipe: newRecipe })
                                          setProducts(prev => prev.map(p => p.id === activeProductForRecipe.id ? { ...p, recipe: newRecipe } : p))
                                       }}
                                    >
                                       <Trash className="h-5 w-5" />
                                    </button>
                                 </div>
                              </div>
                           )
                        })
                     )}
                  </div>

                  {/* Footer - Add Ingredient */}
                  <div className="p-6 border-t border-[color:var(--border)] bg-[color:var(--ghost-hover-bg)]/30">
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Plus className="h-5 w-5 text-[color:var(--primary-bg)]" />
                        </div>
                        <Select
                           className="w-full h-14 bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-2xl pl-12 pr-10 appearance-none cursor-pointer hover:border-[color:var(--primary-bg)] hover:shadow-lg hover:shadow-[color:var(--primary-bg)]/10 transition-all font-medium text-base text-[color:var(--text)]"
                           value=""
                           onChange={async (e) => {
                              if (!e.target.value) return
                              const ing = availableIngredients.find(i => i.id === e.target.value)
                              if (!ing) return
                              
                              const newRecipe = [...(activeProductForRecipe.recipe || []), { ingredientId: ing.id, quantity: 1 }]
                              setActiveProductForRecipe({ ...activeProductForRecipe, recipe: newRecipe })
                              await patchProduct(activeProductForRecipe.id, { recipe: newRecipe })
                              setProducts(prev => prev.map(p => p.id === activeProductForRecipe.id ? { ...p, recipe: newRecipe } : p))
                           }}
                        >
                           <option value="" className="bg-[color:var(--card-bg)] text-[color:var(--text)]">Agregar nuevo ingrediente...</option>
                           {availableIngredients.map(ing => (
                              <option key={ing.id} value={ing.id} className="bg-[color:var(--card-bg)] text-[color:var(--text)]">
                                 {ing.nombre} ({ing.unidad})
                              </option>
                           ))}
                        </Select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                           <div className="bg-[color:var(--outline-bg)] px-2 py-1 rounded-md text-xs font-bold text-[color:var(--muted)] border border-[color:var(--border)]">
                              ENTER
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}
