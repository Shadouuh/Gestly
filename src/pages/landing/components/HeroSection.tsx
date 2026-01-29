import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Monitor, ShieldCheck, Smartphone, Sparkles, TrendingUp, Users } from 'lucide-react'

import type { LandingData } from '@shared/services/landingService'
import { Container } from '@shared/components/ui/Container'

type HeroSectionProps = {
  data: LandingData
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function HeroSection({ data }: HeroSectionProps) {
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'pedidos' | 'ventas'>('dashboard')

  const chipStats = useMemo(() => {
    const items = data.recentSales.slice(0, 3)
    return items.map((i) => ({ ...i, amountLabel: formatCurrency(i.amount) }))
  }, [data.recentSales])

  const sections = useMemo(
    () =>
      [
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'pedidos', label: 'Pedidos' },
        { value: 'ventas', label: 'Ventas' },
      ] as const,
    [],
  )

  const avatars = useMemo(
    () => [
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Gestly&backgroundType=gradientLinear&radius=50',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundType=gradientLinear&radius=50',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Rafa&backgroundType=gradientLinear&radius=50',
    ],
    [],
  )

  return (
    <section className="bg-[color:var(--app-bg)] pb-14 pt-7 md:pb-20 md:pt-10">
      <Container>
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*2)] border border-black/10 bg-gradient-to-b from-white to-[#f4f7ff] px-5 py-10 text-black shadow-[0_30px_80px_rgba(0,0,0,0.10)] sm:px-6 sm:py-12 md:px-10 md:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-28 h-80 w-80 rounded-full bg-[#0a84ff]/15 blur-3xl" />
            <div className="absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-[#ff2d55]/12 blur-3xl" />
            <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[#ffd60a]/12 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),rgba(0,0,0,0)_60%)]" />
            <div className="hero-relief" />
          </div>

          <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="animate-slide-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-sm tracking-tight text-black/70 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#0a84ff]" strokeWidth={1.6} />
                <span>{data.heroBadge}</span>
              </div>

              <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-black md:text-6xl">
                {data.heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-[color:var(--muted)] md:text-xl">
                {data.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-black px-6 text-[15px] font-semibold tracking-tight text-white hover:bg-black/90"
                >
                  Probar gratis
                </Link>
                <a
                  href="#que-es"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/15 bg-white/70 px-6 text-[15px] font-medium tracking-tight text-black/80 backdrop-blur hover:bg-white"
                >
                  Ver cómo funciona
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: TrendingUp, title: 'Más control', subtitle: 'Ventas y reportes al día.' },
                  { icon: Users, title: 'Para tu equipo', subtitle: 'Usuarios y permisos simples.' },
                  { icon: ShieldCheck, title: 'Confiable', subtitle: 'Datos claros y ordenados.' },
                ].map((c) => (
                  <div key={c.title} className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0a84ff]/10 text-[#0a84ff]">
                        <c.icon className="h-5 w-5" strokeWidth={1.6} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold tracking-tight">{c.title}</div>
                        <div className="truncate text-xs tracking-tight text-[color:var(--muted)]">{c.subtitle}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-black/70">
                {data.highlights.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#0a84ff]" />
                    <span className="tracking-tight">{t}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex rounded-full border border-black/10 bg-white/70 p-1 backdrop-blur">
                    {sections.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setActiveScreen(t.value)}
                        className={[
                          'h-10 rounded-full px-4 text-sm font-medium tracking-tight transition-colors',
                          activeScreen === t.value
                            ? 'bg-[#0a84ff] text-white'
                            : 'text-black/70 hover:bg-black/5 hover:text-black',
                        ].join(' ')}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs tracking-tight text-[color:var(--muted)]">
                    Tocá las pestañas para ver distintas vistas.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {avatars.map((src, idx) => (
                      <img
                        key={src}
                        src={src}
                        alt={`Persona ${idx + 1}`}
                        className="h-10 w-10 rounded-full border-2 border-white bg-white shadow-sm"
                        loading="lazy"
                      />
                    ))}
                  </div>
                  <div className="text-sm tracking-tight text-black/70">
                    +{data.stats.activeBusinesses} comercios
                  </div>
                </div>
              </div>

            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[760px]">
                <div className="animate-float-tilt-slow relative z-10 rounded-[calc(var(--radius)*2)] bg-[#0b0b0d] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                  <div className="overflow-hidden rounded-[calc(var(--radius)*1.8)] bg-white">
                    <div className="flex items-center justify-between border-b border-black/10 bg-[#f7f7fb] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius)_-_4px)] bg-[#0a84ff]/10 text-[#0a84ff]">
                          <Monitor className="h-5 w-5" strokeWidth={1.6} />
                        </div>
                        <div className="text-sm font-semibold tracking-tight text-black">Gestly</div>
                        <div className="hidden text-xs tracking-tight text-[color:var(--muted)] md:block">Vista web</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#ff453a]" />
                        <div className="h-2 w-2 rounded-full bg-[#ffd60a]" />
                        <div className="h-2 w-2 rounded-full bg-[#30d158]" />
                      </div>
                    </div>

                    <div className="grid min-h-[320px] grid-cols-[180px_1fr] bg-white sm:min-h-[360px] md:min-h-[440px] md:grid-cols-[220px_1fr]">
                      <div className="border-r border-black/10 bg-[#fbfbfe] p-3 sm:p-4">
                        <div className="mb-4 text-xs font-semibold tracking-tight text-[color:var(--muted)]">Secciones</div>
                        <div className="space-y-2">
                          {sections.map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setActiveScreen(item.value)}
                              className={[
                                'flex h-11 w-full items-center justify-between rounded-2xl px-3 text-left text-sm tracking-tight transition-colors sm:px-4',
                                activeScreen === item.value
                                  ? 'bg-[#0a84ff] text-white'
                                  : 'bg-black/5 text-black/70 hover:bg-black/10 hover:text-black',
                              ].join(' ')}
                            >
                              <span>{item.label}</span>
                              <span className="text-xs opacity-60">↵</span>
                            </button>
                          ))}
                        </div>

                        <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
                          <div className="text-xs font-semibold tracking-tight text-[color:var(--muted)]">Hoy</div>
                          <div className="mt-2 text-xl font-semibold tracking-tight text-black">
                            {formatCurrency(data.stats.todaySales)}
                          </div>
                          <div className="mt-1 text-xs tracking-tight text-[color:var(--muted)]">
                            {data.stats.soldItems} productos
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 md:p-6">
                        {activeScreen === 'dashboard' && (
                          <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                              {[
                                { label: 'Ventas', value: formatCurrency(data.stats.todaySales) },
                                { label: 'Productos', value: String(data.stats.soldItems) },
                                { label: 'Negocios', value: String(data.stats.activeBusinesses) },
                              ].map((c) => (
                                <div key={c.label} className="rounded-2xl border border-black/10 bg-[#fbfbfe] p-4">
                                  <div className="text-xs font-semibold tracking-tight text-[color:var(--muted)]">
                                    {c.label}
                                  </div>
                                  <div className="mt-2 text-2xl font-semibold tracking-tight text-black">{c.value}</div>
                                </div>
                              ))}
                            </div>

                            <div className="rounded-2xl border border-black/10 bg-[#fbfbfe] p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <div className="text-sm font-semibold tracking-tight text-black">Actividad</div>
                                <div className="text-xs tracking-tight text-[color:var(--muted)]">Últimos 7 días</div>
                              </div>
                              <div className="flex h-28 items-end gap-2">
                                {[32, 54, 38, 70, 56, 62, 46].map((h, idx) => (
                                  <div
                                    key={idx}
                                    className="w-full rounded-lg bg-[#0a84ff]/20"
                                    style={{ height: `${h}%` }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-black/10 bg-[#fbfbfe] p-4">
                              <div className="mb-3 text-sm font-semibold tracking-tight text-black">Últimas ventas</div>
                              <div className="space-y-2">
                                {chipStats.map((s) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-3"
                                  >
                                    <div className="text-sm font-medium tracking-tight text-black/80">{s.name}</div>
                                    <div className="text-sm font-semibold tracking-tight text-black">{s.amountLabel}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeScreen === 'pedidos' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-semibold tracking-tight text-black">Pedidos</div>
                                <div className="mt-1 text-xs tracking-tight text-[color:var(--muted)]">
                                  Armá una venta en segundos.
                                </div>
                              </div>
                              <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs tracking-tight text-black/70">
                                Punto de venta
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-[var(--radius)] border border-black/10 bg-[#fbfbfe] p-4">
                                <div className="mb-3 text-xs font-semibold tracking-tight text-[color:var(--muted)]">
                                  Productos
                                </div>
                                <div className="space-y-2">
                                  {['Yerba 1kg', 'Pan lactal', 'Leche entera', 'Café molido'].map((p, idx) => (
                                    <button
                                      key={p}
                                      type="button"
                                      className="flex w-full items-center justify-between rounded-[calc(var(--radius)_-_4px)] border border-black/10 bg-white px-3 py-3 text-left text-sm tracking-tight text-black/80 hover:bg-black/5"
                                    >
                                      <span className="truncate">{p}</span>
                                      <span className="text-xs text-[color:var(--muted)]">+{idx + 1}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-[var(--radius)] border border-black/10 bg-[#fbfbfe] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="text-xs font-semibold tracking-tight text-[color:var(--muted)]">
                                    Carrito
                                  </div>
                                  <div className="text-xs tracking-tight text-[color:var(--muted)]">3 ítems</div>
                                </div>
                                <div className="space-y-2">
                                  {[
                                    { name: 'Yerba 1kg', qty: 1, price: 5200 },
                                    { name: 'Leche entera', qty: 2, price: 2500 },
                                  ].map((i) => (
                                    <div
                                      key={i.name}
                                      className="flex items-center justify-between rounded-[calc(var(--radius)_-_4px)] border border-black/10 bg-white px-3 py-3 text-sm tracking-tight"
                                    >
                                      <div className="min-w-0 text-black/80">
                                        <span className="font-semibold text-black">{i.qty}x</span> {i.name}
                                      </div>
                                      <div className="text-black/80">{formatCurrency(i.price)}</div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
                                  <div className="text-xs tracking-tight text-[color:var(--muted)]">Total</div>
                                  <div className="text-lg font-semibold tracking-tight text-black">{formatCurrency(10200)}</div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    className="h-10 rounded-[calc(var(--radius)_-_4px)] border border-black/15 bg-white text-sm font-medium tracking-tight text-black/80 hover:bg-black/5"
                                  >
                                    Fiado
                                  </button>
                                  <button
                                    type="button"
                                    className="h-10 rounded-[calc(var(--radius)_-_4px)] bg-[#0a84ff] text-sm font-semibold tracking-tight text-white hover:bg-[#0a84ff]/90"
                                  >
                                    Cobrar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeScreen === 'ventas' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-semibold tracking-tight text-black">Ventas</div>
                                <div className="mt-1 text-xs tracking-tight text-[color:var(--muted)]">
                                  Historial y cuentas pendientes.
                                </div>
                              </div>
                              <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs tracking-tight text-black/70">
                                Filtros
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                              {[
                                { label: 'Total', value: '48' },
                                { label: 'Hoy', value: formatCurrency(data.stats.todaySales) },
                                { label: 'Pendiente', value: formatCurrency(12700) },
                              ].map((c) => (
                                <div key={c.label} className="rounded-2xl border border-black/10 bg-[#fbfbfe] p-4">
                                  <div className="text-xs font-semibold tracking-tight text-[color:var(--muted)]">
                                    {c.label}
                                  </div>
                                  <div className="mt-2 text-2xl font-semibold tracking-tight text-black">{c.value}</div>
                                </div>
                              ))}
                            </div>

                            <div className="rounded-2xl border border-black/10 bg-[#fbfbfe] p-4">
                              <div className="mb-3 text-sm font-semibold tracking-tight text-black">Detalle</div>
                              <div className="space-y-2">
                                {chipStats.map((s) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-3 text-sm tracking-tight"
                                  >
                                    <div className="text-black/80">{s.name}</div>
                                    <div className="font-semibold text-black">{s.amountLabel}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-20 mt-8 flex justify-center lg:absolute lg:-bottom-10 lg:-right-10 lg:mt-0 lg:block">
                  <div className="animate-float-tilt-slower w-[240px] rounded-[2.8rem] bg-[#0b0b0d] p-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                    <div className="relative overflow-hidden rounded-[2.35rem] bg-white">
                      <div className="absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-black/10" />
                      <div className="border-b border-black/10 bg-[#fbfbfe] px-5 pb-4 pt-12">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold tracking-tight text-black">Gestly</div>
                          <div className="flex items-center gap-2 text-xs tracking-tight text-black/60">
                            <Smartphone className="h-4 w-4" strokeWidth={1.6} />
                            Móvil
                          </div>
                        </div>
                        <div className="mt-2 text-xs tracking-tight text-[color:var(--muted)]">Resumen rápido.</div>
                      </div>

                      <div className="space-y-3 p-5">
                        <div className="grid grid-cols-3 gap-2">
                          {sections.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => setActiveScreen(s.value)}
                              className={[
                                'h-9 rounded-2xl text-xs font-semibold tracking-tight transition-colors',
                                activeScreen === s.value ? 'bg-[#0a84ff] text-white' : 'bg-black/5 text-black/70 hover:bg-black/10',
                              ].join(' ')}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white p-4">
                          <div className="text-xs font-semibold tracking-tight text-[color:var(--muted)]">Ventas de hoy</div>
                          <div className="mt-1 text-xl font-semibold tracking-tight text-black">
                            {formatCurrency(data.stats.todaySales)}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-[#fbfbfe] p-4">
                          <div className="mb-2 text-xs font-semibold tracking-tight text-[color:var(--muted)]">Últimas</div>
                          <div className="space-y-2">
                            {chipStats.slice(0, 2).map((s) => (
                              <div key={s.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                                <div className="truncate text-xs font-medium tracking-tight text-black/75">{s.name}</div>
                                <div className="text-xs font-semibold tracking-tight text-black">{s.amountLabel}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
