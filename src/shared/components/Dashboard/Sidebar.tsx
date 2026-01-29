import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Check, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import { NAVIGATION_ITEMS } from '@shared/config/navigation'

// Helper to grouping items
const SECTION_CONFIG = [
  { title: 'Principal', match: ['Pedidos', 'Ventas'] },
  { title: 'Inventario', match: ['Productos'] },
  { title: 'Sistema', match: ['Temas', 'Configuración'] }
]

export function Sidebar() {
  const location = useLocation()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)

  const business = useAuthStore((s) => s.business)
  const activeBranchId = useAuthStore((s) => s.activeBranchId)
  const setActiveBranchId = useAuthStore((s) => s.setActiveBranchId)

  // Branch menu state
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false)
  const branchMenuRef = useRef<HTMLDivElement>(null)

  // Sections state
  const [expandedSections, setExpandedSections] = useState<string[]>(['Principal', 'Inventario', 'Sistema'])

  const canSwitchBranch = business?.branches && business.branches.length > 0
  const visibleBranches = business?.branches || []

  // Close menus on click outside
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return

      if (isBranchMenuOpen && branchMenuRef.current && !branchMenuRef.current.contains(target)) {
        setIsBranchMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isBranchMenuOpen])

  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  return (
    <aside
      className={[
        'hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out',
        'bg-[color:var(--card-bg)]/95 backdrop-blur-xl border-r border-[color:var(--border)]',
        collapsed ? 'w-[70px] items-center py-6' : 'w-64 px-2 py-4',
      ].join(' ')}
    >
      {/* --- FLOATING TOGGLE BUTTON --- */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-10 h-6 w-6 bg-[color:var(--card-bg)] border border-[color:var(--border)] rounded-full flex items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--primary-bg)] shadow-sm transition-all hover:scale-110 z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* --- HEADER (Branch Switcher) --- */}
      <div className={`flex items-center w-full mb-8 ${collapsed ? 'justify-center flex-col gap-4' : 'px-1'}`}>
        {collapsed ? (
           <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[color:var(--primary-bg)] to-[color:var(--primary-hover-bg)] text-[color:var(--primary-fg)] flex items-center justify-center font-bold text-lg shadow-lg shadow-[color:var(--primary-bg)]/20">
              {business?.nombre ? business.nombre[0].toUpperCase() : 'G'}
           </div>
        ) : (
           <div ref={branchMenuRef} className="relative flex-1 min-w-0">
              <button
                 onClick={() => canSwitchBranch && setIsBranchMenuOpen(!isBranchMenuOpen)}
                 className={`group flex items-center gap-3 w-full p-2 rounded-xl hover:bg-[color:var(--ghost-hover-bg)] transition-all duration-200 border border-transparent ${canSwitchBranch ? 'cursor-pointer hover:border-[color:var(--border)]' : ''}`}
              >
                 <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[color:var(--primary-bg)] to-[color:var(--primary-hover-bg)] text-[color:var(--primary-fg)] flex items-center justify-center font-bold text-sm shadow-lg shadow-[color:var(--primary-bg)]/20 group-hover:scale-105 transition-transform">
                    {business?.nombre ? business.nombre[0].toUpperCase() : 'G'}
                 </div>
                 <div className="flex flex-col min-w-0 text-left gap-0.5">
                    <span className="font-bold text-sm truncate leading-none text-[color:var(--text)]">{business?.nombre || 'Gestly'}</span>
                    <span className="text-[10px] font-medium text-[color:var(--muted)] uppercase tracking-wider">
                       {activeBranchId === 'all' ? 'Todas' : activeBranchId === 'main' ? 'Central' : visibleBranches.find(b => b.id === activeBranchId)?.name || 'Sucursal'}
                    </span>
                 </div>
                 {canSwitchBranch && <ChevronsUpDown size={14} className="text-[color:var(--muted)] ml-auto opacity-50 group-hover:opacity-100" />}
              </button>

              {/* Branch Dropdown */}
              {isBranchMenuOpen && (
                 <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider opacity-70">Seleccionar Sucursal</div>
                    <div className="space-y-1">
                       <button onClick={() => { setActiveBranchId('all'); setIsBranchMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-[color:var(--ghost-hover-bg)] transition-colors text-left">
                          <span>Todas las sucursales</span>
                          {activeBranchId === 'all' && <Check size={14} className="text-[color:var(--primary-bg)]" />}
                       </button>
                       {visibleBranches.map(b => (
                          <button key={b.id} onClick={() => { setActiveBranchId(b.id); setIsBranchMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-[color:var(--ghost-hover-bg)] transition-colors text-left">
                             <span>{b.name}</span>
                             {activeBranchId === b.id && <Check size={14} className="text-[color:var(--primary-bg)]" />}
                          </button>
                       ))}
                       {(!business?.branches?.length) && (
                          <button onClick={() => { setActiveBranchId('main'); setIsBranchMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-[color:var(--ghost-hover-bg)] transition-colors text-left">
                             <span>Sucursal Central</span>
                             {activeBranchId === 'main' && <Check size={14} className="text-[color:var(--primary-bg)]" />}
                          </button>
                       )}
                    </div>
                 </div>
              )}
           </div>
        )}
      </div>

      {/* --- NAVIGATION SECTIONS --- */}
      <nav className={`flex-1 w-full flex flex-col gap-4 px-1 m-0 pb-4 ${collapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
         {SECTION_CONFIG.map((section, index) => {
            const sectionItems = NAVIGATION_ITEMS.filter(item => section.match.includes(item.name))
            if (sectionItems.length === 0) return null

            const isExpanded = expandedSections.includes(section.title)
            
            // If collapsed sidebar, show items flat without headers
            if (collapsed) {
               return (
                  <div key={section.title} className="flex flex-col gap-1 items-center w-full">
                     {sectionItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.to)
                        const isPedidos = item.name === 'Pedidos'
                        
                        return (
                           <NavLink
                              key={item.name}
                              to={item.to}
                              className={`
                                 group relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200
                                 ${isActive 
                                    ? isPedidos
                                       ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                       : 'bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)]' 
                                    : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)]'
                                 }
                              `}
                           >
                              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                              
                              {/* Floating Tooltip */}
                              <div className="absolute left-[calc(100%+10px)] px-2.5 py-1 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-bold rounded-md opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-[100] shadow-xl border border-white/10 dark:border-black/10">
                                 {item.name}
                                 {/* Triangle arrow */}
                                 <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-100" />
                              </div>
                           </NavLink>
                        )
                     })}
                     {/* Divider in collapsed mode */}
                     {index < SECTION_CONFIG.length - 1 && (
                        <div className="w-1 h-1 rounded-full bg-[color:var(--border)] opacity-50 my-1.5" />
                     )}
                  </div>
               )
            }

            // Expanded Sidebar Layout
            return (
               <div key={section.title} className="flex flex-col">
                  {/* Divider for expanded mode */}
                  {index > 0 && (
                     <div className="mx-2 mb-2 h-px bg-[color:var(--border)] opacity-40" />
                  )}

                  {/* Section Header */}
                  <button 
                     onClick={() => toggleSection(section.title)}
                     className="flex items-center justify-between px-2 py-0.5 mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors opacity-80 hover:opacity-100 group"
                  >
                     {section.title}
                     <ChevronDown 
                        size={10} 
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'} opacity-0 group-hover:opacity-100`} 
                     />
                  </button>
                  
                  {/* Section Items */}
                  <div className={`flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                     {sectionItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.to)
                        const isPedidos = item.name === 'Pedidos'
                        
                        return (
                           <NavLink
                              key={item.name}
                              to={item.to}
                              className={`
                                 group relative flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200
                                 ${isActive 
                                    ? isPedidos
                                       ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold' 
                                       : 'bg-[color:var(--primary-bg)]/10 text-[color:var(--primary-bg)] font-bold'
                                    : 'text-[color:var(--muted)] hover:bg-[color:var(--ghost-hover-bg)] hover:text-[color:var(--text)] font-medium'
                                 }
                              `}
                           >
                              <item.icon 
                                 size={16} 
                                 strokeWidth={isActive ? 2.5 : 2}
                                 className={isActive ? (isPedidos ? 'text-indigo-600 dark:text-indigo-400' : 'text-[color:var(--primary-bg)]') : 'group-hover:text-[color:var(--text)] transition-colors duration-200'}
                              />
                              
                              <span className="text-xs tracking-tight">
                                 {item.name}
                              </span>

                              {isPedidos && (
                                 <span className={`ml-auto text-[8px] font-extrabold px-1 py-0.5 rounded shadow-sm ${
                                    isActive 
                                       ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none' 
                                       : 'bg-[color:var(--border)] text-[color:var(--muted)]'
                                 }`}>
                                    POS
                                 </span>
                              )}
                           </NavLink>
                        )
                     })}
                  </div>
               </div>
            )
         })}
      </nav>

      {/* --- FOOTER / USER --- */}
      {!collapsed && (
         <div className="mt-auto px-1 pt-4 border-t border-[color:var(--border)]">
             <div className="p-3 rounded-xl bg-[color:var(--card-bg)] border border-[color:var(--border)] shadow-sm flex items-center gap-3">
               <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 border border-[color:var(--border)]" />
               <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[color:var(--text)]">Usuario</span>
                  <span className="text-[10px] text-[color:var(--muted)]">Admin</span>
               </div>
             </div>
         </div>
      )}
    </aside>
  )
}
