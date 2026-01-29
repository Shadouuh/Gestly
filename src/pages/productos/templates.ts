export interface TemplateItem {
  nombre: string
  categoria: string
  unidad: string
  priceCents: number
  costCents: number
  stock: number | null
  trackStock: boolean
  disponible: boolean
  imageUrl?: string
  isIngredient?: boolean
  recipe?: { ingredientName: string; quantity: number }[] // We use name for templates as IDs are not generated yet
}

export interface Template {
  id: string
  name: string
  description: string
  items: TemplateItem[]
}

export interface Rubro {
  id: string
  name: string
  icon: string
  templates: Template[]
}

export const RUBROS: Rubro[] = [
  {
    id: 'kiosco',
    name: 'Kiosco',
    icon: 'Store',
    templates: [
      {
        id: 'kiosco-argentino',
        name: 'Kiosco Argentino Completo',
        description: 'Catálogo completo con precios y marcas típicas de Argentina.',
        items: [
          // Galletitas Dulces
          { nombre: 'Mantecadas Bimbo', categoria: 'Galletitas Dulces', unidad: 'u', priceCents: 120000, costCents: 80000, stock: 10, trackStock: true, disponible: true, imageUrl: 'https://m.media-amazon.com/images/I/91+jXw-C+RL._SL1500_.jpg' },
          { nombre: 'Mana Vainilla', categoria: 'Galletitas Dulces', unidad: 'u', priceCents: 80000, costCents: 50000, stock: 15, trackStock: true, disponible: true, imageUrl: 'https://arcorencasa.com/wp-content/uploads/2021/04/20210419-1000547461_01.jpg' },
          { nombre: 'Oreo Clásica', categoria: 'Galletitas Dulces', unidad: 'u', priceCents: 140000, costCents: 90000, stock: 20, trackStock: true, disponible: true, imageUrl: 'https://www.capsularium.com/4925-large_default/galletas-oreo-clasicas-caja-de-20-paquetes-de-6-galletas-cada-uno-formato-ahorro.jpg' },
          { nombre: '9 de Oro Dulces', categoria: 'Galletitas Dulces', unidad: 'u', priceCents: 110000, costCents: 70000, stock: 12, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/582963/Galletitas-Dulces-9-De-Oro-200-Gr-1-23653.jpg' },
          { nombre: 'Pepitos', categoria: 'Galletitas Dulces', unidad: 'u', priceCents: 140000, costCents: 90000, stock: 10, trackStock: true, disponible: true, imageUrl: 'https://www.distribuidorapop.com.ar/wp-content/uploads/2020/05/pepitos-118.jpg' },
          
          // Galletitas Saladas
          { nombre: 'Don Satur Grasa', categoria: 'Galletitas Saladas', unidad: 'u', priceCents: 95000, costCents: 60000, stock: 24, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/582937/Bizcochos-De-Grasa-Don-Satur-200-Gr-1-23652.jpg' },
          { nombre: 'Don Satur Queso', categoria: 'Galletitas Saladas', unidad: 'u', priceCents: 100000, costCents: 65000, stock: 24, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/582935/Bizcochos-Con-Queso-Don-Satur-140-Gr-1-23648.jpg' },
          { nombre: '9 de Oro Saladas', categoria: 'Galletitas Saladas', unidad: 'u', priceCents: 100000, costCents: 65000, stock: 15, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/582965/Bizcochos-Salados-9-De-Oro-200-Gr-1-23655.jpg' },
          
          // Golosinas
          { nombre: 'Bon o Bon Oblea', categoria: 'Golosinas', unidad: 'u', priceCents: 60000, costCents: 35000, stock: 30, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/536130/Oblea-Bon-O-Bon-30-Gr-1-4190.jpg' },
          { nombre: 'Bananita Dolca', categoria: 'Golosinas', unidad: 'u', priceCents: 50000, costCents: 30000, stock: 25, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/536214/Bananita-Dolca-30-Gr-1-4328.jpg' },
          { nombre: 'Topline', categoria: 'Golosinas', unidad: 'u', priceCents: 50000, costCents: 30000, stock: 50, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/703290/Chicles-Topline-Seven-Menta-Strong-14-Gr-1-851545.jpg' },
          
          // Alfajores
          { nombre: 'Guaymallén Simple', categoria: 'Alfajores', unidad: 'u', priceCents: 60000, costCents: 35000, stock: 48, trackStock: true, disponible: true, imageUrl: 'https://theargentino.com/cdn/shop/products/Guaymallen_Chocolate_Alfajor_1024x1024.jpg' },
          { nombre: 'Alfajor Fulbito', categoria: 'Alfajores', unidad: 'u', priceCents: 45000, costCents: 25000, stock: 30, trackStock: true, disponible: true, imageUrl: 'https://www.distribuidorapop.com.ar/wp-content/uploads/2021/06/fulbito-mani.jpg' },
          
          // Bebidas
          { nombre: 'Coca-Cola 500ml', categoria: 'Bebidas', unidad: 'u', priceCents: 140000, costCents: 90000, stock: 24, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/664972/Gaseosa-Coca-Cola-Sabor-Original-500-Ml-1-246087.jpg' },
          { nombre: 'Sprite 500ml', categoria: 'Bebidas', unidad: 'u', priceCents: 140000, costCents: 90000, stock: 12, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/770176/Gaseosa-Sprite-Lima-Limon-500-Cc-1-246088.jpg' },
          
          // Tabaquería
          { nombre: 'Papelillos OCB', categoria: 'Tabaquería', unidad: 'u', priceCents: 60000, costCents: 30000, stock: 50, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/601633/Papel-Ocb-Premium-N-1-1-878580.jpg' },
          { nombre: 'Encendedor Bic', categoria: 'Tabaquería', unidad: 'u', priceCents: 120000, costCents: 70000, stock: 30, trackStock: true, disponible: true, imageUrl: 'https://jumboargentina.vtexassets.com/arquivos/ids/552081/Encendedor-Bic-Maxi-Color-1-Un-1-470050.jpg' },
        ]
      },
      {
        id: 'kiosco-basico',
        name: 'Kiosco Básico',
        description: 'Productos esenciales para un kiosco pequeño.',
        items: [
          { nombre: 'Galletitas Variadas', categoria: 'Galletitas', unidad: 'u', priceCents: 100000, costCents: 60000, stock: 20, trackStock: true, disponible: true },
          { nombre: 'Chocolates', categoria: 'Golosinas', unidad: 'u', priceCents: 150000, costCents: 90000, stock: 15, trackStock: true, disponible: true },
          { nombre: 'Gaseosas 500ml', categoria: 'Bebidas', unidad: 'u', priceCents: 120000, costCents: 70000, stock: 24, trackStock: true, disponible: true },
          { nombre: 'Cigarrillos', categoria: 'Kiosco', unidad: 'u', priceCents: 250000, costCents: 230000, stock: null, trackStock: false, disponible: true },
        ]
      }
    ]
  },
  {
    id: 'almacen',
    name: 'Almacén',
    icon: 'ShoppingBasket',
    templates: [
      {
        id: 'almacen-completo',
        name: 'Almacén Completo',
        description: 'Surtido amplio de productos de almacén.',
        items: [
          { nombre: 'Leche Larga Vida 1L', categoria: 'Lácteos', unidad: 'u', priceCents: 140000, costCents: 90000, stock: 24, trackStock: true, disponible: true },
          { nombre: 'Harina 000 1kg', categoria: 'Almacén', unidad: 'u', priceCents: 110000, costCents: 70000, stock: 20, trackStock: true, disponible: true },
          { nombre: 'Arroz Largo Fino 1kg', categoria: 'Almacén', unidad: 'u', priceCents: 150000, costCents: 100000, stock: 15, trackStock: true, disponible: true },
          { nombre: 'Fideos Spaghetti 500g', categoria: 'Almacén', unidad: 'u', priceCents: 130000, costCents: 80000, stock: 20, trackStock: true, disponible: true },
          { nombre: 'Aceite Girasol 900ml', categoria: 'Almacén', unidad: 'u', priceCents: 350000, costCents: 250000, stock: 12, trackStock: true, disponible: true },
          { nombre: 'Yerba Mate 500g', categoria: 'Almacén', unidad: 'u', priceCents: 240000, costCents: 180000, stock: 10, trackStock: true, disponible: true },
          { nombre: 'Azúcar 1kg', categoria: 'Almacén', unidad: 'u', priceCents: 120000, costCents: 80000, stock: 15, trackStock: true, disponible: true },
          { nombre: 'Puré de Tomate 520g', categoria: 'Almacén', unidad: 'u', priceCents: 90000, costCents: 50000, stock: 18, trackStock: true, disponible: true },
        ]
      }
    ]
  },
  {
    id: 'cafeteria',
    name: 'Cafetería',
    icon: 'Coffee',
    templates: [
      {
        id: 'cafeteria-basica',
        name: 'Cafetería Básica',
        description: 'Menú estándar de cafetería.',
        items: [
          { nombre: 'Café Espresso', categoria: 'Cafetería', unidad: 'u', priceCents: 180000, costCents: 40000, stock: null, trackStock: false, disponible: true },
          { nombre: 'Café con Leche', categoria: 'Cafetería', unidad: 'u', priceCents: 220000, costCents: 60000, stock: null, trackStock: false, disponible: true },
          { nombre: 'Medialuna de Manteca', categoria: 'Panadería', unidad: 'u', priceCents: 60000, costCents: 20000, stock: 48, trackStock: true, disponible: true },
          { nombre: 'Tostado Jamón y Queso', categoria: 'Comidas', unidad: 'u', priceCents: 350000, costCents: 150000, stock: null, trackStock: false, disponible: true },
          { nombre: 'Jugo de Naranja Expr.', categoria: 'Bebidas', unidad: 'u', priceCents: 300000, costCents: 100000, stock: null, trackStock: false, disponible: true },
        ]
      }
    ]
  },
  {
    id: 'panaderia',
    name: 'Panadería',
    icon: 'Croissant',
    templates: [
      {
        id: 'panaderia-tradicional',
        name: 'Panadería Tradicional',
        description: 'Productos frescos de panadería.',
        items: [
          { nombre: 'Pan Francés x Kg', categoria: 'Panadería', unidad: 'kg', priceCents: 180000, costCents: 60000, stock: null, trackStock: false, disponible: true },
          { nombre: 'Facturas Docena', categoria: 'Panadería', unidad: 'u', priceCents: 480000, costCents: 150000, stock: null, trackStock: false, disponible: true },
          { nombre: 'Pan de Miga x Kg', categoria: 'Panadería', unidad: 'kg', priceCents: 350000, costCents: 120000, stock: null, trackStock: false, disponible: true },
          { nombre: 'Chipá x 100g', categoria: 'Panadería', unidad: 'u', priceCents: 150000, costCents: 50000, stock: null, trackStock: false, disponible: true },
        ]
      }
    ]
  },
  {
    id: 'confiteria',
    name: 'Confitería',
    icon: 'CakeSlice',
    templates: [
      {
        id: 'confiteria-dulce',
        name: 'Confitería & Pastelería',
        description: 'Tortas, masas y dulces.',
        items: [
          { nombre: 'Torta de Chocolate (Porción)', categoria: 'Pastelería', unidad: 'u', priceCents: 350000, costCents: 120000, stock: 12, trackStock: true, disponible: true },
          { nombre: 'Lemon Pie (Porción)', categoria: 'Pastelería', unidad: 'u', priceCents: 320000, costCents: 110000, stock: 12, trackStock: true, disponible: true },
          { nombre: 'Masas Finas x Kg', categoria: 'Pastelería', unidad: 'kg', priceCents: 850000, costCents: 300000, stock: null, trackStock: false, disponible: true },
        ]
      }
    ]
  },
  {
    id: 'hamburgueseria',
    name: 'Hamburguesería',
    icon: 'Utensils',
    templates: [
      {
        id: 'menu-hamburguesas',
        name: 'Menú de Hamburguesas',
        description: 'Hamburguesas, papas fritas y bebidas.',
        items: [
          { nombre: 'Hamburguesa Simple', categoria: 'Hamburguesas', unidad: 'u', priceCents: 450000, costCents: 200000, stock: 50, trackStock: true, disponible: true },
          { nombre: 'Hamburguesa Completa', categoria: 'Hamburguesas', unidad: 'u', priceCents: 600000, costCents: 300000, stock: 50, trackStock: true, disponible: true },
          { nombre: 'Hamburguesa Doble Queso', categoria: 'Hamburguesas', unidad: 'u', priceCents: 750000, costCents: 350000, stock: 40, trackStock: true, disponible: true },
          { nombre: 'Papas Fritas Medianas', categoria: 'Guarnición', unidad: 'u', priceCents: 300000, costCents: 100000, stock: 100, trackStock: true, disponible: true },
          { nombre: 'Papas Fritas Grandes', categoria: 'Guarnición', unidad: 'u', priceCents: 450000, costCents: 150000, stock: 100, trackStock: true, disponible: true },
          { nombre: 'Nuggets de Pollo x6', categoria: 'Pollo', unidad: 'u', priceCents: 400000, costCents: 180000, stock: 60, trackStock: true, disponible: true },
          { nombre: 'Pancho Clásico', categoria: 'Panchos', unidad: 'u', priceCents: 250000, costCents: 100000, stock: 50, trackStock: true, disponible: true },
          { nombre: 'Gaseosa Cola 500ml', categoria: 'Bebidas', unidad: 'u', priceCents: 200000, costCents: 120000, stock: 48, trackStock: true, disponible: true },
          { nombre: 'Cerveza Lata 473ml', categoria: 'Bebidas', unidad: 'u', priceCents: 300000, costCents: 180000, stock: 48, trackStock: true, disponible: true },
        ]
      }
    ]
  },
  {
    id: 'libreria',
    name: 'Librería',
    icon: 'BookOpen',
    templates: [
      {
        id: 'libreria-escolar',
        name: 'Librería Escolar',
        description: 'Útiles escolares básicos.',
        items: [
          { nombre: 'Cuaderno Tapa Dura 48h', categoria: 'Escolar', unidad: 'u', priceCents: 450000, costCents: 250000, stock: 20, trackStock: true, disponible: true },
          { nombre: 'Lápiz Negro HB', categoria: 'Escritura', unidad: 'u', priceCents: 80000, costCents: 30000, stock: 50, trackStock: true, disponible: true },
          { nombre: 'Birome Azul', categoria: 'Escritura', unidad: 'u', priceCents: 120000, costCents: 50000, stock: 50, trackStock: true, disponible: true },
          { nombre: 'Goma de Borrar', categoria: 'Escolar', unidad: 'u', priceCents: 50000, costCents: 15000, stock: 30, trackStock: true, disponible: true },
          { nombre: 'Resaltador', categoria: 'Escritura', unidad: 'u', priceCents: 180000, costCents: 80000, stock: 24, trackStock: true, disponible: true },
        ]
      }
    ]
  },
  {
    id: 'ferreteria',
    name: 'Ferretería',
    icon: 'Hammer',
    templates: [
      {
        id: 'ferreteria-hogar',
        name: 'Ferretería Hogar',
        description: 'Herramientas y repuestos básicos.',
        items: [
          { nombre: 'Cinta Aisladora', categoria: 'Electricidad', unidad: 'u', priceCents: 150000, costCents: 60000, stock: 20, trackStock: true, disponible: true },
          { nombre: 'Tornillos Variados (bolsa)', categoria: 'Fijaciones', unidad: 'u', priceCents: 120000, costCents: 40000, stock: 50, trackStock: true, disponible: true },
          { nombre: 'Destornillador Phillips', categoria: 'Herramientas', unidad: 'u', priceCents: 350000, costCents: 180000, stock: 10, trackStock: true, disponible: true },
          { nombre: 'Martillo', categoria: 'Herramientas', unidad: 'u', priceCents: 650000, costCents: 350000, stock: 5, trackStock: true, disponible: true },
          { nombre: 'Pegamento Instantáneo', categoria: 'Adhesivos', unidad: 'u', priceCents: 200000, costCents: 90000, stock: 15, trackStock: true, disponible: true },
        ]
      }
    ]
  }
]
