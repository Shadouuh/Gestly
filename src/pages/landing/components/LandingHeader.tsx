import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import { Container } from '@shared/components/ui/Container'

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const body = document.body
    if (!isOpen) return
    const prev = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = prev
    }
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 pt-4 md:pt-5">
      <Container>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/80 px-4 py-3 text-black shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur md:rounded-full md:px-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[#0a84ff]/10 blur-3xl" />
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#ff2d55]/8 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </div>

          <div className="relative flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-[#0a84ff] to-[#7d5cff] p-[1px]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-sm">
                  <span className="text-sm font-semibold">G</span>
                </div>
              </div>
              <div className="text-base font-semibold tracking-tight text-black">Gestly</div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {[
                { href: '#que-es', label: 'Qué es' },
                { href: '#features', label: 'Características' },
                { href: '#pricing', label: 'Precios' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-medium tracking-tight text-black/70 hover:bg-black/5 hover:text-black"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden h-10 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold tracking-tight text-black/75 hover:bg-black/5 md:inline-flex"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/login"
                className="hidden h-10 items-center rounded-full bg-[#0a84ff] px-4 text-sm font-semibold tracking-tight text-white shadow-[0_12px_22px_rgba(10,132,255,0.25)] hover:bg-[#0a84ff]/90 md:inline-flex"
              >
                Comenzar
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-black/10 bg-white/80 text-black/80 shadow-sm backdrop-blur hover:bg-white md:hidden"
              >
                {isOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="relative mt-3 md:hidden">
              <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur">
                <div className="grid gap-1 p-3">
                  {[
                    { href: '#que-es', label: 'Qué es' },
                    { href: '#features', label: 'Características' },
                    { href: '#pricing', label: 'Precios' },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex h-12 items-center justify-between rounded-[calc(var(--radius)_-_4px)] px-4 text-sm font-semibold tracking-tight text-black/80 hover:bg-black/5"
                    >
                      {item.label}
                      <span className="text-black/40">↗</span>
                    </a>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-black/10 p-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] border border-black/10 bg-white text-sm font-semibold tracking-tight text-black/75 hover:bg-black/5"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-[#0a84ff] text-sm font-semibold tracking-tight text-white shadow-[0_12px_22px_rgba(10,132,255,0.25)] hover:bg-[#0a84ff]/90"
                  >
                    Comenzar
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
                className="fixed inset-0 -z-10 bg-black/10"
              />
            </div>
          )}
        </div>
      </Container>
    </header>
  )
}
