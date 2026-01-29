import type { LandingData } from '@shared/services/landingService'
import { Container } from '@shared/components/ui/Container'
import { BarChart3, Package, Store, Zap } from 'lucide-react'

type WhatIsSectionProps = {
  data: LandingData
}

export function WhatIsSection({ data }: WhatIsSectionProps) {
  const cards = [
    { icon: Zap, accent: '#0a84ff' },
    { icon: Package, accent: '#30d158' },
    { icon: BarChart3, accent: '#ff2d55' },
  ]

  const steps = [
    { id: 1, icon: Store, accent: '#0a84ff' },
    { id: 2, icon: Zap, accent: '#7d5cff' },
    { id: 3, icon: Package, accent: '#30d158' },
    { id: 4, icon: BarChart3, accent: '#ff2d55' },
  ]

  const fallbackImage = (title: string) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#0a84ff" stop-opacity="0.22"/>
            <stop offset="0.55" stop-color="#7d5cff" stop-opacity="0.18"/>
            <stop offset="1" stop-color="#ff2d55" stop-opacity="0.16"/>
          </linearGradient>
        </defs>
        <rect width="900" height="520" rx="44" fill="#ffffff"/>
        <rect x="12" y="12" width="876" height="496" rx="40" fill="url(#g)"/>
        <g opacity="0.9">
          <circle cx="730" cy="110" r="88" fill="#0b0b0d" opacity="0.08"/>
          <circle cx="175" cy="380" r="120" fill="#0b0b0d" opacity="0.06"/>
        </g>
        <text x="56" y="92" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="22" font-weight="700" fill="#0b0b0d" opacity="0.78">Gestly</text>
        <text x="56" y="132" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="34" font-weight="700" fill="#0b0b0d" opacity="0.84">${title}</text>
      </svg>`,
    )}`

  return (
    <section id="que-es" className="relative overflow-hidden bg-[color:var(--app-bg)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-[#0a84ff]/10 blur-3xl" />
        <div className="absolute -right-40 -top-8 h-96 w-96 rounded-full bg-[#ff2d55]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>
      <Container>
        <div className="relative overflow-hidden rounded-[2.75rem] border border-black/10 bg-white/70 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold tracking-tight text-black/70">
                Simplificado en {data.steps.length} pasos
              </div>
              <h3 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-black md:text-4xl">
                De “anotar todo” a “listo, cobrado”.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/65 md:text-base">
                Un flujo corto y claro. Sin configuraciones eternas.
              </p>
            </div>
            <div className="rounded-full bg-[#0a84ff]/10 px-4 py-2 text-sm font-semibold tracking-tight text-[#0a84ff]">
              Fácil de aprender
            </div>
          </div>

          <div className="relative mt-10">
            <div className="pointer-events-none absolute left-10 right-10 top-10 hidden h-px bg-gradient-to-r from-transparent via-black/15 to-transparent lg:block" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.steps.map((s) => {
                const meta = steps.find((m) => m.id === s.id) ?? steps[0]
                return (
                  <div key={s.id} className="relative rounded-[var(--radius)] border border-black/10 bg-white p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-[calc(var(--radius)_-_4px)]"
                        style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
                      >
                        <meta.icon className="h-6 w-6" strokeWidth={1.6} />
                      </div>
                      <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold tracking-tight text-black/60">
                        Paso {s.id}
                      </div>
                    </div>
                    <div className="mt-4 text-base font-semibold tracking-tight text-black">{s.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-black/70">{s.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative mt-14 overflow-hidden rounded-[calc(var(--radius)*2)] border border-black/10 bg-gradient-to-b from-white/80 to-white/55 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur md:mt-16 md:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#0a84ff]/10 blur-3xl" />
            <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[#30d158]/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </div>

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold tracking-tight text-black/70 backdrop-blur">
                <Store className="h-4 w-4 text-[#0a84ff]" strokeWidth={1.6} />
                Hecha para kioscos y almacenes
              </div>

              <h2 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-black md:text-5xl">
                Gestión simple para el mostrador.
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-black/70">
                Gestly es una app desarrollada por y para gente que atiende locales. Ya no más cuadernos: vendés en
                segundos y todo queda ordenado.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {data.whatIsCards.map((c, idx) => {
                  const cardMeta = cards[idx] ?? cards[0]
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${cardMeta.accent}1a`, color: cardMeta.accent }}
                        >
                          <cardMeta.icon className="h-5 w-5" strokeWidth={1.6} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold tracking-tight text-black">{c.title}</div>
                          <div className="truncate text-xs tracking-tight text-[color:var(--muted)]">
                            Listo para usar
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-black/70">{c.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/70 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white">
                    <img
                      src="https://images.unsplash.com/photo-1580915411954-282cb1c96c55?auto=format&fit=crop&w=900&q=60"
                      alt="Kiosco"
                      className="h-44 w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = fallbackImage('Kiosco')
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 py-3">
                      <div className="text-sm font-semibold tracking-tight text-white">Mostrador sin caos</div>
                      <div className="text-xs tracking-tight text-white/80">Una venta, un registro.</div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white">
                    <img
                      src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=60"
                      alt="Cliente pagando"
                      className="h-44 w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = fallbackImage('Cobro')
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 py-3">
                      <div className="text-sm font-semibold tracking-tight text-white">Cobro rápido</div>
                      <div className="text-xs tracking-tight text-white/80">Menos espera, más flujo.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[var(--radius)] border border-black/10 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold tracking-tight text-black">Venta en segundos</div>
                      <div className="mt-1 text-xs tracking-tight text-[color:var(--muted)]">
                        Seleccionás, cobrás y listo.
                      </div>
                    </div>
                    <div className="rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-semibold tracking-tight text-[#0a84ff]">
                      Simple
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
