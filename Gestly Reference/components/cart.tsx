"use client"

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/app/pedidos/page"

type CartProps = {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onCheckout: () => void
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="w-full md:w-[400px] border-l-0 md:border-l border-border/50 flex flex-col bg-secondary/20">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3 mb-1">
          <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
          <h2 className="text-xl font-light">Carrito</h2>
        </div>
        <p className="text-sm text-muted-foreground font-light">
          {itemCount} {itemCount === 1 ? "producto" : "productos"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" strokeWidth={1} />
              <p className="text-sm text-muted-foreground font-light">El carrito está vacío</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-card border border-border/50 animate-slide-in-right"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-sm flex-1 text-balance pr-2">{item.name}</h4>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg hover:bg-background transition-colors flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg hover:bg-background transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <p className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-light">Total</span>
          <span className="text-3xl font-light tracking-tight">${(total / 100).toFixed(2)}</span>
        </div>

        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-14 rounded-2xl text-base font-medium"
        >
          Procesar Pago
        </Button>
      </div>
    </div>
  )
}
