"use client"

import { Search, TrendingUp, Layers, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { getProducts, getBusinessType, type Product } from "@/lib/store"
import { getCategoryIcon } from "@/lib/icons-map"

type ProductSelectorProps = {
  onAddToCart: (product: { id: string; name: string; price: number; unidad: string }) => void
}

export function ProductSelector({ onAddToCart }: ProductSelectorProps) {
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [businessType, setBusinessType] = useState("")
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    setProducts(getProducts())
    setBusinessType(getBusinessType())
  }, [])

  useEffect(() => {
    const handleStorage = () => {
      setProducts(getProducts())
      setBusinessType(getBusinessType())
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("gestly-products-updated", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("gestly-products-updated", handleStorage)
    }
  }, [])

  const filteredProducts = products.filter((product) => product.nombre.toLowerCase().includes(search.toLowerCase()))

  const categories = Array.from(new Set(products.map((p) => p.categoria)))

  const handleAddProduct = (product: Product) => {
    onAddToCart({
      id: product.id,
      name: product.nombre,
      price: product.precioVenta * 100,
      unidad: product.unidad,
    })

    // Mostrar feedback visual temporalmente
    setAddedProducts((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedProducts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }, 1000)
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="mb-6 md:mb-8 animate-slide-in-up">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Nuevo Pedido</h1>
        <p className="text-muted-foreground text-sm font-light">Selecciona los productos para agregar al carrito</p>
      </div>

      <div className="mb-6 md:mb-8 relative animate-slide-in-up" style={{ animationDelay: "50ms" }}>
        <Search
          className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 md:pl-14 h-12 md:h-14 rounded-2xl border-border/50 bg-secondary/30 focus:bg-background transition-colors text-base"
        />
      </div>

      <div className="space-y-6 md:space-y-8">
        {categories.map((category, categoryIndex) => {
          const categoryProducts = filteredProducts.filter((p) => p.categoria === category)
          if (categoryProducts.length === 0) return null

          const CategoryIcon = getCategoryIcon(category)

          return (
            <div
              key={category}
              className="animate-slide-in-up"
              style={{ animationDelay: `${100 + categoryIndex * 50}ms` }}
            >
              <div className="mb-4 md:mb-5 pb-3 border-b border-border/30 flex items-center gap-3">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-secondary/60 flex items-center justify-center">
                  <CategoryIcon className="w-4 h-4 md:w-5 md:h-5 text-foreground/70" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-foreground/80 tracking-wide">{category}</h3>
                <span className="text-xs text-muted-foreground ml-auto">{categoryProducts.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {categoryProducts.map((product) => {
                  const stockLevel = product.stock < 10 ? "low" : product.stock < 30 ? "medium" : "high"
                  const stockColor =
                    stockLevel === "low"
                      ? "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                      : stockLevel === "medium"
                        ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
                        : "text-green-600 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"

                  const margen = (((product.precioVenta - product.precioCosto) / product.precioCosto) * 100).toFixed(0)

                  const getUnidadDisplay = () => {
                    if (product.unidad === "gramo") return "g"
                    if (product.unidad === "kilogramo") return "kg"
                    return "u."
                  }

                  const isAdded = addedProducts.has(product.id)

                  return (
                    <div
                      key={product.id}
                      className="relative p-5 md:p-6 rounded-3xl border-2 border-border/40 bg-card hover:bg-secondary/30 hover:border-foreground/20 hover:shadow-xl transition-all duration-300 text-left group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-secondary/60 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                          <CategoryIcon className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <div className={`px-2.5 md:px-3 py-1.5 rounded-xl border ${stockColor} text-xs font-semibold`}>
                          {product.stock} {getUnidadDisplay()}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-base md:text-lg mb-1 group-hover:text-foreground transition-colors text-balance leading-tight">
                          {product.nombre}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Layers className="w-3 h-3" />
                          <span>{product.categoria}</span>
                        </div>
                      </div>

                      <div className="h-px bg-border/40 mb-4" />

                      <div className="space-y-2 mb-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Precio</span>
                          <span className="text-xl md:text-2xl font-semibold tracking-tight">
                            ${product.precioVenta.toFixed(2)}
                          </span>
                        </div>
                        {product.unidad !== "unidad" && (
                          <div className="text-xs text-muted-foreground">
                            por {product.unidad === "gramo" ? "gramo" : "kilogramo"}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pb-4 border-b border-border/30">
                        <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-muted-foreground">Margen</span>
                        <span className="text-xs font-bold text-green-600 ml-auto">+{margen}%</span>
                      </div>

                      <button
                        onClick={() => handleAddProduct(product)}
                        disabled={isAdded}
                        className={`mt-4 w-full h-11 md:h-12 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base ${
                          isAdded
                            ? "bg-green-500 text-white shadow-lg"
                            : "bg-foreground text-background hover:bg-foreground/90 hover:shadow-lg active:scale-95"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Añadido</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Añadir al carrito</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
