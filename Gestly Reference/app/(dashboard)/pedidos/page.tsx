"use client"

import { useState } from "react"
import { ProductSelector } from "@/components/product-selector"
import { Cart } from "@/components/cart"
import { CheckoutModal } from "@/components/checkout-modal"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/components/toast-container"

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  unidad: string
}

export type Sale = {
  id: string
  date: Date
  items: CartItem[]
  total: number
  paymentMethod: string
  customerName?: string
  isPending: boolean
}

export default function PedidosPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<"productos" | "carrito">("productos")
  const { showToast } = useToast()

  const addToCart = (product: { id: string; name: string; price: number; unidad: string }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        showToast(`+1 ${product.name}`, "success")
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      showToast(`${product.name} agregado al carrito`, "success")
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const handleCheckout = (sale: Sale) => {
    const sales = JSON.parse(localStorage.getItem("gestly-sales") || "[]")
    localStorage.setItem("gestly-sales", JSON.stringify([...sales, sale]))

    window.dispatchEvent(new Event("gestly-sales-updated"))

    clearCart()
    setIsCheckoutOpen(false)
    showToast("Venta registrada exitosamente", "success")
  }

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <div className="h-full hidden md:flex">
        <ProductSelector onAddToCart={addToCart} />
        <Cart
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={() => setIsCheckoutOpen(true)}
        />
      </div>

      <div className="md:hidden h-full flex flex-col">
        {/* Mobile Tabs */}
        <div className="flex gap-2 p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setMobileTab("productos")}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all ${
              mobileTab === "productos" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/50"
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setMobileTab("carrito")}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all relative ${
              mobileTab === "carrito" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Carrito
              {itemCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === "productos" && <ProductSelector onAddToCart={addToCart} />}
          {mobileTab === "carrito" && (
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onCheckout={() => setIsCheckoutOpen(true)}
            />
          )}
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutModal items={cartItems} onClose={() => setIsCheckoutOpen(false)} onConfirm={handleCheckout} />
      )}
    </>
  )
}
