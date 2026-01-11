import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleUser, LogOut, Moon, Sun } from 'lucide-react'

import { Button } from '@shared/components/ui/Button'
import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'

export function MobileHeader() {
  const navigate = useNavigate()
  const account = useAuthStore((s) => s.account)
  const logout = useAuthStore((s) => s.logout)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuOpen) return
      const target = event.target
      if (!(target instanceof Node)) return
      if (!menuRef.current) return
      if (!menuRef.current.contains(target)) setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--card-bg)] px-3 md:hidden">
      <button
        type="button"
        onClick={() => navigate('/app/pedidos')}
        className="flex items-center gap-2.5"
        aria-label="Ir a Pedidos"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]">
          <span className="text-base font-semibold">G</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[13px] font-semibold tracking-tight">Gestly</span>
          <span className="text-[11px] tracking-tight text-[color:var(--muted)]">{account?.nombre ?? ''}</span>
        </div>
      </button>

      <div ref={menuRef} className="relative">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-md px-0"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <CircleUser className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-md border border-[color:var(--border)] bg-[color:var(--card-bg)] p-2 shadow-[0_6px_18px_var(--shadow)]">
            <div className="px-2.5 pb-2 pt-1 text-[11px] tracking-tight text-[color:var(--muted)]">
              {account?.nombre ?? 'Cuenta'}
            </div>

            <button
              type="button"
              onClick={() => {
                toggleTheme()
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium tracking-tight text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)]"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Sun className="h-4 w-4" strokeWidth={1.5} />
              )}
              <span>{theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                logout()
                navigate('/login', { replace: true })
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium tracking-tight text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
