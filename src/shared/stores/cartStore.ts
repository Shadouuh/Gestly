import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CartItem, Product } from '@shared/services/posService'
import { useToastStore } from './toastStore'

type CartState = {
  items: CartItem[]
  addProduct: (product: Product, quantity?: number) => void
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
      addProduct: (product, quantity = 1) => {
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id)
          // Trigger toast
          useToastStore.getState().showToast(`Se añadió ${product.nombre} al carrito`, 'success', 2000)
          
          if (existing) {
            return {
              items: s.items.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i)),
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
                quantity: quantity,
                imageUrl: product.imageUrl,
                category: product.categoria,
              },
            ],
          }
        })
      },
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
