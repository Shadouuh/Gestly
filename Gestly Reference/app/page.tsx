import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Store,
  Mic,
  Camera,
  TrendingUp,
  Package,
  CreditCard,
  BarChart3,
  Zap,
  Users,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
              <span className="text-background font-bold text-lg">G</span>
            </div>
            <span className="font-semibold text-xl">Gestly</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#que-es" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Qué es
            </Link>
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Características
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Precios
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/login?tab=register">
              <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                Comenzar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-foreground/5 rounded-full text-sm font-medium">
                Dejá de anotar, usá Gestly
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
                Gestioná tu negocio sin complicaciones
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-xl">
                La forma más simple de llevar tu kiosco, almacén o negocio. Todo lo que necesitás en una sola app:
                ventas, stock, fiados y más.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login?tab=register">
                  <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group h-12 px-6">
                    Empezar gratis
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#que-es">
                  <Button size="lg" variant="outline" className="h-12 px-6 bg-transparent">
                    Ver cómo funciona
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <span>Sin tarjeta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <span>Demo gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <span>Soporte 24/7</span>
                </div>
              </div>
            </div>

            {/* Right - App Preview */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-md mx-auto">
                {/* Mobile mockup */}
                <div className="relative z-10 bg-background border-8 border-foreground rounded-[3rem] shadow-2xl overflow-hidden aspect-[9/19]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-foreground rounded-b-3xl"></div>
                  <div className="p-6 pt-10 h-full overflow-hidden">
                    {/* App interface preview */}
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Ventas de hoy</div>
                          <div className="text-3xl font-bold">$47,230</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Productos vendidos</div>
                          <div className="text-3xl font-bold">156</div>
                        </div>
                      </div>

                      {/* Chart placeholder */}
                      <div className="bg-muted/50 rounded-2xl p-4 h-40 flex items-end justify-between gap-2">
                        <div className="bg-foreground/20 rounded-lg w-full h-[45%]"></div>
                        <div className="bg-foreground/30 rounded-lg w-full h-[60%]"></div>
                        <div className="bg-foreground/40 rounded-lg w-full h-[75%]"></div>
                        <div className="bg-foreground rounded-lg w-full h-[90%]"></div>
                        <div className="bg-foreground/60 rounded-lg w-full h-[70%]"></div>
                      </div>

                      {/* Recent sales */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Últimas ventas</div>
                        {[
                          { name: "Coca Cola 2.25L", amount: "$1,500" },
                          { name: "Pan lactal", amount: "$850" },
                          { name: "Cigarrillos Marlboro", amount: "$2,100" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                                <Package className="h-5 w-5" />
                              </div>
                              <div className="text-sm font-medium">{item.name}</div>
                            </div>
                            <div className="font-semibold">{item.amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop preview in background */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[140%] opacity-40 blur-sm pointer-events-none hidden lg:block">
                  <div className="bg-background border border-border rounded-2xl shadow-2xl p-4 aspect-video">
                    <div className="flex gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 h-[calc(100%-2rem)]">
                      <div className="bg-muted rounded-lg"></div>
                      <div className="col-span-3 bg-muted/50 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Gestly */}
      <section id="que-es" className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">¿Qué es Gestly?</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Tu aliado para gestionar todo tu negocio de forma simple y sin vueltas. Desde la venta hasta el control
              del stock, todo en un solo lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-8 rounded-3xl border border-border bg-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Venta en segundos</h3>
              <p className="text-muted-foreground">
                Cargás el pedido, tocás y listo. Nada de papeles ni complicaciones.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Stock controlado</h3>
              <p className="text-muted-foreground">Sabés exactamente qué tenés y qué te falta. Sin sorpresas.</p>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rentabilidad clara</h3>
              <p className="text-muted-foreground">Mirás y sabés cuánto vendiste, cuánto ganaste. Todo claro.</p>
            </div>
          </div>

          {/* How it works */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">Cómo funciona</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Configurás tu negocio</h4>
                  <p className="text-muted-foreground">
                    Elegís tu rubro (almacén, kiosco, etc.), ponés tus productos y estás listo. Toma 5 minutos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Empezás a vender</h4>
                  <p className="text-muted-foreground">
                    Seleccionás productos, agregás al carrito y cobrás. Así de simple, sin complicaciones.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Controlás el stock</h4>
                  <p className="text-muted-foreground">
                    El sistema te avisa cuando se te termina algo. Podés recargar manualmente o con IA.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Mirás tus números</h4>
                  <p className="text-muted-foreground">
                    Ves cuánto vendiste hoy, esta semana o este mes. Todo en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features - Pro Plan Highlight */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium mb-4">
              Funciones con IA - Plan Pro
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Potenciá tu negocio con IA</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Automatizá tareas y ahorrá tiempo con nuestras funciones inteligentes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="relative p-8 rounded-3xl border-2 border-purple-500/20 bg-card overflow-hidden group hover:border-purple-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Mic className="h-7 w-7 text-purple-600" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-bold">Fast Checkout</h3>
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-muted-foreground mb-6">
                  La IA escucha lo que dice el cliente y va anotando los productos automáticamente. Vos solo confirmás y
                  cobrás.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span>Reconocimiento de voz en español</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span>Detección automática de productos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span>Velocidad 3x más rápida</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative p-8 rounded-3xl border-2 border-blue-500/20 bg-card overflow-hidden group hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Camera className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-bold">Restock Plus</h3>
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-muted-foreground mb-6">
                  Sacás una foto de la factura de tu proveedor y la IA carga todos los productos con el stock
                  automáticamente.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>OCR avanzado para facturas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>Actualización automática de stock</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>Ahorrá horas de carga manual</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Todo lo que necesitás</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todas las herramientas para llevar tu negocio al siguiente nivel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Punto de Venta</h3>
              <p className="text-muted-foreground text-sm">
                Sistema rápido e intuitivo. Vendé en segundos sin complicaciones.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Control de Stock</h3>
              <p className="text-muted-foreground text-sm">
                Sabé exactamente qué tenés. Alertas cuando algo se termina.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestión de Fiados</h3>
              <p className="text-muted-foreground text-sm">
                Llevá el control de las cuentas de tus clientes de confianza.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reportes Claros</h3>
              <p className="text-muted-foreground text-sm">Visualizá tus ventas y productos top en tiempo real.</p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Múltiples Sucursales</h3>
              <p className="text-muted-foreground text-sm">
                Gestioná varios locales desde un solo lugar. Asigná usuarios.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Plantillas Regionales</h3>
              <p className="text-muted-foreground text-sm">Configuración rápida con productos típicos de tu región.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Elegí tu plan</h2>
            <p className="text-lg text-muted-foreground">Empezá gratis y crecé cuando estés listo</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl border-2 border-border bg-background">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm">Para probar y arrancar</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </div>
              <Link href="/login?tab=register" className="block mb-6">
                <Button variant="outline" className="w-full h-11 bg-transparent">
                  Empezar gratis
                </Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Hasta 100 ventas/mes</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">50 productos</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 usuario</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Reportes básicos</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Soporte por email</span>
                </div>
              </div>
            </div>

            {/* Basic Plan */}
            <div className="p-8 rounded-3xl border-2 border-border bg-background">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <p className="text-muted-foreground text-sm">Para negocios en crecimiento</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$5</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </div>
              <Link href="/login?tab=register" className="block mb-6">
                <Button className="w-full h-11 bg-foreground text-background hover:bg-foreground/90">
                  Comenzar ahora
                </Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Ventas ilimitadas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Productos ilimitados</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Hasta 3 usuarios</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Reportes avanzados</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Gestión de fiados</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Hasta 2 sucursales</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Soporte prioritario</span>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative p-8 rounded-3xl border-2 border-purple-500 bg-background shadow-lg shadow-purple-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
                Más popular
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-muted-foreground text-sm">Para negocios profesionales</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$15</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </div>
              <Link href="/login?tab=register" className="block mb-6">
                <Button className="w-full h-11 bg-purple-600 text-white hover:bg-purple-700">Activar Pro</Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Todo lo de Basic +</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Usuarios ilimitados</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Sucursales ilimitadas</span>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Fast Checkout con IA</span>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Restock Plus con IA</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">API access</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Soporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">¿Listo para simplificar tu negocio?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Unite a los miles de negocios que ya confían en Gestly. Empezá gratis y crecé cuando quieras.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login?tab=register">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 group h-12 px-8">
                  Probar gratis
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Sin tarjeta de crédito • Sin compromiso • Cancelás cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                  <span className="text-background font-bold text-lg">G</span>
                </div>
                <span className="font-semibold text-xl">Gestly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La forma más simple de gestionar tu negocio. Todo en un solo lugar.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/login?tab=register" className="hover:text-foreground transition-colors">
                    Demo gratuita
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Actualizaciones
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Trabaja con nosotros
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Gestly. Todos los derechos reservados. Hecho con ❤️ en Argentina.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Instagram
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Facebook
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
