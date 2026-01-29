import { Link } from 'react-router-dom'

import type { LandingData } from '@shared/services/landingService'
import { Button } from '@shared/components/ui/Button'
import { Container } from '@shared/components/ui/Container'

type CtaSectionProps = {
  data: LandingData
}

export function CtaSection({ data }: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--app-bg)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#0a84ff]/10 blur-3xl" />
        <div className="absolute -right-44 top-24 h-[28rem] w-[28rem] rounded-full bg-[#ff2d55]/10 blur-3xl" />
      </div>
      <Container>
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*2)] border border-black/10 bg-white/70 px-6 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-10 md:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#0a84ff]/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-black md:text-5xl">
              {data.ctaTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-black/65 md:text-lg">
              {data.ctaSubtitle}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/login">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  Probar gratis
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm tracking-tight text-black/60">
              Sin tarjeta • Sin compromiso • Cancelás cuando quieras
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
