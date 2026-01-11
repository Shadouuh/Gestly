"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, Receipt, Package, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Pedidos", href: "/pedidos", icon: ShoppingBag },
  { name: "Ventas", href: "/ventas", icon: Receipt },
  { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 z-50 safe-bottom">
      <div className="flex items-center justify-around h-20 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 min-w-0 flex-1",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="w-6 h-6 shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
