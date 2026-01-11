"use client"

import { usePathname, useRouter } from "next/navigation"
import { User, LogOut, Moon, Sun } from "lucide-react"
import { getCurrentUser, logout } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const pageTitles: Record<string, string> = {
  "/pedidos": "Pedidos",
  "/ventas": "Ventas",
  "/estadisticas": "Estadísticas",
  "/fiados": "Fiados",
  "/configuracion": "Configuración",
}

export function MobileHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<{ nombre: string; email: string } | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const title = pageTitles[pathname] || "Gestly"

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border/50 z-40 safe-top">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-lg">G</span>
          </div>
          <h1 className="font-semibold text-lg">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Sun className="w-5 h-5" strokeWidth={1.5} />
            )}
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-56 rounded-2xl mt-2">
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
        </div>
      </div>
    </header>
  )
}
