import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  LayoutGrid,
  List,
  Package,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Users,
  Wallet,
  Building2,
} from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { useAuthStore } from '@shared/stores/authStore'
import { useSalesStore } from '@shared/stores/salesStore'
import { useToastStore } from '@shared/stores/toastStore'
import { type Product, getProducts, type Sale, type StockMovement, getStockMovements, patchSale } from '@shared/services/posService'

type ActiveTab = 'ventas' | 'fiados' | 'stock'
type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly'
type DisplayMode = 'cards' | 'table'

function getStartOf(date: Date, type: ViewType): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  if (type === 'daily') return d
  if (type === 'weekly') {
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    d.setDate(diff)
    return d
  }
  if (type === 'monthly') {
    d.setDate(1)
    return d
  }
  if (type === 'yearly') {
    d.setMonth(0, 1)
    return d
  }
  return d
}

function getEndOf(date: Date, type: ViewType): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  if (type === 'daily') return d
  if (type === 'weekly') {
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? 0 : 7)
    d.setDate(diff)
    return d
  }
  if (type === 'monthly') {
    d.setMonth(d.getMonth() + 1, 0)
    return d
  }
  if (type === 'yearly') {
    d.setMonth(11, 31)
    return d
  }
  return d
}

function formatDateRange(date: Date, type: ViewType): string {
  const start = getStartOf(date, type)
  const end = getEndOf(date, type)
  const locale = 'es-AR'

  if (type === 'daily') {
    return start.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  if (type === 'weekly') {
    return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  if (type === 'monthly') {
    return start.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  }
  if (type === 'yearly') {
    return start.toLocaleDateString(locale, { year: 'numeric' })
  }
  return ''
}

function OrderCard({ sale }: { sale: Sale & { status?: string } }) {
  const [expanded, setExpanded] = useState(false)
  // Default status logic if not present
  const [status, setStatus] = useState<string>(sale.status || (sale.isPending ? 'pending' : 'delivered'))
  const [loading, setLoading] = useState(false)
  const showToast = useToastStore((s) => s.showToast)
  
  const handleStatusChange = async (newStatus: string) => {
    if (loading) return
    setLoading(true)
    try {
      await patchSale(sale.id, { status: newStatus as any })
      setStatus(newStatus)
      showToast('Estado actualizado', 'success')
    } catch (error) {
      showToast('Error al actualizar estado', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      case 'preparing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'ready': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
      case 'delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'pending': return 'Pendiente'
      case 'preparing': return 'En preparación'
      case 'ready': return 'En camino'
      case 'delivered': return 'Entregado'
      default: return s
    }
  }

  const dateObj = new Date(sale.date)

  return (
    <div className={`bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] overflow-hidden transition-all duration-300 ${expanded ? 'shadow-lg ring-1 ring-[color:var(--border)]' : 'shadow-sm hover:shadow-md'}`}>
      <div 
        className="p-3 flex flex-col gap-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
             <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${getStatusColor(status)}`}>
                {status === 'delivered' ? <CheckCircle2 className="h-5 w-5" /> : 
                 status === 'ready' ? <Truck className="h-5 w-5" /> :
                 status === 'preparing' ? <Package className="h-5 w-5" /> :
                 <Clock className="h-5 w-5" />}
             </div>
             <div className="min-w-0">
                <div className="flex items-center gap-2">
                   <span className="font-bold text-sm text-[color:var(--text)] truncate">
                      #{String(sale.id).slice(-4)} • {sale.customerName || 'Cliente Ocasional'}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[color:var(--muted)] mt-0.5">
                   <Clock className="h-3 w-3" />
                   {dateObj.toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })} • {dateObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </div>
             </div>
          </div>
          
          <div className="text-right shrink-0">
             <div className="text-base font-extrabold tracking-tight text-[color:var(--text)]">
                ${(sale.totalCents / 100).toFixed(2)}
             </div>
             <div className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block border ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
             </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="h-px w-full bg-[color:var(--border)] my-2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)]">Productos</h4>
                <div className="space-y-1.5">
                   {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-1.5 rounded-[calc(var(--radius)_-_8px)] bg-[color:var(--ghost-hover-bg)]/50">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-[color:var(--text)] bg-[color:var(--card-bg)] px-1.5 py-0.5 rounded-[calc(var(--radius)_-_10px)] shadow-sm border border-[color:var(--border)]">{item.quantity}x</span>
                            <span className="text-[color:var(--text)]">{item.nombre}</span>
                         </div>
                         <span className="font-medium text-[color:var(--muted)]">${((item.priceCents * item.quantity) / 100).toFixed(2)}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <div>
                   <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] mb-2">Detalles de Entrega</h4>
                   <div className="bg-[color:var(--ghost-hover-bg)]/50 p-3 rounded-[calc(var(--radius)_-_4px)] space-y-2 text-sm">
                      <div className="flex justify-between">
                         <span className="text-[color:var(--muted)]">Método de pago</span>
                         <span className="font-bold capitalize">{sale.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-[color:var(--muted)]">Vendedor</span>
                         <span className="font-medium">{sale.userName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-[color:var(--muted)]">Estado de pago</span>
                         <span className={`font-bold ${sale.isPending ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {sale.isPending ? 'Pendiente (Fiado)' : 'Pagado'}
                         </span>
                      </div>
                   </div>
                </div>

                <div>
                   <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] mb-2">Actualizar Estado</h4>
                   <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'pending', label: 'Pendiente', icon: Clock },
                        { id: 'preparing', label: 'Preparando', icon: Package },
                        { id: 'ready', label: 'En camino', icon: Truck },
                        { id: 'delivered', label: 'Entregado', icon: CheckCircle2 }
                      ].map((s) => (
                         <button
                           key={s.id}
                           onClick={() => handleStatusChange(s.id)}
                           disabled={loading}
                           className={`flex items-center gap-1.5 px-3 py-2 rounded-[calc(var(--radius)_-_8px)] text-xs font-bold transition-all ${
                              status === s.id 
                                 ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-md ring-2 ring-offset-1 ring-[color:var(--primary-bg)]' 
                                 : 'bg-[color:var(--card-bg)] border border-[color:var(--border)] text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)]'
                           }`}
                         >
                            <s.icon className="h-3.5 w-3.5" />
                            {s.label}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>
          
          <div className="mt-4 flex justify-end">
             <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="text-xs">
                <ChevronUp className="mr-1 h-3 w-3" />
                Ocultar detalles
             </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function VentasPage() {
  const business = useAuthStore((s) => s.business)
  const activeBranchId = useAuthStore((s) => s.activeBranchId)
  const { sales, status, error, loadSales, markSalePaid } = useSalesStore()
  const showToast = useToastStore((s) => s.showToast)

  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('ventas')
  const [viewType, setViewType] = useState<ViewType>('daily')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  // const [selectedBranch, setSelectedBranch] = useState<string>('all') // Moved to global store
  const [selectedUser, setSelectedUser] = useState<string>('all')
  
  // Fiados specific
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')

  useEffect(() => {
    if (!business) return
    void loadSales(business.id)
    getProducts(business.id).then(setProducts).catch(console.error)
    getStockMovements(business.id).then(setStockMovements).catch(console.error)
  }, [business, loadSales])

  const navigateDate = (direction: -1 | 1) => {
    const newDate = new Date(currentDate)
    if (viewType === 'daily') newDate.setDate(newDate.getDate() + direction)
    if (viewType === 'weekly') newDate.setDate(newDate.getDate() + (direction * 7))
    if (viewType === 'monthly') newDate.setMonth(newDate.getMonth() + direction)
    if (viewType === 'yearly') newDate.setFullYear(newDate.getFullYear() + direction)
    setCurrentDate(newDate)
  }

  const productCostMap = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach(p => map.set(String(p.id), p.costCents || 0))
    return map
  }, [products])

  const salesParsed = useMemo(() => {
    return sales
      .filter(s => s && s.date) // Safety check
      .map((s) => ({ ...s, dateObj: new Date(s.date) }))
      .filter(s => !isNaN(s.dateObj.getTime())) // Ensure valid dates
  }, [sales])

  const filteredSales = useMemo(() => {
    const start = getStartOf(currentDate, viewType)
    const end = getEndOf(currentDate, viewType)
    
    let res = salesParsed.filter(s => s.dateObj >= start && s.dateObj <= end)

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      res = res.filter(s => 
        (s.customerName || '').toLowerCase().includes(q) || 
        s.items.some(i => i.nombre.toLowerCase().includes(q))
      )
    }

    // Filter by Branch
    if (activeBranchId !== 'all') {
      res = res.filter(s => s.branchId === activeBranchId || (!s.branchId && activeBranchId === 'main'))
    }

    // Filter by User
    if (selectedUser !== 'all') {
      res = res.filter(s => String(s.userId) === selectedUser)
    }

    return res
  }, [salesParsed, currentDate, viewType, searchQuery, activeBranchId, selectedUser])

  // Extract unique branches and users for filters
  const { uniqueBranches, uniqueUsers } = useMemo(() => {
    const branches = new Set<string>()
    const users = new Map<string, string>() // id -> name

    salesParsed.forEach(s => {
      if (s.branchId) branches.add(s.branchId)
      if (s.userId) users.set(String(s.userId), s.userName || 'Usuario')
    })

    return {
      uniqueBranches: Array.from(branches),
      uniqueUsers: Array.from(users.entries()).map(([id, name]) => ({ id, name }))
    }
  }, [salesParsed])

  // Statistics
  const stats = useMemo(() => {
    let totalRevenue = 0
    let totalCost = 0
    let totalItems = 0
    let topProductsMap = new Map<string, { name: string, qty: number, revenue: number }>()

    filteredSales.forEach(s => {
      totalRevenue += s.totalCents
      s.items.forEach(i => {
        totalItems += i.quantity
        const cost = productCostMap.get(String(i.productId)) || 0
        totalCost += cost * i.quantity
        
        const existing = topProductsMap.get(String(i.productId)) || { name: i.nombre, qty: 0, revenue: 0 }
        existing.qty += i.quantity
        existing.revenue += i.priceCents * i.quantity
        topProductsMap.set(String(i.productId), existing)
      })
    })

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    return {
      totalRevenue,
      totalCost,
      profit: totalRevenue - totalCost,
      margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      totalItems,
      topProducts,
      ticketAverage: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
    }
  }, [filteredSales, productCostMap])

  // Breakdown Statistics
  const breakdown = useMemo(() => {
    const byBranch = new Map<string, { name: string, total: number, count: number }>()
    const byUser = new Map<string, { name: string, total: number, count: number }>()

    filteredSales.forEach(s => {
      // Branch
      const bId = s.branchId || 'main'
      const bName = s.branchName || (bId === 'main' ? 'Sucursal Central' : bId)
      const bStats = byBranch.get(bId) || { name: bName, total: 0, count: 0 }
      bStats.total += s.totalCents
      bStats.count += 1
      byBranch.set(bId, bStats)

      // User
      if (s.userId) {
        const uId = String(s.userId)
        const uName = s.userName || 'Desconocido'
        const uStats = byUser.get(uId) || { name: uName, total: 0, count: 0 }
        uStats.total += s.totalCents
        uStats.count += 1
        byUser.set(uId, uStats)
      }
    })

    return {
      branches: Array.from(byBranch.values()).sort((a, b) => b.total - a.total),
      users: Array.from(byUser.values()).sort((a, b) => b.total - a.total)
    }
  }, [filteredSales])

  // Chart Data
  const chartData = useMemo(() => {
    // Determine granularity
    // Daily -> Hourly bars
    // Weekly -> Daily bars
    // Monthly -> Daily bars
    // Yearly -> Monthly bars
    
    const data: { label: string, value: number, date: Date }[] = []
    const map = new Map<string, number>()
    const start = getStartOf(currentDate, viewType)
    const end = getEndOf(currentDate, viewType)

    filteredSales.forEach(s => {
      let key = ''
      if (viewType === 'daily') {
        key = s.dateObj.getHours() + ':00'
      } else if (viewType === 'weekly' || viewType === 'monthly') {
        key = s.dateObj.getDate().toString()
      } else {
        key = s.dateObj.toLocaleString('es-AR', { month: 'short' })
      }
      map.set(key, (map.get(key) || 0) + s.totalCents)
    })

    // Fill gaps? For simplicity, we just list existing or simple iteration
    // Let's iterate to fill 0s for better charts
    if (viewType === 'daily') {
      for (let i = 8; i <= 22; i++) { // 8am to 10pm usually
        const key = i + ':00'
        data.push({ label: key, value: map.get(key) || 0, date: new Date() })
      }
    } else if (viewType === 'weekly') {
      const curr = new Date(start)
      while (curr <= end) {
        const key = curr.getDate().toString()
        const label = curr.toLocaleDateString('es-AR', { weekday: 'short' })
        data.push({ label, value: map.get(key) || 0, date: new Date(curr) })
        curr.setDate(curr.getDate() + 1)
      }
    } else if (viewType === 'monthly') {
      const curr = new Date(start)
      while (curr <= end) {
        const key = curr.getDate().toString()
        data.push({ label: key, value: map.get(key) || 0, date: new Date(curr) })
        curr.setDate(curr.getDate() + 1)
      }
    } else {
       for (let i = 0; i < 12; i++) {
         const d = new Date(currentDate.getFullYear(), i, 1)
         const key = d.toLocaleString('es-AR', { month: 'short' })
         data.push({ label: key, value: map.get(key) || 0, date: d })
       }
    }

    return data
  }, [filteredSales, viewType, currentDate])

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1)

  // Fiados Logic
  const debts = useMemo(() => {
    const pending = salesParsed.filter((s) => s.isPending)
    const byCustomer = new Map<string, Sale[]>()
    for (const sale of pending) {
      const name = sale.customerName?.trim() || 'Sin nombre'
      const current = byCustomer.get(name) ?? []
      current.push(sale)
      byCustomer.set(name, current)
    }
    return Array.from(byCustomer.entries())
      .map(([customerName, sales]) => ({
        customerName,
        sales,
        totalDebtCents: sales.reduce((sum, s) => sum + s.totalCents, 0),
      }))
      .sort((a, b) => b.totalDebtCents - a.totalDebtCents)
  }, [salesParsed])

  const filteredDebts = useMemo(() => {
    if (selectedCustomer === 'all') return debts
    return debts.filter((d) => d.customerName === selectedCustomer)
  }, [debts, selectedCustomer])

  const totalPendingDebtCents = debts.reduce((sum, d) => sum + d.totalDebtCents, 0)

  // Stock Valuation
  const stockStats = useMemo(() => {
    let totalStockValue = 0 // Cost
    let totalStockRevenue = 0 // Price
    let totalItemsInStock = 0

    const productsWithValuation = products.map(p => {
      const stock = p.stock || 0
      const cost = p.costCents || 0
      const price = p.priceCents || 0
      const valuation = stock * cost
      const potentialRevenue = stock * price
      
      totalStockValue += valuation
      totalStockRevenue += potentialRevenue
      totalItemsInStock += stock

      return {
        ...p,
        valuation,
        potentialRevenue,
        potentialProfit: potentialRevenue - valuation
      }
    })

    return {
      products: productsWithValuation,
      totalStockValue,
      totalStockRevenue,
      totalItemsInStock,
      totalPotentialProfit: totalStockRevenue - totalStockValue
    }
  }, [products])

  return (
    <div className="h-full overflow-y-auto bg-[color:var(--bg)] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-[color:var(--text)]">Balance General</h1>
           <p className="text-sm text-[color:var(--muted)]">Reporte de ingresos, stock y cuentas pendientes.</p>
        </div>
        <div className="flex bg-[color:var(--card-bg)] p-1 rounded-[calc(var(--radius)-8px)] border border-[color:var(--border)] w-full max-w-[100vw] sm:w-fit overflow-x-auto">
           <button 
             onClick={() => setActiveTab('ventas')}
             className={`px-4 py-1.5 rounded-[calc(var(--radius)-10px)] text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'ventas' ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-sm' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
           >
             Reporte Ventas
           </button>
           <button 
             onClick={() => setActiveTab('stock')}
             className={`px-4 py-1.5 rounded-[calc(var(--radius)-10px)] text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'stock' ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-sm' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
           >
             Reporte Stock
           </button>
           <button 
             onClick={() => setActiveTab('fiados')}
             className={`px-4 py-1.5 rounded-[calc(var(--radius)-10px)] text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'fiados' ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-sm' : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'}`}
           >
             Fiados
           </button>
        </div>
      </div>

      {activeTab === 'ventas' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
             <div className="flex items-center gap-2 bg-[color:var(--card-bg)] rounded-[calc(var(--radius)-8px)] border border-[color:var(--border)] p-1">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setViewType(t)}
                    className={`px-3 py-1.5 rounded-[calc(var(--radius)-10px)] text-xs font-semibold uppercase tracking-wide transition-all ${viewType === t ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]' : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)]'}`}
                  >
                    {{daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual'}[t]}
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-4 bg-[color:var(--card-bg)] px-2 py-1 rounded-[calc(var(--radius)-8px)] border border-[color:var(--border)]">
                <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-[color:var(--ghost-hover-bg)] rounded-[calc(var(--radius)-10px)] text-[color:var(--muted)] hover:text-[color:var(--text)]">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-semibold min-w-[140px] text-center capitalize tabular-nums">
                  {formatDateRange(currentDate, viewType)}
                </span>
                <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-[color:var(--ghost-hover-bg)] rounded-[calc(var(--radius)-10px)] text-[color:var(--muted)] hover:text-[color:var(--text)]">
                  <ChevronRight className="h-5 w-5" />
                </button>
             </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Total Revenue */}
             <div className="group relative overflow-hidden rounded-[--radius] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <DollarSign className="h-24 w-24 -mr-8 -mt-8 text-indigo-500" strokeWidth={1} />
                </div>
                
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                         <DollarSign className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">Ingresos</span>
                   </div>
                   
                   <div className="text-3xl font-bold tracking-tight text-[color:var(--text)] tabular-nums">
                      ${(stats.totalRevenue / 100).toFixed(2)}
                   </div>
                   
                   <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      <div className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 dark:bg-indigo-500/20">
                         <TrendingUp className="h-3.5 w-3.5" />
                         <span>{filteredSales.length} ventas</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* COGS (Expenses equivalent) */}
             <div className="group relative overflow-hidden rounded-[--radius] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Package className="h-24 w-24 -mr-8 -mt-8 text-rose-500" strokeWidth={1} />
                </div>

                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                         <TrendingDown className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">Costos</span>
                   </div>
                   
                   <div className="text-3xl font-bold tracking-tight text-[color:var(--text)] tabular-nums">
                      ${(stats.totalCost / 100).toFixed(2)}
                   </div>
                   
                   <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
                      <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 dark:bg-rose-500/20">
                         <Package className="h-3.5 w-3.5" />
                         <span>Mercadería</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Profit */}
             <div className="group relative overflow-hidden rounded-[--radius] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Wallet className="h-24 w-24 -mr-8 -mt-8 text-emerald-500" strokeWidth={1} />
                </div>

                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                         <Wallet className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">Utilidad Neta</span>
                   </div>
                   
                   <div className="text-3xl font-bold tracking-tight text-[color:var(--text)] tabular-nums">
                      ${(stats.profit / 100).toFixed(2)}
                   </div>
                   
                   <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-500/20">
                         <BarChart3 className="h-3.5 w-3.5" />
                         <span>Margen {stats.margin.toFixed(1)}%</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Pending */}
             <div className="group relative overflow-hidden rounded-[--radius] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                   <AlertCircle className="h-24 w-24 -mr-8 -mt-8 text-amber-500" strokeWidth={1} />
                </div>

                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                         <AlertCircle className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">Por Cobrar</span>
                   </div>
                   
                   <div className="text-3xl font-bold tracking-tight text-[color:var(--text)] tabular-nums">
                      ${(totalPendingDebtCents / 100).toFixed(2)}
                   </div>
                   
                   <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-500/20">
                         <User className="h-3.5 w-3.5" />
                         <span>{debts.length} clientes</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Sales Trend Chart */}
             <div className="lg:col-span-2 bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] p-6 shadow-sm">
                <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                   <div className="p-2 rounded-[calc(var(--radius)-8px)] bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)]">
                      <BarChart3 className="h-4 w-4" />
                   </div>
                   Tendencia de Ingresos
                </h3>
                <div className="h-[240px] flex items-end gap-3 w-full px-2">
                   {chartData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center gap-3 group h-full">
                         <div className="w-full relative flex-1 flex items-end">
                            <div 
                              className="w-full bg-[color:var(--primary-bg)] opacity-80 group-hover:opacity-100 rounded-t-[calc(var(--radius)-8px)] transition-all relative group-hover:scale-y-[1.05] origin-bottom min-h-[6px] shadow-[0_0_10px_rgba(0,0,0,0.05)]"
                              style={{ height: `${(d.value / maxChartValue) * 100}%` }}
                            >
                               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[color:var(--text)] text-[color:var(--bg)] text-[10px] font-bold py-1.5 px-2.5 rounded-[calc(var(--radius)-8px)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-xl transform translate-y-2 group-hover:translate-y-0">
                                  ${(d.value / 100).toFixed(0)}
                                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[color:var(--text)] rotate-45" />
                               </div>
                            </div>
                         </div>
                         <span className="text-[10px] font-medium text-[color:var(--muted)] group-hover:text-[color:var(--text)] transition-colors truncate w-full text-center">
                            {d.label}
                         </span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Top Products */}
             <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] p-6 shadow-sm">
                <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                   <div className="p-2 rounded-[calc(var(--radius)-8px)] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                   </div>
                   Más Vendidos
                </h3>
                <div className="space-y-5">
                   {stats.topProducts.map((p, i) => (
                      <div key={i} className="group">
                         <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="truncate pr-2 text-[color:var(--text)]">{p.name}</span>
                            <span className="text-[color:var(--muted)] font-mono text-xs">{p.qty} u.</span>
                         </div>
                         <div className="h-2.5 w-full bg-[color:var(--border)]/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all group-hover:brightness-110" 
                              style={{ width: `${(p.qty / (stats.topProducts[0]?.qty || 1)) * 100}%` }} 
                            />
                         </div>
                      </div>
                   ))}
                   {stats.topProducts.length === 0 && (
                      <div className="text-sm text-[color:var(--muted)] text-center py-10 flex flex-col items-center gap-2">
                         <Package className="h-8 w-8 opacity-20" />
                         No hay datos de ventas aún
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Breakdown Section */}
          {(activeBranchId === 'all' || selectedUser === 'all') && (breakdown.branches.length > 1 || breakdown.users.length > 1) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Breakdown */}
              {breakdown.branches.length > 1 && (
                <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] p-6 shadow-sm">
                   <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                      <div className="p-2 rounded-[calc(var(--radius)-8px)] bg-blue-500/10 text-blue-600 dark:text-blue-400">
                         <Building2 className="h-4 w-4" />
                      </div>
                      Ingresos por Sucursal
                   </h3>
                   <div className="space-y-4">
                      {breakdown.branches.map((b, i) => (
                         <div key={i} className="group">
                            <div className="flex justify-between text-sm font-medium mb-1">
                               <span className="text-[color:var(--text)]">{b.name}</span>
                               <span className="font-bold">${(b.total / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-[color:var(--muted)] mb-2">
                               <span>{b.count} ventas</span>
                               <span>{stats.totalRevenue > 0 ? ((b.total / stats.totalRevenue) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-[color:var(--border)]/50 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-blue-500 rounded-full" 
                                 style={{ width: `${stats.totalRevenue > 0 ? (b.total / stats.totalRevenue) * 100 : 0}%` }} 
                               />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {/* User Breakdown */}
              {breakdown.users.length > 1 && (
                <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] p-6 shadow-sm">
                   <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                      <div className="p-2 rounded-[calc(var(--radius)-8px)] bg-purple-500/10 text-purple-600 dark:text-purple-400">
                         <Users className="h-4 w-4" />
                      </div>
                      Rendimiento del Equipo
                   </h3>
                   <div className="space-y-4">
                      {breakdown.users.map((u, i) => (
                         <div key={i} className="group">
                            <div className="flex justify-between text-sm font-medium mb-1">
                               <span className="text-[color:var(--text)]">{u.name}</span>
                               <span className="font-bold">${(u.total / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-[color:var(--muted)] mb-2">
                               <span>{u.count} ventas</span>
                               <span>{stats.totalRevenue > 0 ? ((u.total / stats.totalRevenue) * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-[color:var(--border)]/50 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-purple-500 rounded-full" 
                                 style={{ width: `${stats.totalRevenue > 0 ? (u.total / stats.totalRevenue) * 100 : 0}%` }} 
                               />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Sales List */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight">Mis Pedidos</h3>
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted)]" />
                      <Input 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar..."
                        className="h-10 pl-9 w-[200px] text-sm rounded-[calc(var(--radius)-4px)] bg-[color:var(--card-bg)] border-[color:var(--border)]"
                      />
                   </div>
                </div>
             </div>

             {status === 'loading' ? (
               <div className="p-10 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--primary-bg)]" />
               </div>
             ) : filteredSales.length === 0 ? (
               <div className="text-center p-10 border border-dashed border-[color:var(--border)] rounded-[--radius] text-[color:var(--muted)]">
                 No se encontraron ventas
               </div>
             ) : displayMode === 'cards' ? (
               <div className="space-y-3">
                 {filteredSales.slice().reverse().map((sale) => (
                   <OrderCard key={sale.id} sale={sale} />
                 ))}
               </div>
             ) : (
               <div className="rounded-[--radius] border border-[color:var(--border)] overflow-x-auto">
                 <table className="w-full text-sm text-left min-w-[600px]">
                     <thead className="bg-[color:var(--ghost-hover-bg)] text-xs uppercase font-semibold text-[color:var(--muted)]">
                        <tr>
                           <th className="px-4 py-3">ID</th>
                           <th className="px-4 py-3">Cliente</th>
                           <th className="px-4 py-3">Fecha</th>
                           <th className="px-4 py-3 text-right">Total</th>
                           <th className="px-4 py-3 text-center">Estado</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[color:var(--border)]">
                        {filteredSales.slice().reverse().map(sale => (
                           <tr key={sale.id} className="hover:bg-[color:var(--ghost-hover-bg)] transition-colors">
                              <td className="px-4 py-3 font-mono text-xs">#{String(sale.id).slice(-4)}</td>
                              <td className="px-4 py-3 font-medium">{sale.customerName || 'Ocasional'}</td>
                              <td className="px-4 py-3 text-[color:var(--muted)]">
                                 {sale.dateObj.toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 text-right font-bold">
                                 ${(sale.totalCents / 100).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <span className={`inline-block px-2 py-0.5 rounded-[calc(var(--radius)-12px)] text-[10px] font-bold uppercase tracking-wider ${
                                    sale.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                    sale.status === 'ready' ? 'bg-indigo-100 text-indigo-700' :
                                    sale.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                 }`}>
                                    {sale.status === 'delivered' ? 'Entregado' : 
                                     sale.status === 'ready' ? 'En camino' :
                                     sale.status === 'preparing' ? 'Prep' :
                                     'Pend'}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Stock Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] p-6 shadow-sm">
                   <div className="text-sm font-semibold text-[color:var(--muted)] uppercase tracking-wider">Valor en Costo</div>
                   <div className="text-3xl font-bold mt-2">${(stockStats.totalStockValue / 100).toFixed(2)}</div>
                   <div className="text-xs text-[color:var(--muted)] mt-1">Capital invertido en mercadería</div>
                </div>
                <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] p-6 shadow-sm">
                   <div className="text-sm font-semibold text-[color:var(--muted)] uppercase tracking-wider">Valor en Venta</div>
                   <div className="text-3xl font-bold mt-2 text-emerald-600">${(stockStats.totalStockRevenue / 100).toFixed(2)}</div>
                   <div className="text-xs text-[color:var(--muted)] mt-1">Ingreso potencial total</div>
                </div>
                <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] p-6 shadow-sm">
                   <div className="text-sm font-semibold text-[color:var(--muted)] uppercase tracking-wider">Ganancia Potencial</div>
                   <div className="text-3xl font-bold mt-2 text-indigo-600">${(stockStats.totalPotentialProfit / 100).toFixed(2)}</div>
                   <div className="text-xs text-[color:var(--muted)] mt-1">Margen proyectado</div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Valuation Table */}
                <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] overflow-hidden shadow-sm">
                   <div className="p-4 border-b border-[color:var(--border)] bg-[color:var(--ghost-hover-bg)]/50">
                      <h3 className="font-bold">Valoración por Producto</h3>
                   </div>
                   <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                      <table className="w-full text-sm text-left min-w-[600px]">
                         <thead className="bg-[color:var(--ghost-hover-bg)] text-xs uppercase font-semibold text-[color:var(--muted)] sticky top-0">
                            <tr>
                               <th className="px-4 py-3">Producto</th>
                               <th className="px-4 py-3 text-right">Stock</th>
                               <th className="px-4 py-3 text-right">Costo Total</th>
                               <th className="px-4 py-3 text-right">Venta Total</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-[color:var(--border)]">
                            {stockStats.products
                              .sort((a, b) => b.valuation - a.valuation)
                              .map(p => (
                               <tr key={p.id} className="hover:bg-[color:var(--ghost-hover-bg)] transition-colors">
                                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                                  <td className="px-4 py-3 text-right text-[color:var(--muted)]">{p.stock}</td>
                                  <td className="px-4 py-3 text-right tabular-nums">${(p.valuation / 100).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-right tabular-nums font-semibold">${(p.potentialRevenue / 100).toFixed(2)}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Recent Movements */}
                <div className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[--radius] overflow-hidden shadow-sm">
                   <div className="p-4 border-b border-[color:var(--border)] bg-[color:var(--ghost-hover-bg)]/50">
                      <h3 className="font-bold">Movimientos de Stock Recientes</h3>
                   </div>
                   {stockMovements.length === 0 ? (
                      <div className="p-8 text-center text-[color:var(--muted)] text-sm">
                         No hay movimientos registrados
                      </div>
                   ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                           <thead className="bg-[color:var(--ghost-hover-bg)] text-xs uppercase font-semibold text-[color:var(--muted)]">
                              <tr>
                                 <th className="px-4 py-3">Fecha</th>
                                 <th className="px-4 py-3">Producto</th>
                                 <th className="px-4 py-3">Tipo</th>
                                 <th className="px-4 py-3 text-right">Cantidad</th>
                                 <th className="px-4 py-3 text-right">Costo Histórico</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-[color:var(--border)]">
                              {stockMovements.slice().reverse().map(m => (
                                 <tr key={m.id} className="hover:bg-[color:var(--ghost-hover-bg)] transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-[color:var(--muted)]">
                                       {new Date(m.date).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                       {m.productName}
                                    </td>
                                    <td className="px-4 py-3">
                                       <span className={`px-2 py-0.5 rounded-[calc(var(--radius)-12px)] text-[10px] uppercase font-bold tracking-wider ${
                                          m.type === 'entry' 
                                             ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                             : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                       }`}>
                                          {m.type === 'entry' ? 'Ingreso' : 'Ajuste'}
                                       </span>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                       {m.quantity > 0 ? '+' : ''}{m.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums text-[color:var(--muted)]">
                                       ${(m.costCents / 100).toFixed(2)}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                   )}
                </div>
             </div>
         </div>
      )}

      {activeTab === 'fiados' && (
        /* FIADOS SECTION */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Fiados Stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative overflow-hidden rounded-[--radius] border border-amber-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-amber-500/20 dark:bg-amber-950/10">
                 <div className="flex items-start justify-between">
                    <div>
                       <span className="text-xs font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70">Deuda Total</span>
                       <div className="mt-2 text-3xl font-bold tracking-tight text-amber-950 dark:text-amber-100 tabular-nums">
                          ${(totalPendingDebtCents / 100).toFixed(2)}
                       </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 group-hover:scale-110 transition-transform">
                       <AlertCircle className="h-6 w-6" strokeWidth={2} />
                    </div>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-700/80 dark:text-amber-300/80">
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 dark:bg-amber-500/20">
                       <span>Pendiente de cobro</span>
                    </div>
                 </div>
              </div>

              <div className="group relative overflow-hidden rounded-[--radius] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm transition-all hover:shadow-md">
                 <div className="flex items-start justify-between">
                    <div>
                       <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">Clientes Deudores</span>
                       <div className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--text)] tabular-nums">
                          {debts.length}
                       </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-[calc(var(--radius)-4px)] bg-[color:var(--ghost-hover-bg)] text-[color:var(--muted)] group-hover:scale-110 transition-transform">
                       <User className="h-6 w-6" strokeWidth={2} />
                    </div>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[color:var(--muted)]">
                    <div className="flex items-center gap-1 rounded-full bg-[color:var(--ghost-hover-bg)] px-2 py-0.5">
                       <span>Total registrados</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Fiados Filter */}
           {debts.length > 0 && (
             <div className="flex items-center gap-3">
               <label className="text-sm font-medium text-[color:var(--muted)]">Filtrar por cliente:</label>
               <Select 
                 value={selectedCustomer} 
                 onChange={(e) => setSelectedCustomer(e.target.value)}
                 className="w-[240px]"
               >
                 <option value="all">Todos los clientes</option>
                 {debts.map(d => (
                   <option key={d.customerName} value={d.customerName}>{d.customerName}</option>
                 ))}
               </Select>
             </div>
           )}

           {/* Fiados List */}
           {filteredDebts.length === 0 ? (
             <div className="p-12 text-center border border-dashed border-[color:var(--border)] rounded-[calc(var(--radius)-8px)] text-[color:var(--muted)] text-sm">
                No hay deudas pendientes.
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
                {filteredDebts.map(debt => (
                   <div key={debt.customerName} className="bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-[calc(var(--radius)-8px)] overflow-hidden">
                      <div className="bg-[color:var(--ghost-hover-bg)]/50 px-6 py-4 flex justify-between items-center border-b border-[color:var(--border)]">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-lg">
                               {debt.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <div className="font-bold text-lg">{debt.customerName}</div>
                               <div className="text-xs text-[color:var(--muted)]">{debt.sales.length} ventas pendientes</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-sm text-[color:var(--muted)]">Total a deber</div>
                            <div className="text-xl font-bold text-amber-600">${(debt.totalDebtCents / 100).toFixed(2)}</div>
                         </div>
                      </div>
                      <div className="divide-y divide-[color:var(--border)]">
                         {debt.sales.slice().reverse().map(sale => (
                            <div key={sale.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[color:var(--ghost-hover-bg)]/30 transition-colors">
                               <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="font-semibold text-base">${(sale.totalCents / 100).toFixed(2)}</span>
                                     <span className="text-xs text-[color:var(--muted)] px-2 py-0.5 bg-[color:var(--border)] rounded-full">
                                        {new Date(sale.date).toLocaleDateString()}
                                     </span>
                                  </div>
                                  <div className="text-sm text-[color:var(--muted)]">
                                     {sale.items.map(i => `${i.quantity}x ${i.nombre}`).join(', ')}
                                  </div>
                               </div>
                               <Button 
                                 size="sm" 
                                 variant="outline"
                                 onClick={() => markSalePaid(sale.id as number).then(() => showToast('Venta marcada como pagada', 'success'))}
                                 className="shrink-0"
                               >
                                  Marcar como Pagado
                               </Button>
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  )
}
