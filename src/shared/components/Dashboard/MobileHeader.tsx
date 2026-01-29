import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleUser, LogOut, Moon, Search, Sun, X } from 'lucide-react'

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
  const [searchOpen, setSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--card-bg)] px-3 md:hidden">
      
      {/* Left: Logo or Search Input */}
      <div className="flex items-center flex-1 min-w-0">
        <div className={`flex items-center gap-2.5 transition-all duration-300 ${searchOpen ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
          <button
            type="button"
            onClick={() => navigate('/app/pedidos')}
            className="flex items-center gap-2.5"
            aria-label="Ir a Pedidos"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius)_-_8px)] border border-[color:var(--border)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]">
              <span className="text-base font-semibold">G</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[13px] font-semibold tracking-tight">Gestly</span>
              <span className="text-[11px] tracking-tight text-[color:var(--muted)]">{account?.nombre ?? ''}</span>
            </div>
          </button>
        </div>

        <div className={`flex items-center flex-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${searchOpen ? 'w-full opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 overflow-hidden'}`}>
           <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted)]" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Buscar..." 
                className="w-full h-9 pl-9 pr-4 rounded-full bg-[color:var(--app-bg)] border border-[color:var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-bg)]/20 transition-all"
                onBlur={() => !searchInputRef.current?.value && setSearchOpen(false)}
              />
           </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-full px-0"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          {searchOpen ? <X size={20} /> : <Search size={20} />}
        </Button>

        <div ref={menuRef} className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-[calc(var(--radius)_-_8px)] px-0"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            <CircleUser className="h-4 w-4" strokeWidth={1.5} />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-2 shadow-[0_6px_18px_var(--shadow)] animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-200">
              <div className="px-2.5 pb-2 pt-1 text-[11px] tracking-tight text-[color:var(--muted)]">
                {account?.nombre ?? 'Cuenta'}
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleTheme()
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-[calc(var(--radius)_-_8px)] px-2.5 py-2 text-[13px] font-medium tracking-tight text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)]"
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
                className="flex w-full items-center gap-2.5 rounded-[calc(var(--radius)_-_8px)] px-2.5 py-2 text-[13px] font-medium tracking-tight text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)]"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
