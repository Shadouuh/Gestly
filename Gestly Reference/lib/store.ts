export type BusinessType = "general" | "ropa" | "comida" | "carniceria"
export type MeasurementUnit = "unidad" | "gramo" | "kilogramo"
export type TemplateRegion = "argentina" | "mexico" | "españa" | "colombia" | "chile"
export type ProductViewMode = "grid" | "list" | "table"

export type Variant = {
  id: string
  color?: string
  talle?: string
  stock: number
  precio: number
}

export type Product = {
  id: string
  nombre: string
  categoria: string
  precioCosto: number
  precioVenta: number
  stock: number
  unidad: MeasurementUnit
  variantes?: Variant[]
  imagen?: string
  trackStock: boolean // Si se controla stock o no
  disponible: boolean // Si está disponible para venta
}

export type StockMovement = {
  id: string
  productoId: string
  productoNombre: string
  tipo: "ingreso" | "egreso"
  cantidad: number
  precioCosto?: number
  fecha: string
  motivo: string
}

export type BusinessConfig = {
  nombre: string
  ubicacion: string
  tipoRubro: BusinessType
  tieneMultiplesSucursales: boolean
  region?: TemplateRegion
  trackStockGlobal: boolean // Control global de stock
}

export type Sucursal = {
  id: string
  nombre: string
  ubicacion: string
  activa: boolean
}

export type Permission = "pedidos" | "ventas" | "fiados" | "estadisticas" | "configuracion"

export type User = {
  id: string
  nombre: string
  email: string
  rol: "admin" | "vendedor" | "gerente"
  sucursalId?: string
  permisos: Permission[]
  activo: boolean
}

const STORAGE_KEYS = {
  PRODUCTS: "gestly-products",
  BUSINESS_TYPE: "gestly-business-type",
  STOCK_MOVEMENTS: "gestly-stock-movements",
  BUSINESS_CONFIG: "gestly-business-config",
  SUCURSALES: "gestly-sucursales",
  USERS: "gestly-users",
  CUSTOM_TEMPLATES: "gestly-custom-templates",
}

