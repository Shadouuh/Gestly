import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { MobileHeader } from "@/components/mobile-header"
import { ProtectedRoute } from "@/components/protected-route"
import { ThemeProvider } from "@/lib/theme"
import { ToastProvider } from "@/components/toast-container"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <ProtectedRoute>
        <ToastProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <MobileHeader />
            <MobileNav />

            <main className="md:ml-32 md:mr-6 md:my-6 pt-16 pb-24 md:pt-0 md:pb-0">
              <div className="md:bg-card md:rounded-3xl md:shadow-lg md:border md:border-border/50 md:overflow-hidden h-full md:h-[calc(100vh-3rem)]">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </ProtectedRoute>
    </ThemeProvider>
  )
}
