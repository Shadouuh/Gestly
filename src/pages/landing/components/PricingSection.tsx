import { Link } from 'react-router-dom'
import { Check, Minus } from 'lucide-react'

import type { LandingData } from '@shared/services/landingService'
import { Button } from '@shared/components/ui/Button'
import { Container } from '@shared/components/ui/Container'

type PricingSectionProps = {
  data: LandingData
}

const ARS_PER_USD = 1477.895

function formatARS(value: number) {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatUSD(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

type PlanId = 'free' | 'basic' | 'pro'

type ComparisonRow = {
  label: string
  values: Record<PlanId, { text: string; included: boolean }>
}

export function PricingSection({ data }: PricingSectionProps) {
  const plans = data.plans.filter((p) => p.id === 'free' || p.id === 'basic' || p.id === 'pro') as Array<
    (typeof data.plans)[number] & { id: PlanId }
  >

  const planById = Object.fromEntries(plans.map((p) => [p.id, p])) as Partial<Record<PlanId, (typeof plans)[number]>>

  const rows: ComparisonRow[] = [
    {
      label: 'Ventas',
      values: {
        free: { text: 'Hasta 100/mes', included: true },
        basic: { text: 'Ilimitadas', included: true },
        pro: { text: 'Ilimitadas', included: true },
      },
    },
    {
      label: 'Productos',
      values: {
        free: { text: '50', included: true },
        basic: { text: 'Ilimitados', included: true },
        pro: { text: 'Ilimitados', included: true },
      },
    },
    {
      label: 'Usuarios',
      values: {
        free: { text: '1', included: true },
        basic: { text: 'Hasta 3', included: true },
        pro: { text: 'Ilimitados', included: true },
      },
    },
    {
      label: 'Reportes',
      values: {
        free: { text: 'Básicos', included: true },
        basic: { text: 'Avanzados', included: true },
        pro: { text: 'Avanzados', included: true },
      },
    },
    {
      label: 'Fiados',
      values: {
        free: { text: '—', included: false },
        basic: { text: 'Incluido', included: true },
        pro: { text: 'Incluido', included: true },
      },
    },
    {
      label: 'Sucursales',
      values: {
        free: { text: '1', included: true },
        basic: { text: 'Hasta 2', included: true },
        pro: { text: 'Ilimitadas', included: true },
      },
    },
    {
      label: 'Soporte',
      values: {
        free: { text: 'Email', included: true },
        basic: { text: 'Prioritario', included: true },
        pro: { text: '24/7', included: true },
      },
    },
  ]

  const orderedAll: PlanId[] = ['free', 'basic', 'pro']
  const ordered = orderedAll.filter((id) => Boolean(planById[id]))
  const gridStyle = { gridTemplateColumns: `240px repeat(${ordered.length}, minmax(0, 1fr))` }

  return (
    <section id="pricing" className="relative overflow-hidden bg-[color:var(--app-bg)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#ffd60a]/10 blur-3xl" />
        <div className="absolute -right-44 top-24 h-[28rem] w-[28rem] rounded-full bg-[#0a84ff]/8 blur-3xl" />
      </div>
      <Container>
        <div className="relative overflow-hidden rounded-[2.75rem] border border-black/10 bg-white/70 px-6 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-10 md:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </div>

          <div className="relative mb-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-black md:text-5xl">Elegí tu plan</h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-black/65 md:text-lg">
              Empezá gratis y ajustá cuando lo necesites.
            </p>
          </div>

          <div className="relative hidden md:block">
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
              <div className="grid border-b border-black/10 bg-[#fbfbfe]" style={gridStyle}>
                <div className="p-6" />
                {ordered.map((id) => {
                  const p = planById[id]
                  if (!p) return null
                  const ars = p.price * ARS_PER_USD
                  return (
                    <div key={id} className="border-l border-black/10 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold tracking-tight text-black">{p.name}</div>
                          <div className="mt-1 text-xs tracking-tight text-black/60">{p.description}</div>
                        </div>
                        {p.badge && (
                          <div className="rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-semibold tracking-tight text-[#0a84ff]">
                            {p.badge}
                          </div>
                        )}
                      </div>

                      <div className="mt-5">
                        <div className="text-2xl font-semibold tracking-tight text-black">
                          {formatARS(ars)}
                        </div>
                        <div className="mt-1 text-xs tracking-tight text-black/60">
                          {formatUSD(p.price)} / {p.period}
                        </div>
                      </div>

                      <div className="mt-6">
                        <Link to="/login">
                          <Button variant={p.variant === 'primary' ? 'primary' : 'outline'} className="w-full">
                            {p.cta}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="divide-y divide-black/10">
                {rows.map((r) => (
                  <div key={r.label} className="grid" style={gridStyle}>
                    <div className="p-5 text-sm font-semibold tracking-tight text-black/75">{r.label}</div>
                    {ordered.map((id) => {
                      const v = r.values[id]
                      return (
                        <div key={`${r.label}-${id}`} className="flex items-center gap-3 border-l border-black/10 p-5">
                          <div
                            className={[
                              'flex h-8 w-8 items-center justify-center rounded-xl border',
                              v.included
                                ? 'border-[#0a84ff]/20 bg-[#0a84ff]/10 text-[#0a84ff]'
                                : 'border-black/10 bg-black/5 text-black/40',
                            ].join(' ')}
                          >
                            {v.included ? <Check className="h-4 w-4" strokeWidth={2} /> : <Minus className="h-4 w-4" strokeWidth={2} />}
                          </div>
                          <div className="text-sm tracking-tight text-black/75">{v.text}</div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:hidden">
            {ordered.map((id) => {
              const p = planById[id]
              if (!p) return null
              const ars = p.price * ARS_PER_USD
              return (
                <div key={id} className="overflow-hidden rounded-3xl border border-black/10 bg-white">
                  <div className="border-b border-black/10 bg-[#fbfbfe] p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold tracking-tight text-black">{p.name}</div>
                        <div className="mt-1 text-xs tracking-tight text-black/60">{p.description}</div>
                      </div>
                      {p.badge && (
                        <div className="rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-semibold tracking-tight text-[#0a84ff]">
                          {p.badge}
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <div className="text-2xl font-semibold tracking-tight text-black">{formatARS(ars)}</div>
                      <div className="mt-1 text-xs tracking-tight text-black/60">
                        {formatUSD(p.price)} / {p.period}
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link to="/login">
                        <Button variant={p.variant === 'primary' ? 'primary' : 'outline'} className="w-full">
                          {p.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="divide-y divide-black/10">
                    {rows.map((r) => {
                      const v = r.values[id]
                      return (
                        <div key={`${id}-${r.label}`} className="flex items-center justify-between gap-4 p-5">
                          <div className="text-sm font-semibold tracking-tight text-black/75">{r.label}</div>
                          <div className="flex items-center gap-3">
                            <div
                              className={[
                                'flex h-8 w-8 items-center justify-center rounded-xl border',
                                v.included
                                  ? 'border-[#0a84ff]/20 bg-[#0a84ff]/10 text-[#0a84ff]'
                                  : 'border-black/10 bg-black/5 text-black/40',
                              ].join(' ')}
                            >
                              {v.included ? <Check className="h-4 w-4" strokeWidth={2} /> : <Minus className="h-4 w-4" strokeWidth={2} />}
                            </div>
                            <div className="text-sm tracking-tight text-black/75">{v.text}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
