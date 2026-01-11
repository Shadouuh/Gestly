import { fetchJson } from './http'

export type LandingData = {
  heroBadge: string
  heroTitle: string
  heroSubtitle: string
  highlights: string[]
  stats: {
    todaySales: number
    soldItems: number
    activeBusinesses: number
  }
  recentSales: Array<{ id: number; name: string; amount: number }>
  whatIsCards: Array<{ id: number; title: string; description: string }>
  steps: Array<{ id: number; title: string; description: string }>
  features: Array<{ id: number; title: string; description: string }>
  plans: Array<{
    id: string
    name: string
    price: number
    period: string
    description: string
    cta: string
    variant: 'primary' | 'outline'
    badge?: string
    items: string[]
  }>
  ctaTitle: string
  ctaSubtitle: string
  footer: {
    tagline: string
    links: Record<string, string[]>
  }
}

export async function getLanding() {
  return fetchJson<LandingData>('/api/landing')
}

