export type AuthUser = {
  id: string
  nombre: string
  email: string
  rol: "admin" | "vendedor" | "gerente"
  businessId?: string
  sucursalId?: string
}

export type RegistrationData = {
  // Datos personales
  nombre: string
  email: string
  password: string
  documento: string

  // Datos del negocio
  businessNombre: string
  businessUbicacion: string
  businessRubro: string
  businessRegion: string

  // Sucursales
  tieneMultiplesSucursales: boolean
  sucursales?: Array<{
    nombre: string
    ubicacion: string
  }>
}

const STORAGE_KEY = "gestly-auth-user"
const REGISTRATION_DATA_KEY = "gestly-registration-data"

export function login(email: string, password: string): AuthUser | null {
  // Demo: cualquier email/password funciona, por ahora es solo para UI
  // En producción, aquí validarías contra una base de datos
  if (email && password) {
    const user: AuthUser = {
      id: "1",
      nombre: email.split("@")[0],
      email: email,
      rol: "admin",
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }
    return user
  }
  return null
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function register(data: RegistrationData): AuthUser | null {
  // Guardar datos de registro
  if (typeof window !== "undefined") {
    localStorage.setItem(REGISTRATION_DATA_KEY, JSON.stringify(data))

    // Crear usuario admin
    const user: AuthUser = {
      id: "1",
      nombre: data.nombre,
      email: data.email,
      rol: "admin",
      businessId: "1",
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))

    // Guardar configuración del negocio en el store
    const businessConfig = {
      nombre: data.businessNombre,
      ubicacion: data.businessUbicacion,
      tipoRubro: data.businessRubro as any,
      region: data.businessRegion as any,
      tieneMultiplesSucursales: data.tieneMultiplesSucursales,
      trackStockGlobal: true,
    }
    localStorage.setItem("gestly-business-config", JSON.stringify(businessConfig))

    // Guardar sucursales si existen
    if (data.tieneMultiplesSucursales && data.sucursales && data.sucursales.length > 0) {
      const sucursales = data.sucursales.map((s, idx) => ({
        id: `sucursal-${idx + 1}`,
        nombre: s.nombre,
        ubicacion: s.ubicacion,
        activa: true,
      }))
      localStorage.setItem("gestly-sucursales", JSON.stringify(sucursales))
    }

    return user
  }
  return null
}

export function getRegistrationData(): RegistrationData | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(REGISTRATION_DATA_KEY)
  return stored ? JSON.parse(stored) : null
}
