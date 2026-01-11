import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

import { MobileHeader } from '@shared/components/Dashboard/MobileHeader'
import { MobileNav } from '@shared/components/Dashboard/MobileNav'
import { Sidebar } from '@shared/components/Dashboard/Sidebar'
import { ToastViewport } from '@shared/components/Dashboard/ToastViewport'
import { useUiStore } from '@shared/stores/uiStore'

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
    <div className="h-screen overflow-hidden bg-transparent text-[color:var(--text)]">
      <Sidebar />
      <MobileHeader />
      <MobileNav />

      <main
        className={[
          'h-full pb-16 pt-14 md:pb-0 md:pt-0',
          collapsed ? 'md:ml-16' : 'md:ml-60',
        ].join(' ')}
      >
        <div className="h-full md:overflow-hidden md:bg-[color:var(--card-bg)]">
          <Outlet />
        </div>
      </main>

      <ToastViewport />
    </div>
  )
}
