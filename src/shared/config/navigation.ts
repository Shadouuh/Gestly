import { ShoppingBag, Receipt, Package, Palette, Settings } from 'lucide-react'

export const NAVIGATION_ITEMS = [
  { name: 'Pedidos', to: '/app/pedidos', icon: ShoppingBag },
  { name: 'Ventas', to: '/app/ventas', icon: Receipt },
  { name: 'Productos', to: '/app/productos', icon: Package },
  { name: 'Temas', to: '/app/temas', icon: Palette },
  { name: 'Configuración', to: '/app/configuracion', icon: Settings },
] as const
