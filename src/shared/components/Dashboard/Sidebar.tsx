import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, Check, ChevronUp, ChevronsUpDown, CircleUser, LogOut, Menu, Moon, Package, Palette, Receipt, Settings, ShoppingBag, Sun, X, Store } from 'lucide-react'

import { Select } from '@shared/components/ui/Select'
import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'

const navigation = [
  { name: 'Pedidos', to: '/app/pedidos', icon: ShoppingBag },
  { name: 'Ventas', to: '/app/ventas', icon: Receipt },
  { name: 'Productos', to: '/app/productos', icon: Package },
  { name: 'Temas', to: '/app/temas', icon: Palette },
  { name: 'Configuración', to: '/app/configuracion', icon: Settings },
] as const

export function Sidebar() {
  const navigate = useNavigate()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  const account = useAuthStore((s) => s.account)
  const business = useAuthStore((s) => s.business)
  const activeBranchId = useAuthStore((s) => s.activeBranchId)
  const setActiveBranchId = useAuthStore((s) => s.setActiveBranchId)
  const logout = useAuthStore((s) => s.logout)

  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const [branchMenuOpen, setBranchMenuOpen] = useState(false)
  const branchMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return

      if (accountMenuOpen && accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false)
      }

      if (branchMenuOpen && branchMenuRef.current && !branchMenuRef.current.contains(target)) {
        setBranchMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [accountMenuOpen, branchMenuOpen])

  return (
    <aside
      className={[
        'fixed bottom-0 left-0 top-0 z-40 py-4 hidden flex-col items-center gap-3 border-r border-[color:var(--border)] bg-[color:var(--card-bg)] md:flex',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {collapsed ? (
        <div className="flex w-full flex-col items-center px-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-[color:var(--ghost-hover-bg)]"
            aria-label="Expandir sidebar"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between gap-3 px-3">
          <div ref={branchMenuRef} className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (business?.tieneMultiplesSucursales && account?.rol === 'admin') {
                  setBranchMenuOpen(!branchMenuOpen)
                } else {
                  navigate('/app/pedidos')
                }
              }}
              className={`flex items-center gap-3 w-full rounded-lg transition-colors text-left outline-none ${
                business?.tieneMultiplesSucursales && account?.rol === 'admin' ? 'cursor-pointer hover:bg-[color:var(--ghost-hover-bg)] -ml-2 p-2' : ''
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]">
                <span className="text-base font-semibold">{business?.nombre ? business.nombre[0].toUpperCase() : 'G'}</span>
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-semibold tracking-tight truncate w-full leading-none mb-0.5">
                  {business?.nombre || 'Gestly'}
                </span>
                <span className="text-[10px] text-[color:var(--muted)] font-medium leading-none">by Gestly</span>
              </div>
              {business?.tieneMultiplesSucursales && account?.rol === 'admin' && (
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-[color:var(--muted)] opacity-50" />
              )}
            </button>

            {branchMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-[color:var(--border)] bg-[color:var(--card-bg)] p-1 shadow-lg animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-2 py-1.5 text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">
                  Cambiar Sucursal
                </div>
                
                <button
                  onClick={() => { setActiveBranchId('all'); setBranchMenuOpen(false); }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium hover:bg-[color:var(--ghost-hover-bg)] transition-colors text-left"
                >
                  <span>Todas las sucursales</span>
                  {activeBranchId === 'all' && <Check className="h-3.5 w-3.5 text-[color:var(--primary-bg)]" />}
                </button>

                <button
                  onClick={() => { setActiveBranchId('main'); setBranchMenuOpen(false); }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium hover:bg-[color:var(--ghost-hover-bg)] transition-colors text-left"
                >
                  <span>Sucursal Central</span>
                  {activeBranchId === 'main' && <Check className="h-3.5 w-3.5 text-[color:var(--primary-bg)]" />}
                </button>

                {business?.branches?.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setActiveBranchId(b.id); setBranchMenuOpen(false); }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium hover:bg-[color:var(--ghost-hover-bg)] transition-colors text-left"
                  >
                    <span className="truncate">{b.name}</span>
                    {activeBranchId === b.id && <Check className="h-3.5 w-3.5 text-[color:var(--primary-bg)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[color:var(--ghost-hover-bg)]"
            aria-label="Colapsar sidebar"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      )}



      <nav className="flex w-full flex-1 flex-col gap-1 px-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            title={item.name}
            className={({ isActive }) =>
              [
                'flex h-9 items-center gap-2.5 rounded-md text-[12px] tracking-tight transition-colors',
                collapsed ? 'justify-center px-0' : 'px-2.5',
                isActive
                  ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]'
                  : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)]',
              ].join(' ')
            }
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
            {!collapsed && <span className="font-medium tracking-tight">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div ref={accountMenuRef} className={['relative w-full px-2.5', collapsed ? 'px-0' : ''].join(' ')}>
        <button
          type="button"
          onClick={() => setAccountMenuOpen((v) => !v)}
          className={[
            'flex h-9 items-center gap-2.5 rounded-md border border-[color:var(--outline-border)] bg-[color:var(--outline-bg)] text-[12px] font-medium tracking-tight text-[color:var(--outline-fg)] hover:bg-[color:var(--outline-hover-bg)]',
            collapsed ? 'mx-auto w-12 justify-center px-0' : 'w-full justify-between px-2.5',
          ].join(' ')}
          aria-label="Abrir menú de cuenta"
        >
          <span className={['flex items-center gap-3', collapsed ? '' : 'min-w-0'].join(' ')}>
            <CircleUser className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="truncate">{account?.nombre ? account.nombre : 'Cuenta'}</span>}
          </span>
          {!collapsed && (
            <ChevronUp
              className={['h-4 w-4 shrink-0 transition-transform', accountMenuOpen ? '' : 'rotate-180'].join(' ')}
              strokeWidth={1.5}
            />
          )}
        </button>

        {accountMenuOpen && (
          <div
            className={[
              'absolute bottom-full z-50 mb-2 rounded-md border border-[color:var(--border)] bg-[color:var(--card-bg)] p-2 shadow-[0_6px_18px_var(--shadow)]',
              collapsed ? 'left-1/2 w-56 -translate-x-1/2' : 'left-0 right-0',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => {
                toggleTheme()
                setAccountMenuOpen(false)
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
                setAccountMenuOpen(false)
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
    </aside>
  )
}
