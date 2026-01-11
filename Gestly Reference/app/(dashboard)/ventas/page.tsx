"use client"

import { useEffect, useState } from "react"
import {
  Receipt,
  Calendar,
  DollarSign,
  CreditCard,
  Filter,
  Search,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Sale } from "@/app/(dashboard)/pedidos/page"

type CustomerDebt = {
  customerName: string
  sales: Sale[]
  totalDebt: number
}

export default function VentasPage() {
  const [activeTab, setActiveTab] = useState<"ventas" | "fiados">("ventas")
  const [sales, setSales] = useState<Sale[]>([])
  const [debts, setDebts] = useState<CustomerDebt[]>([])
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [filterMethod, setFilterMethod] = useState<"all" | "efectivo" | "tarjeta" | "mp">("all")
  const [filterPeriod, setFilterPeriod] = useState<"all" | "today" | "week" | "month">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "pagado" | "fiado">("all")
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all")

  const loadSales = () => {
    const storedSales = JSON.parse(localStorage.getItem("gestly-sales") || "[]")
    setSales(
      storedSales.map((sale: Sale) => ({
        ...sale,
        date: new Date(sale.date),
      })),
    )
  }

  const loadDebts = () => {
    const storedSales = JSON.parse(localStorage.getItem("gestly-sales") || "[]")
    const pendingSales = storedSales.filter((sale: Sale) => sale.isPending)

    const debtsByCustomer = pendingSales.reduce((acc: { [key: string]: Sale[] }, sale: Sale) => {
      const customer = sale.customerName || "Sin nombre"
      if (!acc[customer]) {
        acc[customer] = []
      }
      acc[customer].push({
        ...sale,
        date: new Date(sale.date),
      })
      return acc
    }, {})

    const debtsArray: CustomerDebt[] = Object.entries(debtsByCustomer).map(([customerName, sales]) => ({
      customerName,
      sales: sales as Sale[],
      totalDebt: (sales as Sale[]).reduce((sum, sale) => sum + sale.total, 0),
    }))

    setDebts(debtsArray.sort((a, b) => b.totalDebt - a.totalDebt))
  }

  useEffect(() => {
    loadSales()
    loadDebts()
  }, [])

  const markAsPaid = (customerName: string, saleId: string) => {
    const storedSales = JSON.parse(localStorage.getItem("gestly-sales") || "[]")
    const updatedSales = storedSales.map((sale: Sale) => (sale.id === saleId ? { ...sale, isPending: false } : sale))
    localStorage.setItem("gestly-sales", JSON.stringify(updatedSales))
    loadSales()
    loadDebts()
  }

  const getFilteredSales = () => {
    let filtered = sales

    if (filterMethod !== "all") {
      filtered = filtered.filter((sale) => sale.paymentMethod === filterMethod)
    }

    if (filterType === "pagado") {
      filtered = filtered.filter((sale) => !sale.isPending)
    } else if (filterType === "fiado") {
      filtered = filtered.filter((sale) => sale.isPending)
    }

    const now = new Date()
    if (filterPeriod === "today") {
      filtered = filtered.filter((sale) => new Date(sale.date).toDateString() === now.toDateString())
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((sale) => new Date(sale.date) >= weekAgo)
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((sale) => new Date(sale.date) >= monthAgo)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (sale) =>
          sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sale.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    return filtered
  }

  const filteredSales = getFilteredSales()
  const filteredDebts = selectedCustomer === "all" ? debts : debts.filter((d) => d.customerName === selectedCustomer)

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const todaySales = filteredSales.filter((sale) => {
    const today = new Date()
    const saleDate = new Date(sale.date)
    return saleDate.toDateString() === today.toDateString()
  })
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const totalPendingDebt = filteredDebts.reduce((sum, debt) => sum + debt.totalDebt, 0)
  const customerList = ["all", ...debts.map((d) => d.customerName)]

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="mb-6 md:mb-8 animate-slide-in-up">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Ventas</h1>
        <p className="text-muted-foreground text-sm font-light">Historial de transacciones y cuentas pendientes</p>
      </div>

      <div className="mb-6 md:mb-8 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl w-fit min-w-full md:min-w-0">
          <button
            onClick={() => setActiveTab("ventas")}
            className={`px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ventas" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Ventas
          </button>
          <button
            onClick={() => setActiveTab("fiados")}
            className={`px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "fiados" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Fiados
          </button>
        </div>
      </div>

      {/* Ventas Tab */}
      {activeTab === "ventas" && (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8 animate-slide-in-up"
            style={{ animationDelay: "50ms" }}
          >
            <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-secondary flex items-center justify-center">
                  <Receipt className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Ventas</span>
              </div>
              <p className="text-2xl md:text-3xl font-light">{filteredSales.length}</p>
            </div>

            <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-secondary flex items-center justify-center">
                  <Calendar className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hoy</span>
              </div>
              <p className="text-2xl md:text-3xl font-light">${(todayTotal / 100).toFixed(2)}</p>
            </div>

            <div className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-secondary flex items-center justify-center">
                  <DollarSign className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Recaudado
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-light">${(totalSales / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                type="text"
                placeholder="Buscar por cliente o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-border/50 bg-secondary/30"
              />
            </div>

            <div className="flex items-start gap-4 flex-col md:flex-row md:items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
              </div>

              <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-4 pb-2 md:pb-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <div className="flex gap-2">
                      {[
                        { value: "all", label: "Todo" },
                        { value: "today", label: "Hoy" },
                        { value: "week", label: "Semana" },
                        { value: "month", label: "Mes" },
                      ].map((period) => (
                        <Button
                          key={period.value}
                          onClick={() => setFilterPeriod(period.value as any)}
                          variant="outline"
                          size="sm"
                          className={`rounded-xl ${
                            filterPeriod === period.value
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent"
                          }`}
                        >
                          {period.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-border shrink-0" />

                  <div className="flex items-center gap-2 shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <div className="flex gap-2">
                      {[
                        { value: "all", label: "Todos" },
                        { value: "pagado", label: "Pagados" },
                        { value: "fiado", label: "Fiados" },
                      ].map((type) => (
                        <Button
                          key={type.value}
                          onClick={() => setFilterType(type.value as any)}
                          variant="outline"
                          size="sm"
                          className={`rounded-xl ${
                            filterType === type.value
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent"
                          }`}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-border shrink-0" />

                  <div className="flex items-center gap-2 shrink-0">
                    <CreditCard className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <div className="flex gap-2">
                      {[
                        { value: "all", label: "Todos" },
                        { value: "efectivo", label: "Efectivo" },
                        { value: "tarjeta", label: "Tarjeta" },
                        { value: "mp", label: "MP" },
                      ].map((method) => (
                        <Button
                          key={method.value}
                          onClick={() => setFilterMethod(method.value as any)}
                          variant="outline"
                          size="sm"
                          className={`rounded-xl capitalize ${
                            filterMethod === method.value
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent"
                          }`}
                        >
                          {method.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-slide-in-up" style={{ animationDelay: "150ms" }}>
            {filteredSales.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" strokeWidth={1} />
                <p className="text-sm text-muted-foreground font-light">No hay ventas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSales
                  .slice()
                  .reverse()
                  .map((sale, index) => (
                    <div
                      key={sale.id}
                      className="p-5 md:p-6 rounded-2xl border border-border/50 bg-card hover:bg-secondary/50 hover:shadow-lg transition-all animate-slide-in-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-3 md:gap-0">
                        <div>
                          <p className="font-medium text-base md:text-lg mb-1">
                            {sale.isPending ? `Fiado - ${sale.customerName}` : "Venta"}
                          </p>
                          <p className="text-sm text-muted-foreground font-light">
                            {new Date(sale.date).toLocaleString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-left md:text-right w-full md:w-auto">
                          <p className="text-2xl md:text-3xl font-light mb-1">${(sale.total / 100).toFixed(2)}</p>
                          <div className="flex items-center gap-1.5 text-muted-foreground md:justify-end">
                            <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-xs capitalize font-medium">
                              {sale.paymentMethod === "mp" ? "Mercado Pago" : sale.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-border/30">
                        {sale.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-light">
                              <span className="text-foreground font-medium">{item.quantity}x</span> {item.name}
                            </span>
                            <span className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Fiados Tab */}
      {activeTab === "fiados" && (
        <>
          <div className="mb-6 md:mb-8 animate-slide-in-up" style={{ animationDelay: "50ms" }}>
            <div className="p-5 md:p-7 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Total Pendiente
                    </p>
                    <p className="text-3xl md:text-4xl font-light tracking-tight">
                      ${(totalPendingDebt / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right w-full md:w-auto">
                  <p className="text-muted-foreground text-sm font-light mb-1">
                    {filteredDebts.length} {filteredDebts.length === 1 ? "cliente" : "clientes"}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {filteredDebts.reduce((sum, d) => sum + d.sales.length, 0)} ventas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {debts.length > 0 && (
            <div
              className="mb-6 animate-slide-in-up overflow-x-auto scrollbar-hide"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center gap-3 min-w-max pb-2 md:pb-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                  <Filter className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-medium">Cliente:</span>
                </div>
                <div className="flex gap-2">
                  {customerList.map((customer) => (
                    <Button
                      key={customer}
                      onClick={() => setSelectedCustomer(customer)}
                      variant="outline"
                      size="sm"
                      className={`rounded-xl ${
                        selectedCustomer === customer
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent"
                      }`}
                    >
                      {customer === "all" ? "Todos" : customer}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {filteredDebts.length === 0 ? (
            <div className="py-16 text-center animate-slide-in-up" style={{ animationDelay: "150ms" }}>
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" strokeWidth={1} />
              <p className="text-sm text-muted-foreground font-light">
                {selectedCustomer === "all" ? "No hay cuentas pendientes" : "Este cliente no tiene cuentas pendientes"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: "150ms" }}>
              {filteredDebts.map((debt, debtIndex) => (
                <div
                  key={debt.customerName}
                  className="p-5 md:p-7 rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all animate-slide-in-up"
                  style={{ animationDelay: `${debtIndex * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-5 pb-5 border-b border-border/30 flex-col md:flex-row gap-4 md:gap-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg md:text-xl mb-1">{debt.customerName}</h3>
                        <p className="text-sm text-muted-foreground font-light">
                          {debt.sales.length} {debt.sales.length === 1 ? "venta" : "ventas"} pendiente
                          {debt.sales.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Debe</p>
                      <p className="text-2xl md:text-3xl font-light tracking-tight">
                        ${(debt.totalDebt / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {debt.sales.map((sale) => (
                      <div key={sale.id} className="p-4 md:p-5 rounded-xl bg-secondary/30 border border-border/30">
                        <div className="flex items-center justify-between mb-3 flex-col md:flex-row gap-3 md:gap-0">
                          <div>
                            <p className="text-sm font-medium mb-1.5">
                              {new Date(sale.date).toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CreditCard className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span className="text-xs capitalize">
                                {sale.paymentMethod === "mp" ? "Mercado Pago" : sale.paymentMethod}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <p className="text-xl md:text-2xl font-light flex-1 md:flex-none">
                              ${(sale.total / 100).toFixed(2)}
                            </p>
                            <Button
                              onClick={() => markAsPaid(debt.customerName, sale.id)}
                              size="sm"
                              className="rounded-xl h-10 px-4 text-xs font-medium shadow-sm flex-1 md:flex-none"
                            >
                              Marcar Pagado
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-border/20">
                          {sale.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-light">
                                <span className="text-foreground font-medium">{item.quantity}x</span> {item.name}
                              </span>
                              <span className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
