import { NavLink } from 'react-router-dom'
import { BarChart3, Receipt, Settings, ShoppingBag } from 'lucide-react'

const items = [
  { name: 'Pedidos', to: '/app/pedidos', icon: ShoppingBag },
  { name: 'Ventas', to: '/app/ventas', icon: Receipt },
  { name: 'Stats', to: '/app/estadisticas', icon: BarChart3 },
  { name: 'Config', to: '/app/configuracion', icon: Settings },
] as const

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--card-bg)] px-2 py-1.5 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5">
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] tracking-tight',
                isActive
                  ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)]'
                  : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)]',
              ].join(' ')
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={1.6} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
