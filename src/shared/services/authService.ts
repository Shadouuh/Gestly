import { fetchJson } from './http'
import type { Account, Business } from '@shared/stores/authStore'

export type RegistrationData = {
  nombre: string
  email: string
  password: string
  documento: string
  businessNombre: string
  businessUbicacion: string
  businessRubro: string
  businessRegion: string
  tieneMultiplesSucursales: boolean
  sucursales: Array<{ nombre: string; ubicacion: string }>
}

type LoginResponse = {
  token: string
  account: Account
  business: Business
}

export type AccountAdminRecord = Account & {
  activo: boolean
  documento?: string
}

export async function loginWithEmailPassword(email: string, password: string): Promise<LoginResponse | null> {
  const params = new URLSearchParams({ email, password })
  const accounts = await fetchJson<Account[]>(`/api/accounts?${params.toString()}`)
  const account = accounts[0]
  if (!account) return null
  const business = await fetchJson<Business>(`/api/businesses/${account.businessId}`)
  return { token: `token-${account.id}`, account, business }
}

export async function listAccounts(businessId: number | string) {
  const params = new URLSearchParams({ businessId: String(businessId) })
  return await fetchJson<AccountAdminRecord[]>(`/api/accounts?${params.toString()}`)
}

export async function registerAccount(data: RegistrationData): Promise<LoginResponse | null> {
  const business = await fetchJson<Business>('/api/businesses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: data.businessNombre,
      ubicacion: data.businessUbicacion,
      rubro: data.businessRubro,
      region: data.businessRegion,
      tieneMultiplesSucursales: data.tieneMultiplesSucursales,
    }),
  })

  const branchesToCreate = data.tieneMultiplesSucursales ? data.sucursales : [{ nombre: 'Casa Central', ubicacion: data.businessUbicacion }]
  await Promise.all(
    branchesToCreate.map((s) =>
      fetchJson('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, nombre: s.nombre, ubicacion: s.ubicacion, activa: true }),
      }),
    ),
  )

  const account = await fetchJson<Account>('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessId: business.id,
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      documento: data.documento,
      rol: 'admin',
      activo: true,
    }),
  })

  return { token: `token-${account.id}`, account, business }
}
