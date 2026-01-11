"use client"

import { useState } from "react"
import { X, CreditCard, DollarSign, Smartphone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CartItem, Sale } from "@/app/pedidos/page"

type CheckoutModalProps = {
  items: CartItem[]
  onClose: () => void
  onConfirm: (sale: Sale) => void
}

const PAYMENT_METHODS = [
  { id: "efectivo", name: "Efectivo", icon: DollarSign, bg: "hover:bg-green-50/5" },
  { id: "tarjeta", name: "Tarjeta", icon: CreditCard, bg: "hover:bg-blue-50/5" },
  { id: "mp", name: "Mercado Pago", icon: Smartphone, bg: "hover:bg-cyan-50/5" },
]

export function CheckoutModal({ items, onClose, onConfirm }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("efectivo")
  const [isPending, setIsPending] = useState(false)
  const [customerName, setCustomerName] = useState("")

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleConfirm = () => {
    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date(),
      items: [...items],
      total,
      paymentMethod,
      customerName: isPending ? customerName : undefined,
      isPending,
    }

    onConfirm(sale)
  }

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
      <div className="bg-background rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-in-up border border-border/50">
        <div className="p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="text-2xl font-light">Checkout</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumen de productos */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Resumen</h3>
            <div className="space-y-2.5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm py-2">
                  <span className="text-muted-foreground font-light">
                    <span className="text-foreground font-medium">{item.quantity}x</span> {item.name}
                  </span>
                  <span className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t-2 border-border/50 flex items-center justify-between">
              <span className="font-medium text-lg">Total</span>
              <span className="text-3xl font-light tracking-tight">${(total / 100).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Método de Pago</h3>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-5 rounded-2xl border-2 transition-all duration-200 ${method.bg} ${
                    paymentMethod === method.id
                      ? "border-foreground bg-foreground text-background shadow-lg scale-105"
                      : "border-border/40 hover:border-border"
                  }`}
                >
                  <method.icon className="w-7 h-7 mx-auto mb-2.5" strokeWidth={1.5} />
                  <span className="text-xs font-medium block text-center leading-tight">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="pending"
                checked={isPending}
                onChange={(e) => setIsPending(e.target.checked)}
                className="w-5 h-5 rounded-lg border-border/50 text-foreground focus:ring-foreground cursor-pointer"
              />
              <label htmlFor="pending" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <User className="w-4 h-4" strokeWidth={1.5} />
                Registrar como fiado
              </label>
            </div>

            {isPending && (
              <div className="animate-slide-in-up pt-2">
                <Label
                  htmlFor="customerName"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block"
                >
                  Nombre del Cliente
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ingresa el nombre del cliente"
                  className="h-12 rounded-xl bg-background"
                />
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 h-12 rounded-2xl bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending && !customerName.trim()}
              className="flex-1 h-12 rounded-2xl shadow-lg"
            >
              Confirmar Venta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
