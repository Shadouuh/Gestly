import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

import { Header } from '@shared/components/Dashboard/Header'
import { MobileHeader } from '@shared/components/Dashboard/MobileHeader'
import { MobileNav } from '@shared/components/Dashboard/MobileNav'
import { Sidebar } from '@shared/components/Dashboard/Sidebar'
import { ToastViewport } from '@shared/components/Dashboard/ToastViewport'
import { useUiStore } from '@shared/stores/uiStore'
import { CartFab } from './CartFab'

export function AppLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[color:var(--app-bg)] !m-0 !p-0 text-[color:var(--text)] transition-colors duration-300 font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0" 
           style={{ 
             backgroundImage: 'var(--app-bg-image)', 
             backgroundSize: 'var(--app-bg-size)',
             backgroundPosition: 'var(--app-bg-position)'
           }} 
      />

      <Sidebar />
      
      <div className={`flex-1 flex flex-col h-full relative z-10 transition-all duration-300 ease-in-out ${collapsed ? 'md:pl-[70px]' : 'md:pl-64'}`}>
        <div className="hidden md:block">
           <Header />
        </div>
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 md:p-0 relative scroll-smooth pt-16 md:pt-0 pb-0 md:pb-0">
           <Outlet />
        </main>
      </div>

      <MobileNav />
      <ToastViewport />
      <CartFab />
    </div>
  )
}
