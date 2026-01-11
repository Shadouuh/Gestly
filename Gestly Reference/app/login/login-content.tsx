"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, register, isAuthenticated, type RegistrationData } from "@/lib/auth"
import { Eye, EyeOff, ArrowRight, CheckCircle2, Store, Users, TrendingUp, Sparkles, Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

type Tab = "login" | "register"

export default function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>("login")

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Registration state
  const [regData, setRegData] = useState<RegistrationData>({
    nombre: "",
    email: "",
    password: "",
    documento: "",
    businessNombre: "",
    businessUbicacion: "",
    businessRubro: "general",
    businessRegion: "argentina",
    tieneMultiplesSucursales: false,
    sucursales: [],
  })
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regStep, setRegStep] = useState(1)
  const [sucursales, setSucursales] = useState<Array<{ nombre: string; ubicacion: string }>>([])

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/pedidos")
    }

    // Check URL for tab parameter
    const tab = searchParams.get("tab")
    if (tab === "register") {
      setActiveTab("register")
    }
  }, [router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = login(email, password)
    if (user) {
      router.push("/pedidos")
    } else {
      setError("Credenciales inválidas")
    }
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (regStep === 1) {
      // Validar datos personales
      if (!regData.nombre || !regData.email || !regData.password || !regData.documento) {
        setError("Por favor completa todos los campos")
        return
      }
      setError("")
      setRegStep(2)
      return
    }

    if (regStep === 2) {
      // Validar datos del negocio
      if (!regData.businessNombre || !regData.businessUbicacion) {
        setError("Por favor completa todos los campos")
        return
      }

      setError("")
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Registrar usuario y negocio
      const finalRegData = {
        ...regData,
        sucursales: regData.tieneMultiplesSucursales ? sucursales : [],
      }

      const user = register(finalRegData)
      if (user) {
        router.push("/pedidos")
      } else {
        setError("Error al crear la cuenta")
      }
      setIsLoading(false)
    }
  }

  const addSucursal = () => {
    setSucursales([...sucursales, { nombre: "", ubicacion: "" }])
  }

  const removeSucursal = (index: number) => {
    setSucursales(sucursales.filter((_, i) => i !== index))
  }

  const updateSucursal = (index: number, field: "nombre" | "ubicacion", value: string) => {
    const updated = [...sucursales]
    updated[index][field] = value
    setSucursales(updated)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Section - Informative */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 to-foreground opacity-90" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-background/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-background font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-semibold">Gestly</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6 leading-tight">La forma más simple de gestionar tu negocio</h2>
            <p className="text-background/80 text-lg mb-12">
              Miles de negocios confían en Gestly para administrar sus ventas, inventario y finanzas.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Punto de venta completo</h4>
                  <p className="text-background/70 text-sm">Gestiona pedidos y ventas en tiempo real</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Reportes automáticos</h4>
                  <p className="text-background/70 text-sm">Analiza tu negocio con estadísticas claras</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Múltiples sucursales</h4>
                  <p className="text-background/70 text-sm">Administra varias ubicaciones fácilmente</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 bg-background/10 backdrop-blur-sm rounded-2xl">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm">
              <strong>Demo gratuita:</strong> Comienza a usar Gestly sin compromisos
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Login/Register Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground mb-3">
              <span className="text-background font-semibold text-xl">G</span>
            </div>
            <h1 className="text-2xl font-bold">Gestly</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-muted rounded-2xl">
            <button
              onClick={() => {
                setActiveTab("login")
                setError("")
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === "login"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => {
                setActiveTab("register")
                setError("")
                setRegStep(1)
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === "register"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Bienvenido de vuelta</h2>
                <p className="text-muted-foreground text-sm">Ingresa tus credenciales para continuar</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{error}</div>}

                <Button type="submit" disabled={isLoading} className="w-full h-11 group">
                  {isLoading ? (
                    "Iniciando sesión..."
                  ) : (
                    <>
                      Iniciar sesión
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground text-center">
                    <strong>Demo:</strong> Usa cualquier email y contraseña
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${regStep >= 1 ? "bg-foreground" : "bg-muted"}`} />
                    <div className={`w-2 h-2 rounded-full ${regStep >= 2 ? "bg-foreground" : "bg-muted"}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">Paso {regStep} de 2</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{regStep === 1 ? "Crea tu cuenta" : "Configura tu negocio"}</h2>
                <p className="text-muted-foreground text-sm">
                  {regStep === 1 ? "Comienza tu demo gratuita en minutos" : "Personaliza Gestly para tu negocio"}
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {regStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reg-nombre">Nombre completo</Label>
                      <Input
                        id="reg-nombre"
                        type="text"
                        placeholder="Juan Pérez"
                        value={regData.nombre}
                        onChange={(e) => setRegData({ ...regData, nombre: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-documento">Documento de identidad</Label>
                      <Input
                        id="reg-documento"
                        type="text"
                        placeholder="12345678"
                        value={regData.documento}
                        onChange={(e) => setRegData({ ...regData, documento: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Correo electrónico</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={regData.password}
                          onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                          required
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {regStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="business-nombre">Nombre del negocio</Label>
                      <Input
                        id="business-nombre"
                        type="text"
                        placeholder="Mi Almacén"
                        value={regData.businessNombre}
                        onChange={(e) => setRegData({ ...regData, businessNombre: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-ubicacion">Ubicación</Label>
                      <Input
                        id="business-ubicacion"
                        type="text"
                        placeholder="Calle Principal 123, Ciudad"
                        value={regData.businessUbicacion}
                        onChange={(e) => setRegData({ ...regData, businessUbicacion: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="business-rubro">Rubro</Label>
                        <Select
                          value={regData.businessRubro}
                          onValueChange={(value) => setRegData({ ...regData, businessRubro: value })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Almacén</SelectItem>
                            <SelectItem value="ropa">Ropa</SelectItem>
                            <SelectItem value="comida">Comida</SelectItem>
                            <SelectItem value="carniceria">Carnicería</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="business-region">Región</Label>
                        <Select
                          value={regData.businessRegion}
                          onValueChange={(value) => setRegData({ ...regData, businessRegion: value })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="argentina">Argentina</SelectItem>
                            <SelectItem value="mexico">México</SelectItem>
                            <SelectItem value="españa">España</SelectItem>
                            <SelectItem value="colombia">Colombia</SelectItem>
                            <SelectItem value="chile">Chile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                      <Checkbox
                        id="multiple-sucursales"
                        checked={regData.tieneMultiplesSucursales}
                        onCheckedChange={(checked) =>
                          setRegData({ ...regData, tieneMultiplesSucursales: checked as boolean })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="multiple-sucursales" className="cursor-pointer font-medium">
                          Tengo múltiples sucursales
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Gestiona varias ubicaciones y asigna usuarios a cada una
                        </p>
                      </div>
                    </div>

                    {regData.tieneMultiplesSucursales && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Sucursales</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSucursal}
                            className="h-8 text-xs bg-transparent"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Agregar
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {sucursales.map((sucursal, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Nombre sucursal"
                                value={sucursal.nombre}
                                onChange={(e) => updateSucursal(index, "nombre", e.target.value)}
                                className="h-9 text-sm"
                              />
                              <Input
                                placeholder="Ubicación"
                                value={sucursal.ubicacion}
                                onChange={(e) => updateSucursal(index, "ubicacion", e.target.value)}
                                className="h-9 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSucursal(index)}
                                className="h-9 w-9 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {error && <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{error}</div>}

                <div className="flex gap-3">
                  {regStep === 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRegStep(1)
                        setError("")
                      }}
                      className="w-full h-11"
                    >
                      Atrás
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading} className="w-full h-11 group">
                    {isLoading ? (
                      "Creando cuenta..."
                    ) : regStep === 1 ? (
                      <>
                        Continuar
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        Comenzar demo gratuita
                        <CheckCircle2 className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {regStep === 2 && (
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground text-center">
                      Al registrarte, obtendrás acceso completo a todas las funciones de Gestly
                    </p>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
