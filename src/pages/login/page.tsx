import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  Store,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { Checkbox } from '@shared/components/ui/Checkbox'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Select } from '@shared/components/ui/Select'
import { useAuthStore } from '@shared/stores/authStore'
import type { RegistrationData } from '@shared/services/authService'

type Tab = 'login' | 'register'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const authStatus = useAuthStore((s) => s.status)
  const authError = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)

  const [activeTab, setActiveTab] = useState<Tab>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [regStep, setRegStep] = useState<1 | 2>(1)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [sucursales, setSucursales] = useState<Array<{ nombre: string; ubicacion: string }>>([])
  const [regData, setRegData] = useState<RegistrationData>({
    nombre: '',
    email: '',
    password: '',
    documento: '',
    businessNombre: '',
    businessUbicacion: '',
    businessRubro: 'general',
    businessRegion: 'argentina',
    tieneMultiplesSucursales: false,
    sucursales: [],
  })

  const isLoading = authStatus === 'loading'

  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate('/app/pedidos', { replace: true })
    }
  }, [authStatus, navigate])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'register') setActiveTab('register')
  }, [searchParams])

  const registerStepTitle = useMemo(() => (regStep === 1 ? 'Creá tu cuenta' : 'Configurá tu negocio'), [regStep])
  const registerStepSubtitle = useMemo(
    () => (regStep === 1 ? 'Empezá tu demo en minutos.' : 'Personalizá Gestly para tu negocio.'),
    [regStep],
  )

  async function onLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await login(email.trim(), password)
    if (ok) navigate('/app/pedidos', { replace: true })
  }

  async function onRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (regStep === 1) {
      if (!regData.nombre || !regData.email || !regData.password || !regData.documento) return
      setRegStep(2)
      return
    }

    if (!regData.businessNombre || !regData.businessUbicacion) return

    const finalData: RegistrationData = {
      ...regData,
      sucursales: regData.tieneMultiplesSucursales ? sucursales : [],
    }
    const ok = await register(finalData)
    if (ok) navigate('/app/pedidos', { replace: true })
  }

  function addSucursal() {
    setSucursales((prev) => [...prev, { nombre: '', ubicacion: '' }])
  }

  function removeSucursal(index: number) {
    setSucursales((prev) => prev.filter((_, i) => i !== index))
  }

  function updateSucursal(index: number, field: 'nombre' | 'ubicacion', value: string) {
    setSucursales((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[color:var(--app-bg)] text-[color:var(--text)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-44 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#0a84ff]/10 blur-3xl" />
        <div className="absolute -right-48 -top-28 h-[32rem] w-[32rem] rounded-full bg-[#ff2d55]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),rgba(0,0,0,0)_60%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
        <div className="w-full overflow-hidden rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)]/80 shadow-[0_28px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-2">
            <div className="relative overflow-hidden border-b border-[color:var(--border)] bg-gradient-to-br from-[color:var(--card-bg)] to-[color:var(--app-bg)] p-7 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[#0a84ff]/10 blur-3xl" />
                <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#7d5cff]/10 blur-3xl" />
                <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.10)_1px,rgba(0,0,0,0)_1px)] [background-size:22px_22px] [mask-image:radial-gradient(circle_at_46%_32%,black_0%,rgba(0,0,0,0)_72%)]" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-br from-[#0a84ff] to-[#7d5cff] p-[1px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm">
                      <span className="text-sm font-semibold">G</span>
                    </div>
                  </div>
                  <div className="text-lg font-semibold tracking-tight text-[color:var(--text)]">Gestly</div>
                </div>

                <h2 className="mt-7 text-balance text-3xl font-semibold leading-tight tracking-tight text-[color:var(--text)] sm:text-4xl">
                  Entrá y empezá a vender en segundos.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
                  Un login simple. Una interfaz clara. Todo con acento Gestly.
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    { Icon: Store, title: 'Punto de venta', subtitle: 'Rápido, sin fricción.' },
                    { Icon: TrendingUp, title: 'Reportes', subtitle: 'Claros y útiles.' },
                    { Icon: Users, title: 'Equipo', subtitle: 'Usuarios y permisos.' },
                  ].map(({ Icon, title, subtitle }) => (
                    <div
                      key={title}
                      className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)]/50 px-4 py-3 shadow-sm backdrop-blur"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-[#0a84ff]/10 text-[#0a84ff]">
                          <Icon className="h-5 w-5" strokeWidth={1.6} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold tracking-tight text-[color:var(--text)]">{title}</div>
                          <div className="text-xs tracking-tight text-[color:var(--muted)]">{subtitle}</div>
                        </div>
                      </div>
                      <div className="rounded-full bg-[color:var(--text)]/5 px-3 py-1 text-xs font-semibold tracking-tight text-[color:var(--muted)]">
                        OK
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)]/50 p-4 text-sm tracking-tight text-[color:var(--muted)] backdrop-blur">
                  <span className="font-semibold text-[color:var(--text)]">Demo:</span> {`demo@gestly.app`} / demo
                </div>
              </div>
            </div>

            <div className="p-7 sm:p-10">
              <div className="mb-8 flex gap-2 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--muted)]/10 p-1.5 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={[
                    'flex-1 rounded-[var(--radius)] px-4 py-3 text-sm font-semibold tracking-tight transition-colors',
                    activeTab === 'login'
                      ? 'bg-[color:var(--card-bg)] text-[color:var(--text)] shadow-sm'
                      : 'text-[color:var(--muted)] hover:bg-[color:var(--card-bg)]/50 hover:text-[color:var(--text)]',
                  ].join(' ')}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register')
                    setRegStep(1)
                  }}
                  className={[
                    'flex-1 rounded-[var(--radius)] px-4 py-3 text-sm font-semibold tracking-tight transition-colors',
                    activeTab === 'register'
                      ? 'bg-[color:var(--card-bg)] text-[color:var(--text)] shadow-sm'
                      : 'text-[color:var(--muted)] hover:bg-[color:var(--card-bg)]/50 hover:text-[color:var(--text)]',
                  ].join(' ')}
                >
                  Registrarse
                </button>
              </div>

              {activeTab === 'login' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Bienvenido</h2>
                    <p className="mt-2 text-sm tracking-tight text-[color:var(--muted)]">
                      Ingresá tus credenciales para continuar.
                    </p>
                  </div>

                  <form onSubmit={onLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-[var(--radius)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="rounded-[var(--radius)] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--radius)] p-1.5 text-[color:var(--muted)] hover:bg-[color:var(--text)]/5 hover:text-[color:var(--text)]"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {authError && (
                      <div className="rounded-[var(--radius)] border border-red-500/20 bg-red-500/5 p-3 text-sm tracking-tight text-red-600">
                        {authError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 w-full rounded-[var(--radius)] border-transparent bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-hover-bg)] shadow-lg hover:shadow-xl transition-all"
                    >
                      {isLoading ? (
                        'Iniciando sesión…'
                      ) : (
                        <>
                          Iniciar sesión
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'register' && (
                <div>
                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className={[
                            'h-2 w-2 rounded-full',
                            regStep >= 1 ? 'bg-[color:var(--primary-bg)]' : 'bg-[color:var(--muted)]/20',
                          ].join(' ')}
                        />
                        <div
                          className={[
                            'h-2 w-2 rounded-full',
                            regStep >= 2 ? 'bg-[color:var(--primary-bg)]' : 'bg-[color:var(--muted)]/20',
                          ].join(' ')}
                        />
                      </div>
                      <span className="text-xs tracking-tight text-[color:var(--muted)]">Paso {regStep} de 2</span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">{registerStepTitle}</h2>
                    <p className="mt-2 text-sm tracking-tight text-[color:var(--muted)]">{registerStepSubtitle}</p>
                  </div>

                  <form onSubmit={onRegisterSubmit} className="space-y-4">
                    {regStep === 1 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="reg-nombre">Nombre completo</Label>
                          <Input
                            id="reg-nombre"
                            value={regData.nombre}
                            onChange={(e) => setRegData({ ...regData, nombre: e.target.value })}
                            placeholder="Juan Pérez"
                            required
                            className="rounded-[var(--radius)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-documento">Documento</Label>
                          <Input
                            id="reg-documento"
                            value={regData.documento}
                            onChange={(e) => setRegData({ ...regData, documento: e.target.value })}
                            placeholder="12345678"
                            required
                            className="rounded-[var(--radius)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-email">Correo electrónico</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            value={regData.email}
                            onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                            placeholder="tu@email.com"
                            required
                            className="rounded-[var(--radius)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Contraseña</Label>
                          <div className="relative">
                            <Input
                              id="reg-password"
                              type={showRegPassword ? 'text' : 'password'}
                              value={regData.password}
                              onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                              placeholder="••••••••"
                              required
                              className="rounded-[var(--radius)] pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--radius)] p-1.5 text-[color:var(--muted)] hover:bg-[color:var(--text)]/5 hover:text-[color:var(--text)]"
                            >
                              {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                            value={regData.businessNombre}
                            onChange={(e) => setRegData({ ...regData, businessNombre: e.target.value })}
                            placeholder="Mi Almacén"
                            required
                            className="rounded-[var(--radius)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="business-ubicacion">Ubicación</Label>
                          <Input
                            id="business-ubicacion"
                            value={regData.businessUbicacion}
                            onChange={(e) => setRegData({ ...regData, businessUbicacion: e.target.value })}
                            placeholder="Calle Principal 123, Ciudad"
                            required
                            className="rounded-[var(--radius)]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="business-rubro">Rubro</Label>
                            <Select
                              id="business-rubro"
                              value={regData.businessRubro}
                              onChange={(e) => setRegData({ ...regData, businessRubro: e.target.value })}
                            >
                              <option value="general">Almacén</option>
                              <option value="ropa">Ropa</option>
                              <option value="comida">Comida</option>
                              <option value="carniceria">Carnicería</option>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="business-region">Región</Label>
                            <Select
                              id="business-region"
                              value={regData.businessRegion}
                              onChange={(e) => setRegData({ ...regData, businessRegion: e.target.value })}
                            >
                              <option value="argentina">Argentina</option>
                              <option value="mexico">México</option>
                              <option value="españa">España</option>
                              <option value="colombia">Colombia</option>
                              <option value="chile">Chile</option>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)]/50 p-4 backdrop-blur">
                          <Checkbox
                            checked={regData.tieneMultiplesSucursales}
                            onChange={(e) =>
                              setRegData({ ...regData, tieneMultiplesSucursales: e.target.checked })
                            }
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium tracking-tight">Tengo múltiples sucursales</div>
                            <div className="mt-1 text-xs tracking-tight text-[color:var(--muted)]">
                              Gestioná varias ubicaciones y asigná usuarios.
                            </div>
                          </div>
                        </div>

                        {regData.tieneMultiplesSucursales && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium tracking-tight">Sucursales</div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSucursal}
                                className="h-9 rounded-[var(--radius)]"
                              >
                                <Plus className="mr-1 h-4 w-4" />
                                Agregar
                              </Button>
                            </div>

                            <div className="max-h-48 space-y-2 overflow-y-auto">
                              {sucursales.map((s, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={s.nombre}
                                    onChange={(e) => updateSucursal(index, 'nombre', e.target.value)}
                                    placeholder="Nombre"
                                    className="h-10 rounded-[var(--radius)]"
                                  />
                                  <Input
                                    value={s.ubicacion}
                                    onChange={(e) => updateSucursal(index, 'ubicacion', e.target.value)}
                                    placeholder="Ubicación"
                                    className="h-10 rounded-[var(--radius)]"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 rounded-[var(--radius)] px-0"
                                    onClick={() => removeSucursal(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {authError && (
                      <div className="rounded-[var(--radius)] border border-red-500/20 bg-red-500/5 p-3 text-sm tracking-tight text-red-600">
                        {authError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      {regStep === 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 w-full rounded-[var(--radius)]"
                          onClick={() => setRegStep(1)}
                        >
                          Atrás
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-12 w-full rounded-[var(--radius)] border-transparent bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-hover-bg)] shadow-lg hover:shadow-xl transition-all"
                      >
                        {isLoading ? (
                          'Creando cuenta…'
                        ) : regStep === 1 ? (
                          <>
                            Continuar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Comenzar demo
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
