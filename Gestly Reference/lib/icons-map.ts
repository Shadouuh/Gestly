import {
  Beer,
  Candy,
  Coffee,
  Cookie,
  Croissant,
  Milk,
  Pizza,
  Sandwich,
  Apple,
  Beef,
  CakeSlice,
  Cherry,
  Citrus,
  Egg,
  Fish,
  IceCream,
  Salad,
  Soup,
  type LucideIcon,
  Shirt,
  ShoppingBag,
  Watch,
  Glasses,
  Footprints,
  Package,
  Layers,
} from "lucide-react"

type CategoryIconMap = {
  [key: string]: LucideIcon
}

export const categoryIcons: CategoryIconMap = {
  // Almacén General
  Bebidas: Beer,
  Golosinas: Candy,
  Lácteos: Milk,
  Panadería: Croissant,
  Snacks: Cookie,
  Galletas: Cookie,
  Dulces: CakeSlice,
  Gaseosas: Coffee,

  // Comida/Restaurante
  Entradas: Salad,
  "Platos principales": Pizza,
  Postres: IceCream,
  Bebidas: Coffee,
  Sandwiches: Sandwich,
  Sopas: Soup,
  Ensaladas: Salad,
  Pizza: Pizza,

  // Carnicería
  Carne: Beef,
  Pollo: Beef,
  Cerdo: Beef,
  Pescado: Fish,
  Embutidos: Sandwich,
  Vísceras: Beef,

  // Ropa
  Remeras: Shirt,
  Pantalones: ShoppingBag,
  Buzos: Shirt,
  Camisas: Shirt,
  Zapatos: Footprints,
  Zapatillas: Footprints,
  Accesorios: Watch,
  Anteojos: Glasses,

  // Frutas y Verduras
  Frutas: Apple,
  Verduras: Salad,
  Cítricos: Citrus,
  Frutillas: Cherry,
  Huevos: Egg,

  // Default
  Otros: Package,
  General: Layers,
}

export function getCategoryIcon(category: string): LucideIcon {
  return categoryIcons[category] || Package
}
