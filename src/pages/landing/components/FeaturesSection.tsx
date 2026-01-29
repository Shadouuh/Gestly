import type { LandingData } from '@shared/services/landingService'
import { Container } from '@shared/components/ui/Container'
import {
  BarChart3,
  BookMarked,
  CreditCard,
  Package,
  Store,
  Users,
} from 'lucide-react'

type FeaturesSectionProps = {
  data: LandingData
}

export function FeaturesSection({ data }: FeaturesSectionProps) {
  const iconById: Record<number, typeof Store> = {
    1: Store,
    2: Package,
    3: CreditCard,
    4: BarChart3,
    5: Users,
    6: BookMarked,
  }

  const accentById: Record<number, string> = {
    1: '#0a84ff',
    2: '#30d158',
    3: '#ff2d55',
    4: '#7d5cff',
    5: '#ffd60a',
    6: '#34c759',
  }

  return (
    <section id="features" className="relative overflow-hidden bg-[color:var(--app-bg)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-[#0a84ff]/8 blur-3xl" />
        <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-[#30d158]/8 blur-3xl" />
      </div>
      <Container>
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*2)] border border-black/10 bg-white/70 px-6 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-10 md:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#0a84ff]/10 blur-3xl" />
            <div className="absolute -right-24 -bottom-40 h-96 w-96 rounded-full bg-[#ff2d55]/10 blur-3xl" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[420px_1fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold tracking-tight text-black/70">
                Todo lo que necesitás
              </div>
              <h2 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-black md:text-5xl">
                Features pensados para trabajar todos los días.
              </h2>
              <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-black/65 md:text-base">
                Orden visual, acciones rápidas y datos claros. Todo en el mismo lugar.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.features.map((f) => {
                const Icon = iconById[f.id] ?? Store
                const accent = accentById[f.id] ?? '#0a84ff'
                return (
                  <div
                    key={f.id}
                    className="group relative overflow-hidden rounded-[var(--radius)] border border-black/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5"
                  >
                    <div
                      className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full blur-2xl"
                      style={{ backgroundColor: `${accent}1a` }}
                    />
                    <div className="relative">
                      <div className="mb-4 flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius)]"
                          style={{ backgroundColor: `${accent}1a`, color: accent }}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.6} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold tracking-tight text-black">{f.title}</div>
                          <div className="truncate text-xs tracking-tight text-[color:var(--muted)]">
                            Limpio y rápido
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-black/70">{f.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
