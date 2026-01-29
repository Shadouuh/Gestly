import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Grid } from 'lucide-react'
import { NAVIGATION_ITEMS } from '@shared/config/navigation'

export function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  // Split items: 2 left, 2 right, rest in menu
  // We prioritize the first 4 for the main bar
  const mainItemsLeft = NAVIGATION_ITEMS.slice(0, 2)
  const mainItemsRight = NAVIGATION_ITEMS.slice(2, 4)
  const menuItems = NAVIGATION_ITEMS.slice(4) // The rest go into the menu

  // Check if any menu item is active to highlight the central button
  const isMenuContentActive = menuItems.some(item => location.pathname.startsWith(item.to))

  return (
    <>
      {/* Menu Overlay */}
      {isMenuOpen && (
         <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in md:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Popover Menu */}
      {isMenuOpen && (
         <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[color:var(--card-bg)] rounded-[var(--radius)] shadow-2xl border border-[color:var(--border)] p-4 z-50 animate-in slide-in-from-bottom-10 zoom-in-95 duration-200 md:hidden">
            <div className="grid grid-cols-3 gap-3">
               {menuItems.map((item) => (
                  <NavLink
                     key={item.name}
                     to={item.to}
                     onClick={() => setIsMenuOpen(false)}
                     className={({ isActive }) =>
                        [
                           'flex flex-col items-center justify-center gap-2 rounded-[calc(var(--radius)-4px)] p-3 text-xs font-medium transition-all',
                           isActive
                              ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] shadow-md'
                              : 'bg-[color:var(--ghost-hover-bg)] text-[color:var(--muted)] hover:text-[color:var(--text)]',
                        ].join(' ')
                     }
                  >
                     <item.icon size={20} strokeWidth={2} />
                     <span>{item.name}</span>
                  </NavLink>
               ))}
               
               {/* Add more shortcuts here if needed */}
            </div>
         </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[color:var(--card-bg)] border-t border-[color:var(--border)] pb-safe md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="relative flex items-center justify-between px-2 h-16">
          
          {/* Left Items */}
          <div className="flex-1 flex justify-around">
            {mainItemsLeft.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all duration-300',
                    isActive
                      ? 'text-[color:var(--primary-bg)]'
                      : 'text-[color:var(--muted)] hover:text-[color:var(--text)]',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                   <>
                      <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-[color:var(--primary-bg)]/10' : ''}`}>
                         <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.name}</span>
                   </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Center Space for Button */}
          <div className="w-16 shrink-0" />

          {/* Right Items */}
          <div className="flex-1 flex justify-around">
             {mainItemsRight.map((item) => (
               <NavLink
                 key={item.name}
                 to={item.to}
                 className={({ isActive }) =>
                   [
                     'flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all duration-300',
                     isActive
                       ? 'text-[color:var(--primary-bg)]'
                       : 'text-[color:var(--muted)] hover:text-[color:var(--text)]',
                   ].join(' ')
                 }
               >
                 {({ isActive }) => (
                    <>
                       <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-[color:var(--primary-bg)]/10' : ''}`}>
                          <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                       </div>
                       <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.name}</span>
                    </>
                 )}
               </NavLink>
             ))}
          </div>

          {/* Central Floating Button */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6">
             <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`h-14 w-14 rounded-full flex items-center justify-center shadow-xl border-4 border-[color:var(--app-bg)] transition-all duration-300 active:scale-95 ${
                   isMenuOpen || isMenuContentActive
                      ? 'bg-[color:var(--primary-bg)] text-[color:var(--primary-fg)] rotate-90'
                      : 'bg-[color:var(--card-bg)] text-[color:var(--text)] hover:bg-[color:var(--ghost-hover-bg)]'
                }`}
             >
                {isMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Grid size={24} strokeWidth={2.5} />}
             </button>
          </div>

        </div>
      </nav>
    </>
  )
}
