import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { RegistrationData } from '@shared/services/authService'
import { loginWithEmailPassword, registerAccount } from '@shared/services/authService'

export type Account = {
  id: number | string
  businessId: number | string
  branchId?: string
  nombre: string
  email: string
  rol: 'admin' | 'vendedor' | 'gerente'
}

export type Business = {
  id: number | string
  nombre: string
  ubicacion: string
  rubro: string
  region: string
  tieneMultiplesSucursales: boolean
  stockMode?: 'complete' | 'simple'
  branches?: { id: string; name: string; address?: string }[]
}

type AuthStatus = 'anonymous' | 'authenticated' | 'loading'

export type AuthState = {
  status: AuthStatus
  token: string | null
  account: Account | null
  business: Business | null
  activeBranchId: string
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegistrationData) => Promise<boolean>
  logout: () => void
  updateBusiness: (businessData: Partial<Business>) => void
  setActiveBranchId: (branchId: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: 'anonymous',
      token: null,
      account: null,
      business: null,
      activeBranchId: 'all',
      error: null,
      login: async (email, password) => {
        set({ status: 'loading', error: null })
        try {
          const res = await loginWithEmailPassword(email, password)
          if (!res) {
            set({ status: 'anonymous', token: null, account: null, business: null, error: 'Credenciales inválidas' })
            return false
          }
          set({
            status: 'authenticated',
            token: res.token,
            account: res.account,
            business: res.business,
            activeBranchId: 'main',
            error: null,
          })
          return true
        } catch (e: unknown) {
          set({ status: 'anonymous', token: null, account: null, business: null, error: getErrorMessage(e) })
          return false
        }
      },
      register: async (data) => {
        set({ status: 'loading', error: null })
        try {
          const res = await registerAccount(data)
          if (!res) {
            set({ status: 'anonymous', token: null, account: null, business: null, error: 'Error al crear la cuenta' })
            return false
          }
          set({
            status: 'authenticated',
            token: res.token,
            account: res.account,
            business: res.business,
            activeBranchId: 'main',
            error: null,
          })
          return true
        } catch (e: unknown) {
          set({ status: 'anonymous', token: null, account: null, business: null, error: getErrorMessage(e) })
          return false
        }
      },
      logout: () => set({ status: 'anonymous', token: null, account: null, business: null, activeBranchId: 'main', error: null }),
      updateBusiness: (businessData) =>
        set((state) => ({
          business: state.business ? { ...state.business, ...businessData } : state.business,
        })),
      setActiveBranchId: (branchId) => set({ activeBranchId: branchId }),
    }),
    { name: 'gestly-auth' },
  ),
)

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (typeof e === 'object' && e) {
    const maybe = e as { message?: unknown }
    if (typeof maybe.message === 'string') return maybe.message
  }
  return 'Error'
}
