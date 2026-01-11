"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  User,
  Clock,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Sale } from "@/app/pedidos/page"

export default function EstadisticasPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filterPeriod, setFilterPeriod] = useState<"today" | "week" | "month" | "all">("all")
  const [filterUser, setFilterUser] = useState<string>("all")

  useEffect(() => {
    const storedSales = JSON.parse(localStorage.getItem("gestly-sales") || "[]")
    setSales(
      storedSales.map((sale: Sale) => ({
        ...sale,
        date: new Date(sale.date),
      })),
    )
  }, [])

  // Filtrar ventas por período
  const getFilteredSales = () => {
    const now = new Date()
    let filtered = sales

    switch (filterPeriod) {
      case "today":
        filtered = sales.filter((s) => new Date(s.date).toDateString() === now.toDateString())
        break
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = sales.filter((s) => new Date(s.date) >= weekAgo)
        break
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = sales.filter((s) => new Date(s.date) >= monthAgo)
        break
    }

    if (filterUser !== "all") {
      filtered = filtered.filter((s) => s.customerName === filterUser || (!s.isPending && filterUser === "ninguno"))
    }

    return filtered
  }

  const filteredSales = getFilteredSales()

  // Calcular estadísticas
  const totalIngresos = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const ventasPagadas = filteredSales.filter((s) => !s.isPending)
  const ventasFiadas = filteredSales.filter((s) => s.isPending)
  const ingresosPagados = ventasPagadas.reduce((sum, sale) => sum + sale.total, 0)
  const ingresosFiados = ventasFiadas.reduce((sum, sale) => sum + sale.total, 0)

  // Ventas por producto
  const salesByProduct: { [key: string]: { cantidad: number; total: number } } = {}
  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!salesByProduct[item.name]) {
        salesByProduct[item.name] = { cantidad: 0, total: 0 }
      }
      salesByProduct[item.name].cantidad += item.quantity
      salesByProduct[item.name].total += item.price * item.quantity
    })
  })

  const productStats = Object.entries(salesByProduct)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total)

  // Ventas por método de pago
  const salesByMethod = {
    efectivo: filteredSales.filter((s) => s.paymentMethod === "efectivo").length,
    tarjeta: filteredSales.filter((s) => s.paymentMethod === "tarjeta").length,
    mp: filteredSales.filter((s) => s.paymentMethod === "mp").length,
  }

  // Usuarios únicos
  const uniqueUsers = Array.from(new Set(filteredSales.filter((s) => s.isPending).map((s) => s.customerName)))

  // Ventas por usuario
  const salesByUser: { [key: string]: { cantidad: number; total: number } } = {}
  filteredSales
    .filter((s) => s.isPending)
    .forEach((sale) => {
      if (!salesByUser[sale.customerName || ""]) {
        salesByUser[sale.customerName || ""] = { cantidad: 0, total: 0 }
      }
      salesByUser[sale.customerName || ""].cantidad += 1
      salesByUser[sale.customerName || ""].total += sale.total
    })

  const userStats = Object.entries(salesByUser)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="mb-6 md:mb-8 animate-slide-in-up">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Estadísticas</h1>
            <p className="text-muted-foreground text-sm font-light">Análisis detallado de ventas e ingresos</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50">
          <Filter className="w-5 h-5 text-muted-foreground hidden md:block" strokeWidth={1.5} />
          <div className="flex items-center gap-3 flex-col md:flex-row w-full md:flex-1">
            <span className="text-sm font-medium text-muted-foreground self-start md:self-center">Período:</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full pb-2 md:pb-0">
              {[
                { value: "today", label: "Hoy" },
                { value: "week", label: "Semana" },
                { value: "month", label: "Mes" },
                { value: "all", label: "Todo" },
              ].map((period) => (
                <Button
                  key={period.value}
                  onClick={() => setFilterPeriod(period.value as any)}
                  variant="outline"
                  size="sm"
                  className={`rounded-xl shrink-0 ${
                    filterPeriod === period.value ? "bg-foreground text-background border-foreground" : "bg-transparent"
                  }`}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
          {uniqueUsers.length > 0 && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-medium text-muted-foreground">Usuario:</span>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="w-full md:w-[180px] rounded-xl border-border/50">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ninguno">Sin cliente</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 animate-slide-in-up"
        style={{ animationDelay: "50ms" }}
      >
        <div className="p-4 md:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
              Ingresos
            </span>
          </div>
          <p className="text-xl md:text-3xl font-light mb-1">${(totalIngresos / 100).toFixed(2)}</p>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <ArrowUpRight className="w-3 h-3" />
            <span className="text-[10px] md:text-xs">{filteredSales.length}</span>
          </div>
        </div>

        <div className="p-4 md:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
              Pagados
            </span>
          </div>
          <p className="text-xl md:text-3xl font-light mb-1">${(ingresosPagados / 100).toFixed(2)}</p>
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <ArrowUpRight className="w-3 h-3" />
            <span className="text-[10px] md:text-xs">{ventasPagadas.length}</span>
          </div>
        </div>

        <div className="p-4 md:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6 text-amber-600" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
              Fiados
            </span>
          </div>
          <p className="text-xl md:text-3xl font-light mb-1">${(ingresosFiados / 100).toFixed(2)}</p>
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] md:text-xs">{ventasFiadas.length}</span>
          </div>
        </div>

        <div className="p-4 md:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
              Productos
            </span>
          </div>
          <p className="text-xl md:text-3xl font-light mb-1">{Object.keys(salesByProduct).length}</p>
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <BarChart3 className="w-3 h-3" />
            <span className="text-[10px] md:text-xs">{productStats.reduce((sum, p) => sum + p.cantidad, 0)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Ventas por Producto */}
        <div className="animate-slide-in-up" style={{ animationDelay: "100ms" }}>
          <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Package className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-base md:text-lg font-medium">Ventas por Producto</h2>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {productStats.slice(0, 10).map((product, index) => (
                <div
                  key={product.name}
                  className="p-3 md:p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground shrink-0">#{index + 1}</span>
                      <h4 className="font-medium text-sm md:text-base truncate">{product.name}</h4>
                    </div>
                    <span className="text-base md:text-lg font-semibold shrink-0 ml-2">
                      ${(product.total / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.cantidad} unidades</span>
                    <span>${(product.total / product.cantidad / 100).toFixed(2)} c/u</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ventas por Usuario (Fiados) */}
        <div className="animate-slide-in-up" style={{ animationDelay: "150ms" }}>
          <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <User className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-base md:text-lg font-medium">Ventas por Cliente</h2>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {userStats.length === 0 ? (
                <div className="py-12 text-center">
                  <User className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" strokeWidth={1} />
                  <p className="text-sm text-muted-foreground">No hay ventas con clientes registrados</p>
                </div>
              ) : (
                userStats.map((user, index) => (
                  <div
                    key={user.name}
                    className="p-3 md:p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <h4 className="font-medium text-sm md:text-base truncate">{user.name}</h4>
                      </div>
                      <span className="text-base md:text-lg font-semibold shrink-0 ml-2">
                        ${(user.total / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{user.cantidad} compras</span>
                      <span>Promedio: ${(user.total / user.cantidad / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="animate-slide-in-up" style={{ animationDelay: "200ms" }}>
          <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <DollarSign className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-base md:text-lg font-medium">Métodos de Pago</h2>
            </div>

            <div className="space-y-4">
              {[
                { method: "efectivo", label: "Efectivo", count: salesByMethod.efectivo },
                { method: "tarjeta", label: "Tarjeta", count: salesByMethod.tarjeta },
                { method: "mp", label: "Mercado Pago", count: salesByMethod.mp },
              ].map((item) => {
                const percentage = filteredSales.length > 0 ? (item.count / filteredSales.length) * 100 : 0
                return (
                  <div key={item.method}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm md:text-base">{item.label}</span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {item.count} ventas ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Ventas Recientes por Hora */}
        <div className="animate-slide-in-up" style={{ animationDelay: "250ms" }}>
          <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Clock className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-base md:text-lg font-medium">Últimas Ventas</h2>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredSales
                .slice()
                .reverse()
                .slice(0, 8)
                .map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 md:p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {new Date(sale.date).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-base md:text-lg font-semibold">${(sale.total / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{sale.items.length} productos</span>
                      <span className="capitalize">
                        {sale.paymentMethod === "mp" ? "Mercado Pago" : sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
