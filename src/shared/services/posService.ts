import { fetchJson } from './http'

export type Product = {
  id: number | string
  businessId: number | string
  nombre: string
  imageUrl?: string | null
  priceCents: number
  costCents?: number | null
  unidad: string
  categoria: string
  disponible: boolean
  trackStock: boolean
  stock: number | null
  isIngredient?: boolean
  recipe?: { ingredientId: string; quantity: number }[]
}

export type CartItem = {
  productId: number | string
  nombre: string
  priceCents: number
  unidad: string
  quantity: number
  imageUrl?: string | null
  category?: string
}

export type Sale = {
  id: number | string
  businessId: number | string
  branchId?: string
  userId?: string | number
  userName?: string
  branchName?: string
  date: string
  items: CartItem[]
  totalCents: number
  paymentMethod: 'efectivo' | 'tarjeta' | 'mp'
  customerName?: string
  isPending: boolean
  status?: 'pending' | 'preparing' | 'ready' | 'delivered'
}

export type StockMovement = {
  id: number | string
  businessId: number | string
  productId: number | string
  productName: string
  quantity: number
  costCents: number
  date: string
  type: 'entry' | 'adjustment'
}

export async function getProducts(businessId: number | string) {
  const params = new URLSearchParams({ businessId: String(businessId) })
  return await fetchJson<Product[]>(`/api/products?${params.toString()}`)
}

export async function getStockMovements(businessId: number | string) {
  const params = new URLSearchParams({ businessId: String(businessId) })
  return await fetchJson<StockMovement[]>(`/api/stock_movements?${params.toString()}`)
}

export async function createStockMovement(input: Omit<StockMovement, 'id'>) {
  return await fetchJson<StockMovement>('/api/stock_movements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export type CreateSaleInput = Omit<Sale, 'id'>

export async function createSale(input: CreateSaleInput) {
  return await fetchJson<Sale>('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function getSales(businessId: number | string) {
  const params = new URLSearchParams({ businessId: String(businessId) })
  return await fetchJson<Sale[]>(`/api/sales?${params.toString()}`)
}

export async function patchSale(id: number | string, patch: Partial<Sale>) {
  return await fetchJson<Sale>(`/api/sales/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export async function patchBusiness(id: number | string, patch: Record<string, unknown>) {
  return await fetchJson(`/api/businesses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export async function patchProduct(id: number | string, patch: Partial<Product>) {
  return await fetchJson<Product>(`/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export async function createProduct(input: Omit<Product, 'id'>) {
  return await fetchJson<Product>('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function deleteProduct(id: number | string) {
  return await fetchJson(`/api/products/${id}`, {
    method: 'DELETE',
  })
}
