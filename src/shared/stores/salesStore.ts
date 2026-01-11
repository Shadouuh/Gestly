import { create } from 'zustand'

import { createSale, getSales, patchSale, type CreateSaleInput, type Sale } from '@shared/services/posService'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

type SalesState = {
  status: LoadStatus
  error: string | null
  sales: Sale[]
  loadSales: (businessId: number | string) => Promise<void>
  registerSale: (input: CreateSaleInput) => Promise<Sale | null>
  markSalePaid: (saleId: number | string) => Promise<void>
}

export const useSalesStore = create<SalesState>((set, get) => ({
  status: 'idle',
  error: null,
  sales: [],
  loadSales: async (businessId) => {
    set({ status: 'loading', error: null })
    try {
      const sales = await getSales(businessId)
      set({ status: 'success', sales, error: null })
    } catch (e: unknown) {
      set({ status: 'error', error: getErrorMessage(e) })
    }
  },
  registerSale: async (input) => {
    try {
      const sale = await createSale(input)
      set({ sales: [...get().sales, sale] })
      return sale
    } catch {
      return null
    }
  },
  markSalePaid: async (saleId) => {
    const sale = get().sales.find((s) => String(s.id) === String(saleId))
    if (!sale) return
    const updated = await patchSale(saleId, { isPending: false })
    set({ sales: get().sales.map((s) => (String(s.id) === String(saleId) ? updated : s)) })
  },
}))

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (typeof e === 'object' && e) {
    const maybe = e as { message?: unknown }
    if (typeof maybe.message === 'string') return maybe.message
  }
  return 'Error'
}