export const REGIONAL_TEMPLATES: Record<TemplateRegion, Record<BusinessType, { name: string; products: Product[] }>> = {
  argentina: {
    general: {
      name: "Almacén Argentino",
      products: [
        {
          id: "ar-g1",
          nombre: "Coca Cola 2.25L",
          categoria: "Bebidas",
          precioCosto: 850,
          precioVenta: 1200,
          stock: 24,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "ar-g2",
          nombre: "Quilmes 1L",
          categoria: "Bebidas",
          precioCosto: 650,
          precioVenta: 950,
          stock: 36,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "ar-g3",
          nombre: "Pan Lactal Bimbo",
          categoria: "Panadería",
          precioCosto: 1200,
          precioVenta: 1800,
          stock: 15,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "ar-g4",
          nombre: "Leche La Serenísima 1L",
          categoria: "Lácteos",
          precioCosto: 950,
          precioVenta: 1500,
          stock: 32,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "ar-g5",
          nombre: "Yerba Mate Playadito 1kg",
          categoria: "Almacén",
          precioCosto: 2200,
          precioVenta: 3200,
          stock: 18,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "ar-g6",
          nombre: "Dulce de Leche Sancor 400g",
          categoria: "Dulces",
          precioCosto: 1100,
          precioVenta: 1800,
          stock: 22,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
      ],
    },
    ropa: {
      name: "Tienda de Ropa Argentina",
      products: [
        {
          id: "ar-r1",
          nombre: "Remera Básica",
          categoria: "Remeras",
          precioCosto: 3500,
          precioVenta: 7000,
          stock: 45,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "ar-r2",
          nombre: "Jean Clásico",
          categoria: "Pantalones",
          precioCosto: 8500,
          precioVenta: 15000,
          stock: 30,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
      ],
    },
    comida: {
      name: "Restaurante Argentino",
      products: [
        {
          id: "ar-c1",
          nombre: "Asado Completo",
          categoria: "Platos Principales",
          precioCosto: 2500,
          precioVenta: 6500,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
        {
          id: "ar-c2",
          nombre: "Empanadas (docena)",
          categoria: "Entradas",
          precioCosto: 1800,
          precioVenta: 4500,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
        {
          id: "ar-c3",
          nombre: "Milanesa Napolitana",
          categoria: "Platos Principales",
          precioCosto: 1500,
          precioVenta: 4200,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
      ],
    },
    carniceria: {
      name: "Carnicería Argentina",
      products: [
        {
          id: "ar-ca1",
          nombre: "Asado de Tira",
          categoria: "Carne Vacuna",
          precioCosto: 4.5,
          precioVenta: 7.2,
          stock: 8000,
          unidad: "gramo",
          trackStock: true,
          disponible: true,
        },
        {
          id: "ar-ca2",
          nombre: "Bife de Chorizo",
          categoria: "Carne Vacuna",
          precioCosto: 6.0,
          precioVenta: 9.5,
          stock: 5000,
          unidad: "gramo",
          trackStock: true,
          disponible: true,
        },
      ],
    },
  },
  mexico: {
    general: {
      name: "Almacén Mexicano",
      products: [
        {
          id: "mx-g1",
          nombre: "Coca Cola 2L",
          categoria: "Bebidas",
          precioCosto: 25,
          precioVenta: 38,
          stock: 48,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "mx-g2",
          nombre: "Corona 355ml",
          categoria: "Bebidas",
          precioCosto: 18,
          precioVenta: 28,
          stock: 60,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "mx-g3",
          nombre: "Tortillas de Maíz (1kg)",
          categoria: "Panadería",
          precioCosto: 22,
          precioVenta: 35,
          stock: 30,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "mx-g4",
          nombre: "Frijoles Negros (1kg)",
          categoria: "Almacén",
          precioCosto: 28,
          precioVenta: 45,
          stock: 40,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "mx-g5",
          nombre: "Chile en Polvo (250g)",
          categoria: "Especias",
          precioCosto: 35,
          precioVenta: 55,
          stock: 25,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "mx-g6",
          nombre: "Salsa Valentina",
          categoria: "Condimentos",
          precioCosto: 15,
          precioVenta: 25,
          stock: 35,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
      ],
    },
    ropa: {
      name: "Tienda de Ropa Mexicana",
      products: [
        {
          id: "mx-r1",
          nombre: "Playera Básica",
          categoria: "Playeras",
          precioCosto: 80,
          precioVenta: 150,
          stock: 50,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
      ],
    },
    comida: {
      name: "Restaurante Mexicano",
      products: [
        {
          id: "mx-c1",
          nombre: "Tacos al Pastor (3 pzas)",
          categoria: "Platos Principales",
          precioCosto: 35,
          precioVenta: 85,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
        {
          id: "mx-c2",
          nombre: "Quesadillas",
          categoria: "Entradas",
          precioCosto: 25,
          precioVenta: 65,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
        {
          id: "mx-c3",
          nombre: "Enchiladas Verdes",
          categoria: "Platos Principales",
          precioCosto: 40,
          precioVenta: 95,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
      ],
    },
    carniceria: {
      name: "Carnicería Mexicana",
      products: [
        {
          id: "mx-ca1",
          nombre: "Carne Molida",
          categoria: "Carne",
          precioCosto: 120,
          precioVenta: 180,
          stock: 10000,
          unidad: "gramo",
          trackStock: true,
          disponible: true,
        },
      ],
    },
  },
  españa: {
    general: {
      name: "Almacén Español",
      products: [
        {
          id: "es-g1",
          nombre: "Aceite de Oliva 1L",
          categoria: "Aceites",
          precioCosto: 4.5,
          precioVenta: 7.5,
          stock: 20,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "es-g2",
          nombre: "Jamón Serrano 100g",
          categoria: "Embutidos",
          precioCosto: 8.0,
          precioVenta: 14.0,
          stock: 15,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
      ],
    },
    ropa: {
      name: "Tienda de Ropa Española",
      products: [],
    },
    comida: {
      name: "Restaurante Español",
      products: [
        {
          id: "es-c1",
          nombre: "Paella Valenciana",
          categoria: "Platos Principales",
          precioCosto: 8.0,
          precioVenta: 18.0,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
        {
          id: "es-c2",
          nombre: "Tortilla Española",
          categoria: "Tapas",
          precioCosto: 3.5,
          precioVenta: 8.0,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
      ],
    },
    carniceria: {
      name: "Carnicería Española",
      products: [],
    },
  },
  colombia: {
    general: {
      name: "Tienda Colombiana",
      products: [
        {
          id: "co-g1",
          nombre: "Café Juan Valdez 500g",
          categoria: "Café",
          precioCosto: 18000,
          precioVenta: 28000,
          stock: 25,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "co-g2",
          nombre: "Arepa de Maíz (paquete)",
          categoria: "Panadería",
          precioCosto: 4500,
          precioVenta: 7500,
          stock: 30,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
      ],
    },
    ropa: {
      name: "Tienda de Ropa Colombiana",
      products: [],
    },
    comida: {
      name: "Restaurante Colombiano",
      products: [
        {
          id: "co-c1",
          nombre: "Bandeja Paisa",
          categoria: "Platos Principales",
          precioCosto: 12000,
          precioVenta: 25000,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
        {
          id: "co-c2",
          nombre: "Ajiaco",
          categoria: "Sopas",
          precioCosto: 8000,
          precioVenta: 18000,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
      ],
    },
    carniceria: {
      name: "Carnicería Colombiana",
      products: [],
    },
  },
  chile: {
    general: {
      name: "Almacén Chileno",
      products: [
        {
          id: "cl-g1",
          nombre: "Vino Concha y Toro",
          categoria: "Bebidas",
          precioCosto: 3500,
          precioVenta: 5500,
          stock: 18,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
        {
          id: "cl-g2",
          nombre: "Pisco Capel",
          categoria: "Bebidas",
          precioCosto: 6500,
          precioVenta: 9500,
          stock: 12,
          unidad: "unidad",
          trackStock: true,
          disponible: true,
        },
      ],
    },
    ropa: {
      name: "Tienda de Ropa Chilena",
      products: [],
    },
    comida: {
      name: "Restaurante Chileno",
      products: [
        {
          id: "cl-c1",
          nombre: "Completo Italiano",
          categoria: "Platos Principales",
          precioCosto: 1500,
          precioVenta: 3500,
          stock: 0,
          unidad: "unidad",
          trackStock: false,
          disponible: true,
        },
      ],
    },
    carniceria: {
      name: "Carnicería Chilena",
      products: [],
    },
  },
}

// Plantillas por tipo de negocio (mantener compatibilidad)
export const BUSINESS_TEMPLATES: Record<BusinessType, Product[]> = {
  general: REGIONAL_TEMPLATES.argentina.general.products,
  ropa: REGIONAL_TEMPLATES.argentina.ropa.products,
  comida: REGIONAL_TEMPLATES.argentina.comida.products,
  carniceria: REGIONAL_TEMPLATES.argentina.carniceria.products,
}

export const categoriasPorTipo: Record<BusinessType, string[]> = {
  general: ["Bebidas", "Panadería", "Lácteos", "Almacén", "Snacks", "Dulces", "Limpieza", "Varios"],
  ropa: ["Remeras", "Pantalones", "Buzos", "Camperas", "Zapatos", "Accesorios"],
  comida: ["Entradas", "Platos Principales", "Postres", "Bebidas"],
  carniceria: ["Pollo", "Carne Vacuna", "Cerdo", "Embutidos", "Otros"],
}

// Funciones de acceso al localStorage
export function getProducts(): Product[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  return stored ? JSON.parse(stored) : BUSINESS_TEMPLATES.general
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
}

export function getBusinessType(): BusinessType {
  if (typeof window === "undefined") return "general"
  return (localStorage.getItem(STORAGE_KEYS.BUSINESS_TYPE) as BusinessType) || "general"
}

export function saveBusinessType(type: BusinessType): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.BUSINESS_TYPE, type)
}

export function getStockMovements(): StockMovement[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS)
  return stored ? JSON.parse(stored) : []
}

export function saveStockMovements(movements: StockMovement[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(movements))
}

export function getBusinessConfig(): BusinessConfig {
  if (typeof window === "undefined")
    return {
      nombre: "Mi Negocio",
      ubicacion: "",
      tipoRubro: "general",
      tieneMultiplesSucursales: false,
      region: "argentina",
      trackStockGlobal: true,
    }
  const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_CONFIG)
  return stored
    ? JSON.parse(stored)
    : {
        nombre: "Mi Negocio",
        ubicacion: "",
        tipoRubro: "general",
        tieneMultiplesSucursales: false,
        region: "argentina",
        trackStockGlobal: true,
      }
}

export function saveBusinessConfig(config: BusinessConfig): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.BUSINESS_CONFIG, JSON.stringify(config))
}

export function getSucursales(): Sucursal[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.SUCURSALES)
  return stored ? JSON.parse(stored) : []
}

export function saveSucursales(sucursales: Sucursal[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SUCURSALES, JSON.stringify(sucursales))
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.USERS)
  return stored ? JSON.parse(stored) : []
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export type CustomTemplate = {
  id: string
  name: string
  businessType: BusinessType
  region: TemplateRegion
  products: Product[]
  createdAt: string
}

export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES)
  return stored ? JSON.parse(stored) : []
}

export function saveCustomTemplate(template: CustomTemplate): void {
  if (typeof window === "undefined") return
  const templates = getCustomTemplates()
  templates.push(template)
  localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(templates))
}

export function deleteCustomTemplate(id: string): void {
  if (typeof window === "undefined") return
  const templates = getCustomTemplates().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(templates))
}
