import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@shared/components/AppLayout/AppLayout'
import { LandingPage } from '@pages/landing'
import { LoginPage } from '@pages/login'
import { PedidosPage } from '@pages/pedidos'
import { VentasPage } from '@pages/ventas'
import { ConfiguracionPage } from '@pages/configuracion'
import { ProductosPage } from '@pages/productos'
import { TemasPage } from '@pages/temas'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="pedidos" replace />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="ventas" element={<VentasPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="temas" element={<TemasPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
