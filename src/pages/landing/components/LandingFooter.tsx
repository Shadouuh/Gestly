import { Container } from '@shared/components/ui/Container'
import { Facebook, Github, Instagram, Linkedin, Youtube } from 'lucide-react'

type LandingFooterProps = {
  tagline: string
  links: Record<string, string[]>
}

function TikTokIcon(props: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={props.className}>
      <path
        d="M14 4v10.2a3.8 3.8 0 1 1-3.3-3.76"
        stroke="currentColor"
        strokeWidth={props.strokeWidth ?? 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7.2c1.1 1.7 2.75 2.8 5 2.95"
        stroke="currentColor"
        strokeWidth={props.strokeWidth ?? 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LandingFooter({ tagline, links }: LandingFooterProps) {
  const quickLinks = Array.from(new Set(Object.values(links).flat())).slice(0, 9)
  const year = new Date().getFullYear()

  const socials = [
    { label: 'GitHub', href: '#', Icon: Github },
    { label: 'Facebook', href: '#', Icon: Facebook },
    { label: 'TikTok', href: '#', Icon: TikTokIcon },
    { label: 'Instagram', href: '#', Icon: Instagram },
    { label: 'LinkedIn', href: '#', Icon: Linkedin },
    { label: 'YouTube', href: '#', Icon: Youtube },
  ]

  return (
    <footer className="relative overflow-hidden bg-[color:var(--app-bg)] py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#0a84ff]/8 blur-3xl" />
      </div>

      <Container>
        <div className="relative overflow-hidden rounded-[calc(var(--radius)*2)] border border-black/10 bg-white/70 px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur md:px-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-[#0a84ff] to-[#7d5cff] p-[1px]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                    <span className="text-sm font-semibold">G</span>
                  </div>
                </div>
                <div className="text-base font-semibold tracking-tight text-black">Gestly</div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-black/65">{tagline}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                {quickLinks.map((t) => (
                  <a
                    key={t}
                    href="#"
                    className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold tracking-tight text-black/70 transition hover:-translate-y-0.5 hover:bg-white hover:text-black"
                  >
                    {t}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 md:items-end">
              <div className="text-xs font-semibold tracking-tight text-black/60">Redes</div>
              <div className="flex flex-wrap gap-2">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] border border-black/10 bg-white/70 text-black/65 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-black"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </a>
                ))}
              </div>
              <div className="text-xs tracking-tight text-black/55">
                © {year} Gestly. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
