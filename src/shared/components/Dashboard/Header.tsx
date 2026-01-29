import { useNavigate } from 'react-router-dom'
import { Bell, CircleUser, LogOut, Moon, Search, Sun } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import { Button } from '@shared/components/ui/Button'

export function Header() {
  const navigate = useNavigate()
  const account = useAuthStore((s) => s.account)
  const logout = useAuthStore((s) => s.logout)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[color:var(--border)] bg-[color:var(--card-bg)]/80 px-6 backdrop-blur-md transition-all">
      {/* Left: Search or Breadcrumbs (Placeholder for now) */}
      <div className="flex flex-1 items-center gap-4">
         <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted)]" />
            <input 
              type="text" 
              placeholder="Buscar en Gestly..." 
              className="h-10 w-full rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] pl-10 pr-4 text-sm outline-none focus:border-[color:var(--text)] transition-colors"
            />
         </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        <button 
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors relative"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="h-8 w-px bg-[color:var(--border)] mx-1"></div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-1.5 pr-4 hover:bg-[color:var(--ghost-hover-bg)] transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] text-xs font-bold">
              {account?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col items-start text-sm">
               <span className="font-semibold leading-none">{account?.nombre || 'Usuario'}</span>
               <span className="text-[10px] text-[color:var(--muted)] leading-none mt-1 capitalize">{account?.rol || 'Rol'}</span>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-[var(--radius)] border border-[color:var(--border)] bg-[color:var(--card-bg)] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-200">
               <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex w-full items-center gap-2 rounded-[calc(var(--radius)_-_8px)] px-3 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
               >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
               </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
