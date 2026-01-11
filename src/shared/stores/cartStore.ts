import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CartItem, Product } from '@shared/services/posService'

type CartState = {
  items: CartItem[]
  addProduct: (product: Product) => void
  updateQuantity: (productId: number | string, quantity: number) => void
  removeItem: (productId: number | string) => void
  clear: () => void
  totalCents: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addProduct: (product) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id)
          if (existing) {
            return {
              items: s.items.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)),
            }
          }
          return {
            items: [
              ...s.items,
              {
                productId: product.id,
                nombre: product.nombre,
                priceCents: product.priceCents,
                unidad: product.unidad,
                quantity: 1,
              },
            ],
          }
        }),
      updateQuantity: (productId, quantity) =>
        set((s) => {
          if (quantity <= 0) return { items: s.items.filter((i) => i.productId !== productId) }
          return { items: s.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) }
        }),
      removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      totalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'gestly-cart' },
  ),
)
