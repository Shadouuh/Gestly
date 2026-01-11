import { LandingHeader } from './components/LandingHeader'
import { HeroSection } from './components/HeroSection'
import { WhatIsSection } from './components/WhatIsSection'
import { FeaturesSection } from './components/FeaturesSection'
import { PricingSection } from './components/PricingSection'
import { CtaSection } from './components/CtaSection'
import { LandingFooter } from './components/LandingFooter'
import { useLanding } from './hooks/useLanding'
import type { LandingData } from '@shared/services/landingService'

const fallbackLandingData: LandingData = {
  heroBadge: 'Gestión minimal, diseñada para uso diario.',
  heroTitle: 'Control claro para tu negocio.',
  heroSubtitle: 'Ventas, inventario y reportes con una interfaz simple, consistente y sin ruido.',
  highlights: ['Ventas rápidas', 'Stock claro', 'Reportes legibles'],
  stats: { todaySales: 185000, soldItems: 42, activeBusinesses: 128 },
  recentSales: [
    { id: 1, name: 'Venta mostrador', amount: 12400 },
    { id: 2, name: 'Pago Mercado Pago', amount: 38900 },
    { id: 3, name: 'Fiado · Cliente', amount: 6700 },
  ],
  whatIsCards: [
    { id: 1, title: 'POS en minutos', description: 'Armá pedidos, cobrá y registrá ventas rápido.' },
    { id: 2, title: 'Stock ordenado', description: 'Productos, categorías y control simple por disponibilidad.' },
    { id: 3, title: 'Reportes útiles', description: 'Ingresos, fiados y estadísticas con foco en lo importante.' },
  ],
  steps: [
    { id: 1, title: 'Creá tu cuenta', description: 'Ingresá tu negocio y usuarios.' },
    { id: 2, title: 'Cargá productos', description: 'Listo para vender en minutos.' },
    { id: 3, title: 'Vendé y analizá', description: 'Historial, fiados y estadísticas claras.' },
  ],
  features: [
    { id: 1, title: 'Pedidos y cobro', description: 'Carrito, pago y fiados en un flujo rápido.' },
    { id: 2, title: 'Ventas y fiados', description: 'Historial por período y seguimiento de cuentas pendientes.' },
    { id: 3, title: 'Estadísticas', description: 'Resumen de ingresos y productos más vendidos.' },
  ],
  plans: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'mes',
      description: 'Para empezar sin fricción.',
      cta: 'Empezar gratis',
      variant: 'outline',
      items: ['POS y ventas', 'Stock básico', 'Reportes básicos'],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 6,
      period: 'mes',
      description: 'Para operar todos los días.',
      cta: 'Elegir Basic',
      variant: 'outline',
      items: ['Ventas ilimitadas', 'Fiados incluidos', 'Reportes avanzados'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 13.99,
      period: 'mes',
      description: 'Para el máximo control del local.',
      cta: 'Elegir Pro',
      variant: 'primary',
      badge: 'Recomendado',
      items: ['Usuarios ilimitados', 'Sucursales ilimitadas', 'Soporte 24/7'],
    },
  ],
  ctaTitle: 'Empezá hoy',
  ctaSubtitle: 'Probá Gestly con datos reales y una interfaz hecha para trabajar sin fricción.',
  footer: {
    tagline: 'Gestión clara para negocios reales.',
    links: { producto: ['Características', 'Precios', 'Seguridad'], recursos: ['Guías', 'Soporte', 'Actualizaciones'], empresa: ['Nosotros', 'Contacto', 'Términos'] },
  },
}

export function LandingPage() {
  const landingState = useLanding()
  const data = landingState.status === 'success' ? landingState.data : fallbackLandingData

  return (
    <div className="min-h-full bg-[color:var(--app-bg)] text-[color:var(--text)]">
      <LandingHeader />
      <HeroSection data={data} />
      <WhatIsSection data={data} />
      <FeaturesSection data={data} />
      <PricingSection data={data} />
      <CtaSection data={data} />
      <LandingFooter tagline={data.footer.tagline} links={data.footer.links} />
    </div>
  )
}
