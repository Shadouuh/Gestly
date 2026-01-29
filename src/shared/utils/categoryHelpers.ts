import { 
  Cookie, Candy, Beer, GlassWater, Flame, Sparkles, Home, Package,
  Utensils
} from 'lucide-react'
import { animations } from '../../assets/lottie/animations'

// --- Assets ---
import BurgerImg from '../../assets/Icons/Burger_Final.png'
import DonutImg from '../../assets/Icons/Donut.png'
import DrumstickImg from '../../assets/Icons/Drumstick.png'
import FriesImg from '../../assets/Icons/Fries.png'
import GlassDrinkImg from '../../assets/Icons/Glass_Drink.png'
import HotDogImg from '../../assets/Icons/Hot Dog.png'
import SandwichImg from '../../assets/Icons/Sandwich.png'
import SodaCanImg from '../../assets/Icons/Soda_Can.png'
import SodaCupImg from '../../assets/Icons/Soda_Cup.png'

export function simpleHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0
  return Math.abs(hash)
}

export function getCategoryColor(category: string) {
  const categoryKey = (category || '').trim().toLowerCase()
  const accentIdx = categoryKey ? simpleHash(categoryKey) % 6 : 0
  const colors = [
    '#0a84ff', // 0 Blue
    '#30d158', // 1 Green
    '#ff2d55', // 2 Red
    '#ffd60a', // 3 Yellow
    '#7d5cff', // 4 Purple
    '#34c759', // 5 Green (Variant)
  ]
  return colors[accentIdx]
}

export function getCategoryIcon(category: string) {
  const c = (category || '').toLowerCase()
  if (c.includes('galletita') || c.includes('dulce')) return Cookie
  if (c.includes('golosina') || c.includes('alfajor') || c.includes('chicle')) return Candy
  if (c.includes('cerveza') || c.includes('alcohol') || c.includes('vino') || c.includes('fernet') || c.includes('whisky')) return Beer
  if (c.includes('bebida') || c.includes('jugo') || c.includes('gaseosa')) return GlassWater
  if (c.includes('tabaquer') || c.includes('cigarri')) return Flame
  if (c.includes('higiene') || c.includes('perfum')) return Sparkles
  if (c.includes('hogar') || c.includes('limpieza')) return Home
  if (c.includes('hamburguesa') || c.includes('burger') || c.includes('comida')) return Utensils
  return Package
}

export function getCategoryAnimation(category: string) {
  const c = (category || '').toLowerCase()
  if (c.includes('azucar') || c.includes('sugar') || c.includes('dulce')) return animations.sugar
  if (c.includes('harina') || c.includes('flour')) return animations.flour
  if (c.includes('pan') || c.includes('bread') || c.includes('factura') || c.includes('medialuna')) return animations.bread
  if (c.includes('chipa') || c.includes('queso')) return animations.chipa
  if (c.includes('yerba') || c.includes('mate')) return animations.yerba
  return null
}

export function getCategoryPng(category: string) {
  const c = (category || '').toLowerCase()
  if (c.includes('hamburguesa') || c.includes('burger')) return BurgerImg
  if (c.includes('dona') || c.includes('donut') || c.includes('rosquilla')) return DonutImg
  if (c.includes('pollo') || c.includes('chicken') || c.includes('alita') || c.includes('patita')) return DrumstickImg
  if (c.includes('papas') || c.includes('fritas') || c.includes('fries') || c.includes('guarnicion')) return FriesImg
  if (c.includes('trago') || c.includes('copa') || c.includes('cocktail') || c.includes('vino') || c.includes('alcohol')) return GlassDrinkImg
  if (c.includes('pancho') || c.includes('hot dog') || c.includes('hotdog') || c.includes('perro')) return HotDogImg
  if (c.includes('sandwich') || c.includes('sanguche') || c.includes('tostado')) return SandwichImg
  if (c.includes('lata') || c.includes('coca') || c.includes('sprite') || c.includes('pepsi')) return SodaCanImg
  if (c.includes('gaseosa') || c.includes('refresco') || c.includes('jugo') || c.includes('bebida')) return SodaCupImg
  return null
}
