"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingBag, Receipt, Package, Settings, BarChart3, LogOut, User, Menu, X, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentUser, logout } from "@/lib/auth"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Pedidos", href: "/pedidos", icon: ShoppingBag },
  { name: "Ventas", href: "/ventas", icon: Receipt },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<{ nombre: string; email: string } | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    const collapsed = localStorage.getItem("gestly-sidebar-collapsed") === "true"
    setIsCollapsed(collapsed)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("gestly-sidebar-collapsed", String(newState))
  }

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex fixed left-6 top-6 bottom-6 bg-card rounded-3xl shadow-lg border border-border/50 flex-col items-center py-8 gap-6 z-50 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className={cn("flex items-center gap-3 px-4", isCollapsed ? "justify-center" : "w-full justify-between")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-semibold text-lg">G</span>
            </div>
            {!isCollapsed && <span className="font-semibold text-lg">Gestly</span>}
          </div>
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="w-14 h-14 rounded-2xl hover:bg-secondary transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}

        <nav className="flex-1 flex flex-col gap-2 w-full px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "h-14 rounded-2xl flex items-center gap-3 transition-all duration-200",
                  isCollapsed ? "justify-center px-0" : "px-4",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
                title={item.name}
              >
                <item.icon className="w-6 h-6 shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={toggleTheme}
          className={cn(
            "h-14 rounded-2xl bg-secondary hover:bg-secondary/80 flex items-center gap-3 transition-all duration-200",
            isCollapsed ? "w-14 justify-center" : "w-full px-4 mx-3",
          )}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Sun className="w-5 h-5" strokeWidth={1.5} />
          )}
          {!isCollapsed && <span className="font-medium">{theme === "light" ? "Modo Oscuro" : "Modo Claro"}</span>}
        </button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "h-14 rounded-2xl bg-secondary hover:bg-secondary/80 flex items-center gap-3 transition-all duration-200 cursor-pointer",
                  isCollapsed ? "w-14 justify-center" : "w-full px-4 mx-3",
                )}
                title={user.nombre}
              >
                <User className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                {!isCollapsed && (
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate w-full">{user.nombre}</p>
                    <p className="text-xs text-muted-foreground leading-none truncate w-full mt-1">{user.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56 rounded-2xl ml-2">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-none">{user.nombre}</p>
                  <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </aside>
    </>
  )
}
