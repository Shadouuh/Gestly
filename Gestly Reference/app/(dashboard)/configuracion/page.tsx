"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Plus,
  Package,
  TrendingUp,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronRight,
  Settings,
  Store,
  Users,
  ShieldCheck,
  Globe,
  LayoutGrid,
  LayoutList,
  TableIcon,
  Eye,
  EyeOff,
  Download,
  Upload,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  type BusinessType,
  type Product,
  type StockMovement,
  type MeasurementUnit,
  type BusinessConfig,
  type Sucursal,
  type User,
  type Permission,
  type TemplateRegion,
  type ProductViewMode,
  type CustomTemplate,
  getProducts,
  saveProducts,
  getBusinessType,
  saveBusinessType,
  getStockMovements,
  saveStockMovements,
  getBusinessConfig,
  saveBusinessConfig,
  getSucursales,
  saveSucursales,
  getUsers,
  saveUsers,
  BUSINESS_TEMPLATES,
  REGIONAL_TEMPLATES,
  categoriasPorTipo,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from "@/lib/store"

export default function ConfiguracionPage() {
  const [businessType, setBusinessType] = useState<BusinessType>("general")
  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [selectedProductForStock, setSelectedProductForStock] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"productos" | "stock" | "negocio" | "usuarios" | "plantillas">("productos")

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    nombre: "Mi Negocio",
    ubicacion: "",
    tipoRubro: "general",
    tieneMultiplesSucursales: false,
    region: "argentina",
    trackStockGlobal: true,
  })
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isAddSucursalOpen, setIsAddSucursalOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  const [productViewMode, setProductViewMode] = useState<ProductViewMode>("grid")
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false)

  useEffect(() => {
    setBusinessType(getBusinessType())
    setProducts(getProducts())
    setStockMovements(getStockMovements())
    setBusinessConfig(getBusinessConfig())
    setSucursales(getSucursales())
    setUsers(getUsers())
    setCustomTemplates(getCustomTemplates())
  }, [])

  const handleBusinessTypeChange = (newType: BusinessType) => {
    setBusinessType(newType)
    saveBusinessType(newType)

    const template = BUSINESS_TEMPLATES[newType]
    setProducts(template)
    saveProducts(template)
  }

  const handleSaveBusinessConfig = () => {
    saveBusinessConfig(businessConfig)
    if (businessConfig.tipoRubro !== businessType) {
      setBusinessType(businessConfig.tipoRubro)
      saveBusinessType(businessConfig.tipoRubro)
    }
  }

  const handleLoadRegionalTemplate = (region: TemplateRegion, businessType: BusinessType) => {
    const template = REGIONAL_TEMPLATES[region][businessType]
    if (template && template.products.length > 0) {
      setProducts(template.products)
      saveProducts(template.products)
      setBusinessConfig({ ...businessConfig, region })
      saveBusinessConfig({ ...businessConfig, region })
      setIsTemplateModalOpen(false)
    }
  }

  const handleSaveCustomTemplate = (name: string) => {
    const newTemplate: CustomTemplate = {
      id: Date.now().toString(),
      name,
      businessType,
      region: businessConfig.region || "argentina",
      products,
      createdAt: new Date().toISOString(),
    }
    saveCustomTemplate(newTemplate)
    setCustomTemplates(getCustomTemplates())
    setIsSaveTemplateOpen(false)
  }

  const handleLoadCustomTemplate = (template: CustomTemplate) => {
    setProducts(template.products)
    saveProducts(template.products)
    setBusinessType(template.businessType)
    saveBusinessType(template.businessType)
    setIsTemplateModalOpen(false)
  }

  const toggleProductAvailability = (productId: string) => {
    const updatedProducts = products.map((p) => (p.id === productId ? { ...p, disponible: !p.disponible } : p))
    setProducts(updatedProducts)
    saveProducts(updatedProducts)
  }

  const toggleProductStockTracking = (productId: string) => {
    const updatedProducts = products.map((p) => (p.id === productId ? { ...p, trackStock: !p.trackStock } : p))
    setProducts(updatedProducts)
    saveProducts(updatedProducts)
  }

  const handleAddSucursal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newSucursal: Sucursal = {
      id: Date.now().toString(),
      nombre: formData.get("nombre") as string,
      ubicacion: formData.get("ubicacion") as string,
      activa: true,
    }
    const updatedSucursales = [...sucursales, newSucursal]
    setSucursales(updatedSucursales)
    saveSucursales(updatedSucursales)
    setIsAddSucursalOpen(false)
  }

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const permisos = formData.getAll("permisos") as Permission[]

    const newUser: User = {
      id: Date.now().toString(),
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      rol: formData.get("rol") as "admin" | "vendedor" | "gerente",
      sucursalId: (formData.get("sucursal") as string) || undefined,
      permisos,
      activo: true,
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    saveUsers(updatedUsers)
    setIsAddUserOpen(false)
  }

  const categorias = categoriasPorTipo[businessType]
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || p.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8 animate-slide-in-up">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Configuración</h1>
          <p className="text-muted-foreground text-sm font-light">Administra tu negocio, productos y usuarios</p>
        </div>

        <div className="mb-6 md:mb-8 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl w-fit min-w-full md:min-w-0">
            <button
              onClick={() => setActiveTab("negocio")}
              className={`px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "negocio" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Negocio</span>
            </button>
            <button
              onClick={() => setActiveTab("plantillas")}
              className={`px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "plantillas" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Plantillas</span>
            </button>
            <button
              onClick={() => setActiveTab("productos")}
              className={`px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "productos" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Productos</span>
            </button>
            <button
              onClick={() => setActiveTab("stock")}
              className={`px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "stock" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
            </button>
            <button
              onClick={() => setActiveTab("usuarios")}
              className={`px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "usuarios" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </button>
          </div>
        </div>

        {activeTab === "plantillas" && (
          <div className="space-y-6 animate-slide-in-up">
            <div className="bg-card rounded-3xl p-8 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Plantillas Regionales</h2>
                    <p className="text-sm text-muted-foreground">Elige una plantilla según tu región y rubro</p>
                  </div>
                </div>
                <Button onClick={() => setIsSaveTemplateOpen(true)} variant="outline" className="rounded-2xl">
                  <Upload className="w-4 h-4 mr-2" />
                  Guardar Plantilla Actual
                </Button>
              </div>

              {/* Plantillas Regionales */}
              <div className="space-y-4">
                {(Object.keys(REGIONAL_TEMPLATES) as TemplateRegion[]).map((region) => {
                  const template = REGIONAL_TEMPLATES[region][businessType]
                  if (!template || template.products.length === 0) return null

                  return (
                    <div
                      key={region}
                      className="p-6 rounded-2xl border border-border/50 hover:border-border transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
                            <span className="text-2xl">
                              {region === "argentina"
                                ? "🇦🇷"
                                : region === "mexico"
                                  ? "🇲🇽"
                                  : region === "españa"
                                    ? "🇪🇸"
                                    : region === "colombia"
                                      ? "🇨🇴"
                                      : "🇨🇱"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-lg capitalize">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.products.length} productos incluidos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {businessConfig.region === region && <Badge className="rounded-full">Actual</Badge>}
                          <Button
                            onClick={() => handleLoadRegionalTemplate(region, businessType)}
                            className="rounded-2xl"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Usar Esta Plantilla
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-3">Productos de muestra:</p>
                        <div className="flex flex-wrap gap-2">
                          {template.products.slice(0, 6).map((product) => (
                            <Badge key={product.id} variant="secondary" className="rounded-full text-xs">
                              {product.nombre}
                            </Badge>
                          ))}
                          {template.products.length > 6 && (
                            <Badge variant="outline" className="rounded-full text-xs">
                              +{template.products.length - 6} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Plantillas Personalizadas */}
            {customTemplates.length > 0 && (
              <div className="bg-card rounded-3xl p-8 border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Mis Plantillas</h2>
                    <p className="text-sm text-muted-foreground">Plantillas que has guardado</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {customTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-6 rounded-2xl border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {template.businessType} • {template.region}
                          </p>
                          <p className="text-xs text-muted-foreground">{template.products.length} productos</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleLoadCustomTemplate(template)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              deleteCustomTemplate(template.id)
                              setCustomTemplates(getCustomTemplates())
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dialog para guardar plantilla */}
            <Dialog open={isSaveTemplateOpen} onOpenChange={setIsSaveTemplateOpen}>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Guardar Plantilla Personalizada</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const name = formData.get("templateName") as string
                    if (name) {
                      handleSaveCustomTemplate(name)
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Nombre de la Plantilla</Label>
                    <Input
                      id="templateName"
                      name="templateName"
                      placeholder="Ej: Mi Almacén Buenos Aires"
                      required
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-2xl">
                    <p className="text-sm text-muted-foreground">
                      Se guardará una plantilla con tus {products.length} productos actuales para el rubro{" "}
                      <strong>{businessType}</strong>.
                    </p>
                  </div>
                  <Button type="submit" className="w-full rounded-2xl">
                    Guardar Plantilla
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "negocio" && (
          <div className="space-y-6 animate-slide-in-up">
            <div className="bg-card rounded-3xl p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Información del Negocio</h2>
                  <p className="text-sm text-muted-foreground">Configura los datos principales de tu negocio</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Negocio</Label>
                    <Input
                      id="nombre"
                      value={businessConfig.nombre}
                      onChange={(e) => setBusinessConfig({ ...businessConfig, nombre: e.target.value })}
                      placeholder="Ej: Almacén Don Pedro"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      value={businessConfig.ubicacion}
                      onChange={(e) => setBusinessConfig({ ...businessConfig, ubicacion: e.target.value })}
                      placeholder="Ej: Av. Corrientes 1234, CABA"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipoRubro">Tipo de Rubro</Label>
                    <Select
                      value={businessConfig.tipoRubro}
                      onValueChange={(value: BusinessType) =>
                        setBusinessConfig({ ...businessConfig, tipoRubro: value })
                      }
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Almacén General</SelectItem>
                        <SelectItem value="ropa">Tienda de Ropa</SelectItem>
                        <SelectItem value="comida">Restaurante</SelectItem>
                        <SelectItem value="carniceria">Carnicería</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Región</Label>
                    <Select
                      value={businessConfig.region}
                      onValueChange={(value: TemplateRegion) => setBusinessConfig({ ...businessConfig, region: value })}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="argentina">🇦🇷 Argentina</SelectItem>
                        <SelectItem value="mexico">🇲🇽 México</SelectItem>
                        <SelectItem value="españa">🇪🇸 España</SelectItem>
                        <SelectItem value="colombia">🇨🇴 Colombia</SelectItem>
                        <SelectItem value="chile">🇨🇱 Chile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                  <div>
                    <Label htmlFor="trackStock">Control de Stock</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Activar seguimiento de inventario en todos los productos
                    </p>
                  </div>
                  <Switch
                    id="trackStock"
                    checked={businessConfig.trackStockGlobal}
                    onCheckedChange={(checked) => setBusinessConfig({ ...businessConfig, trackStockGlobal: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                  <div>
                    <Label htmlFor="multiples">Múltiples Sucursales</Label>
                    <p className="text-xs text-muted-foreground mt-1">Habilita la gestión de stock por sucursal</p>
                  </div>
                  <Switch
                    id="multiples"
                    checked={businessConfig.tieneMultiplesSucursales}
                    onCheckedChange={(checked) =>
                      setBusinessConfig({ ...businessConfig, tieneMultiplesSucursales: checked })
                    }
                  />
                </div>

                <Button onClick={handleSaveBusinessConfig} className="rounded-2xl w-full">
                  Guardar Configuración
                </Button>
              </div>
            </div>

            {businessConfig.tieneMultiplesSucursales && (
              <div className="bg-card rounded-3xl p-8 border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium">Sucursales</h2>
                      <p className="text-sm text-muted-foreground">Gestiona las sucursales de tu negocio</p>
                    </div>
                  </div>

                  <Dialog open={isAddSucursalOpen} onOpenChange={setIsAddSucursalOpen}>
                    <DialogTrigger asChild>
                      <Button className="rounded-2xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Sucursal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nueva Sucursal</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddSucursal} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="sucNombre">Nombre</Label>
                          <Input
                            id="sucNombre"
                            name="nombre"
                            placeholder="Ej: Sucursal Centro"
                            required
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sucUbicacion">Ubicación</Label>
                          <Input
                            id="sucUbicacion"
                            name="ubicacion"
                            placeholder="Ej: Av. 9 de Julio 500"
                            required
                            className="rounded-2xl"
                          />
                        </div>
                        <Button type="submit" className="w-full rounded-2xl">
                          Agregar Sucursal
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {sucursales.map((sucursal) => (
                    <div
                      key={sucursal.id}
                      className="p-6 rounded-2xl border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{sucursal.nombre}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{sucursal.ubicacion}</p>
                        </div>
                        <Badge variant={sucursal.activa ? "default" : "secondary"} className="rounded-full">
                          {sucursal.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {sucursales.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                      No hay sucursales registradas. Agrega una nueva sucursal.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab de Productos */}
        {activeTab === "productos" && (
          <div className="space-y-6 animate-slide-in-up">
            {/* Filters & Search */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 rounded-2xl border-border/50"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] rounded-2xl border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl">
                <button
                  onClick={() => setProductViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    productViewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                  title="Vista en tarjetas"
                >
                  <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setProductViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    productViewMode === "list" ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                  title="Vista en lista"
                >
                  <LayoutList className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setProductViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${
                    productViewMode === "table" ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                  title="Vista en tabla"
                >
                  <TableIcon className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Agregar Producto</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const newProduct: Product = {
                        id: Date.now().toString(),
                        nombre: formData.get("nombre") as string,
                        categoria: formData.get("categoria") as string,
                        precioCosto: Number.parseFloat(formData.get("precioCosto") as string),
                        precioVenta: Number.parseFloat(formData.get("precioVenta") as string),
                        stock: Number.parseFloat(formData.get("stock") as string),
                        unidad: formData.get("unidad") as MeasurementUnit,
                        trackStock: formData.get("trackStock") === "on",
                        disponible: true,
                      }
                      const updatedProducts = [...products, newProduct]
                      setProducts(updatedProducts)
                      saveProducts(updatedProducts)
                      setIsAddProductOpen(false)
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="nombre">Nombre del producto</Label>
                        <Input id="nombre" name="nombre" required className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <Select name="categoria" required>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unidad">Unidad de medida</Label>
                        <Select name="unidad" defaultValue="unidad">
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unidad">Por Unidad</SelectItem>
                            <SelectItem value="gramo">Por Gramo</SelectItem>
                            <SelectItem value="kilogramo">Por Kilogramo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precioCosto">Precio de Costo</Label>
                        <Input
                          id="precioCosto"
                          name="precioCosto"
                          type="number"
                          step="0.01"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precioVenta">Precio de Venta</Label>
                        <Input
                          id="precioVenta"
                          name="precioVenta"
                          type="number"
                          step="0.01"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="stock">Stock Inicial</Label>
                        <Input id="stock" name="stock" type="number" step="0.01" required className="rounded-xl" />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="trackStock"
                            name="trackStock"
                            defaultChecked={businessConfig.trackStockGlobal}
                          />
                          <label
                            htmlFor="trackStock"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Controlar stock de este producto
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddProductOpen(false)}
                        className="rounded-xl"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="rounded-xl">
                        Agregar Producto
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {productViewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, index) => {
                  const stockStatus = product.stock <= 10 ? "critical" : product.stock <= 30 ? "low" : "good"
                  const margen = (((product.precioVenta - product.precioCosto) / product.precioCosto) * 100).toFixed(1)

                  return (
                    <Card
                      key={product.id}
                      className={`p-5 rounded-3xl border-border/50 hover:border-border hover:shadow-md transition-all duration-300 animate-fade-in ${
                        !product.disponible ? "opacity-50" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{product.categoria}</span>
                              {!product.trackStock && (
                                <Badge variant="outline" className="rounded-full text-xs">
                                  Sin stock
                                </Badge>
                              )}
                            </div>
                            <h3
                              className={`font-medium text-lg leading-tight ${!product.disponible ? "line-through" : ""}`}
                            >
                              {product.nombre}
                            </h3>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl"
                              onClick={() => toggleProductAvailability(product.id)}
                              title={product.disponible ? "Marcar no disponible" : "Marcar disponible"}
                            >
                              {product.disponible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {product.trackStock && (
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                              stockStatus === "critical"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : stockStatus === "low"
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                  : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                stockStatus === "critical"
                                  ? "bg-red-500"
                                  : stockStatus === "low"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            />
                            Stock: {product.stock} {product.unidad === "unidad" ? "unidades" : product.unidad}
                          </div>
                        )}

                        <div className="h-px bg-border/50" />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Precio Costo</p>
                            <p className="text-lg font-semibold">${product.precioCosto.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Precio Venta</p>
                            <p className="text-lg font-semibold">${product.precioVenta.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-muted-foreground">Margen:</span>
                            <span className="font-semibold text-green-600">+{margen}%</span>
                          </div>
                          {product.trackStock && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-xs h-8 bg-transparent"
                              onClick={() => {
                                setSelectedProductForStock(product.id)
                                setIsAddStockOpen(true)
                              }}
                            >
                              Añadir Stock
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {productViewMode === "list" && (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-5 rounded-2xl border border-border/50 hover:border-border hover:bg-secondary/20 transition-all ${
                      !product.disponible ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${!product.disponible ? "line-through" : ""}`}>
                              {product.nombre}
                            </h3>
                            {!product.trackStock && (
                              <Badge variant="outline" className="rounded-full text-xs">
                                Sin control de stock
                              </Badge>
                            )}
                            {!product.disponible && (
                              <Badge variant="destructive" className="rounded-full text-xs">
                                No disponible
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{product.categoria}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {product.trackStock && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Stock</p>
                            <p className="font-medium">
                              {product.stock} {product.unidad === "unidad" ? "un" : product.unidad}
                            </p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Costo</p>
                          <p className="font-medium">${product.precioCosto.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Venta</p>
                          <p className="font-medium text-lg">${product.precioVenta.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleProductAvailability(product.id)}
                          >
                            {product.disponible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {productViewMode === "table" && (
              <Card className="rounded-3xl border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Producto</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoría</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Stock</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Costo</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Venta</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Margen</th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredProducts.map((product) => {
                        const margen = (
                          ((product.precioVenta - product.precioCosto) / product.precioCosto) *
                          100
                        ).toFixed(1)
                        return (
                          <tr
                            key={product.id}
                            className={`hover:bg-secondary/20 transition-colors ${!product.disponible ? "opacity-50" : ""}`}
                          >
                            <td className="p-4">
                              <span className={!product.disponible ? "line-through" : ""}>{product.nombre}</span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{product.categoria}</td>
                            <td className="p-4 text-right font-mono text-sm">
                              {product.trackStock ? `${product.stock} ${product.unidad}` : "—"}
                            </td>
                            <td className="p-4 text-right font-mono">${product.precioCosto.toFixed(2)}</td>
                            <td className="p-4 text-right font-mono font-semibold">
                              ${product.precioVenta.toFixed(2)}
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-green-600 font-semibold">+{margen}%</span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {product.disponible ? (
                                  <Badge variant="default" className="rounded-full text-xs">
                                    Disponible
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="rounded-full text-xs">
                                    No disponible
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleProductAvailability(product.id)}
                                >
                                  {product.disponible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab de Stock */}
        {activeTab === "stock" && (
          <div className="space-y-6 animate-slide-in-up">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Historial de movimientos de stock</p>
              <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl gap-2">
                    <Plus className="w-4 h-4" />
                    Registrar Movimiento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddStock} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="producto">Producto</Label>
                        <Select name="producto" defaultValue={selectedProductForStock} required>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de movimiento</Label>
                        <Select name="tipo" defaultValue="ingreso" required>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ingreso">Ingreso (Compra)</SelectItem>
                            <SelectItem value="egreso">Egreso (Ajuste)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cantidad">Cantidad</Label>
                        <Input
                          id="cantidad"
                          name="cantidad"
                          type="number"
                          step="0.01"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precioCosto">Precio de Costo (unitario)</Label>
                        <Input
                          id="precioCosto"
                          name="precioCosto"
                          type="number"
                          step="0.01"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo</Label>
                        <Input
                          id="motivo"
                          name="motivo"
                          placeholder="Ej: Compra al proveedor X"
                          required
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddStockOpen(false)}
                        className="rounded-xl"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="rounded-xl">
                        Registrar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stock Movements Table */}
            <Card className="rounded-3xl border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Producto</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Cantidad</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Precio Costo</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {stockMovements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 text-sm">{new Date(movement.fecha).toLocaleDateString()}</td>
                        <td className="p-4 text-sm font-medium">{movement.productoNombre}</td>
                        <td className="p-4 text-sm">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              movement.tipo === "ingreso"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {movement.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-right font-mono">{movement.cantidad}</td>
                        <td className="p-4 text-sm text-right font-mono">${movement.precioCosto?.toFixed(2) || "-"}</td>
                        <td className="p-4 text-sm text-muted-foreground">{movement.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "usuarios" && (
          <div className="space-y-6 animate-slide-in-up">
            <div className="bg-card rounded-3xl p-8 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Usuarios</h2>
                    <p className="text-sm text-muted-foreground">Gestiona usuarios y sus permisos</p>
                  </div>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-2xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="userNombre">Nombre Completo</Label>
                        <Input
                          id="userNombre"
                          name="nombre"
                          placeholder="Ej: Juan Pérez"
                          required
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userEmail">Email</Label>
                        <Input
                          id="userEmail"
                          name="email"
                          type="email"
                          placeholder="Ej: juan@example.com"
                          required
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userRol">Rol</Label>
                        <Select name="rol" defaultValue="vendedor">
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="vendedor">Vendedor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {businessConfig.tieneMultiplesSucursales && sucursales.length > 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="userSucursal">Sucursal Asignada</Label>
                          <Select name="sucursal">
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                              {sucursales.map((suc) => (
                                <SelectItem key={suc.id} value={suc.id}>
                                  {suc.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Permisos de Acceso
                        </Label>
                        <div className="space-y-3 p-4 bg-secondary/30 rounded-2xl">
                          {(["pedidos", "ventas", "fiados", "estadisticas", "configuracion"] as Permission[]).map(
                            (permiso) => (
                              <div key={permiso} className="flex items-center space-x-2">
                                <Checkbox id={permiso} name="permisos" value={permiso} />
                                <label
                                  htmlFor={permiso}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                >
                                  {permiso}
                                </label>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <Button type="submit" className="w-full rounded-2xl">
                        Crear Usuario
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-6 rounded-2xl border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="rounded-full capitalize">{user.rol}</Badge>
                        {user.sucursalId && (
                          <Badge variant="outline" className="rounded-full">
                            {sucursales.find((s) => s.id === user.sucursalId)?.nombre || "Sucursal"}
                          </Badge>
                        )}
                        <Badge variant={user.activo ? "default" : "secondary"} className="rounded-full">
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-2">Permisos:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.permisos.map((permiso) => (
                          <Badge key={permiso} variant="secondary" className="rounded-full text-xs capitalize">
                            {permiso}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No hay usuarios registrados. Crea un nuevo usuario.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const handleAddProduct = (
  e: React.FormEvent<HTMLFormElement>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setIsAddProductOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  const newProduct: Product = {
    id: Date.now().toString(),
    nombre: formData.get("nombre") as string,
    categoria: formData.get("categoria") as string,
    precioCosto: Number.parseFloat(formData.get("precioCosto") as string),
    precioVenta: Number.parseFloat(formData.get("precioVenta") as string),
    stock: Number.parseFloat(formData.get("stock") as string),
    unidad: formData.get("unidad") as MeasurementUnit,
  }
  const updatedProducts = [...products, newProduct]
  setProducts(updatedProducts)
  saveProducts(updatedProducts)
  setIsAddProductOpen(false)
}

const handleAddStock = (
  e: React.FormEvent<HTMLFormElement>,
  stockMovements: StockMovement[],
  setStockMovements: React.Dispatch<React.SetStateAction<StockMovement[]>>,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setIsAddStockOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  const productId = formData.get("producto") as string
  const product = products.find((p) => p.id === productId)

  if (!product) return

  const cantidad = Number.parseFloat(formData.get("cantidad") as string)
  const precioCosto = Number.parseFloat(formData.get("precioCosto") as string)
  const tipo = formData.get("tipo") as "ingreso" | "egreso"

  const newMovement: StockMovement = {
    id: Date.now().toString(),
    productoId: product.id,
    productoNombre: product.nombre,
    tipo,
    cantidad,
    precioCosto,
    fecha: new Date().toISOString().split("T")[0],
    motivo: formData.get("motivo") as string,
  }

  const updatedMovements = [...stockMovements, newMovement]
  setStockMovements(updatedMovements)
  saveStockMovements(updatedMovements)

  const updatedProducts = products.map((p) =>
    p.id === productId ? { ...p, stock: tipo === "ingreso" ? p.stock + cantidad : p.stock - cantidad } : p,
  )
  setProducts(updatedProducts)
  saveProducts(updatedProducts)

  setIsAddStockOpen(false)
}
