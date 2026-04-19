import { 
  Wine, 
  Beer, 
  Coffee,
  Milk,
  Droplets,
  Sparkles,
  SprayCan,
  Scissors,
  Paintbrush,
  Heart,
  Pill,
  Thermometer,
  Bandage,
  Baby,
  Cookie,
  Candy,
  IceCream2,
  Pizza,
  Sandwich,
  Apple,
  Carrot,
  Beef,
  Fish,
  Egg,
  Croissant,
  Cake,
  Soup,
  Utensils,
  Wheat,
  Package,
  Refrigerator,
  Flame,
  Snowflake,
  ShoppingBag,
  Home,
  Lightbulb,
  Zap,
  Shirt,
  Watch,
  Footprints,
  Glasses,
  Cigarette,
  Newspaper,
  BookOpen,
  Gamepad2,
  Dog,
  Cat,
  Flower2,
  Wrench,
  Hammer,
  PaintBucket,
  Car,
  Bike,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Printer,
  Battery,
  Plug,
  WashingMachine,
  Wind,
  Fan,
  Flame as Heater,
  Drumstick,
  Bolt,
  Zap as Electric
} from 'lucide-react';

export const productCategories = [
  // BEBIDAS
  {
    id: 'bebidas-alcoholicas',
    name: 'Bebidas Alcohólicas',
    icon: Wine,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    subcategories: [
      { id: 'vinos', name: 'Vinos', icon: Wine },
      { id: 'cervezas', name: 'Cervezas', icon: Beer },
      { id: 'licores', name: 'Licores y Destilados', icon: Wine },
      { id: 'aperitivos', name: 'Aperitivos', icon: Wine }
    ]
  },
  {
    id: 'bebidas-sin-alcohol',
    name: 'Bebidas sin Alcohol',
    icon: Droplets,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    subcategories: [
      { id: 'gaseosas', name: 'Gaseosas', icon: Droplets },
      { id: 'jugos', name: 'Jugos', icon: Apple },
      { id: 'aguas', name: 'Aguas', icon: Droplets },
      { id: 'energizantes', name: 'Energizantes', icon: Zap },
      { id: 'te-cafe', name: 'Té y Café', icon: Coffee }
    ]
  },

  // LÁCTEOS
  {
    id: 'lacteos',
    name: 'Lácteos',
    icon: Milk,
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    subcategories: [
      { id: 'leche', name: 'Leche', icon: Milk },
      { id: 'yogures', name: 'Yogures', icon: Milk },
      { id: 'quesos', name: 'Quesos', icon: Milk },
      { id: 'manteca-margarina', name: 'Manteca y Margarina', icon: Milk },
      { id: 'cremas', name: 'Cremas', icon: Milk },
      { id: 'postres-lacteos', name: 'Postres Lácteos', icon: IceCream2 }
    ]
  },

  // CUIDADO PERSONAL E HIGIENE
  {
    id: 'cuidado-cabello',
    name: 'Cuidado del Cabello',
    icon: Sparkles,
    color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400',
    subcategories: [
      { id: 'shampoo', name: 'Shampoo', icon: Droplets },
      { id: 'acondicionador', name: 'Acondicionador', icon: Sparkles },
      { id: 'tratamientos-capilares', name: 'Tratamientos Capilares', icon: Sparkles },
      { id: 'tinturas', name: 'Tinturas', icon: Paintbrush },
      { id: 'fijadores', name: 'Fijadores y Gel', icon: SprayCan }
    ]
  },
  {
    id: 'cuidado-piel',
    name: 'Cuidado de la Piel',
    icon: Heart,
    color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400',
    subcategories: [
      { id: 'cremas-corporales', name: 'Cremas Corporales', icon: Heart },
      { id: 'cremas-faciales', name: 'Cremas Faciales', icon: Sparkles },
      { id: 'protectores-solares', name: 'Protectores Solares', icon: Heart },
      { id: 'jabones', name: 'Jabones', icon: Droplets },
      { id: 'exfoliantes', name: 'Exfoliantes', icon: Sparkles }
    ]
  },
  {
    id: 'higiene-personal',
    name: 'Higiene Personal',
    icon: SprayCan,
    color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400',
    subcategories: [
      { id: 'desodorantes', name: 'Desodorantes', icon: SprayCan },
      { id: 'pasta-dental', name: 'Pasta Dental', icon: Sparkles },
      { id: 'cepillos-dental', name: 'Cepillos Dentales', icon: Paintbrush },
      { id: 'enjuagues', name: 'Enjuagues Bucales', icon: Droplets },
      { id: 'papel-higienico', name: 'Papel Higiénico', icon: Package },
      { id: 'toallas-femeninas', name: 'Toallas Femeninas', icon: Heart },
      { id: 'cuidado-personal', name: 'Cuidado Personal', icon: Heart }
    ]
  },
  {
    id: 'afeitado',
    name: 'Afeitado y Depilación',
    icon: Scissors,
    color: 'text-slate-600 bg-slate-200 dark:bg-slate-700/50 dark:text-slate-300',
    subcategories: [
      { id: 'maquinitas-afeitar', name: 'Maquinitas de Afeitar', icon: Scissors },
      { id: 'espuma-afeitar', name: 'Espuma de Afeitar', icon: SprayCan },
      { id: 'aftershave', name: 'After Shave', icon: Droplets },
      { id: 'ceras-depilatorias', name: 'Ceras Depilatorias', icon: Flame }
    ]
  },

  // FARMACIA Y SALUD
  {
    id: 'medicamentos',
    name: 'Medicamentos',
    icon: Pill,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    subcategories: [
      { id: 'analgesicos', name: 'Analgésicos', icon: Pill },
      { id: 'antigripales', name: 'Antigripales', icon: Thermometer },
      { id: 'digestivos', name: 'Digestivos', icon: Pill },
      { id: 'vitaminas', name: 'Vitaminas', icon: Pill },
      { id: 'primeros-auxilios', name: 'Primeros Auxilios', icon: Bandage }
    ]
  },

  // BEBÉ
  {
    id: 'bebe',
    name: 'Bebé',
    icon: Baby,
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    subcategories: [
      { id: 'panales', name: 'Pañales', icon: Baby },
      { id: 'toallitas', name: 'Toallitas Húmedas', icon: Sparkles },
      { id: 'alimentos-bebe', name: 'Alimentos para Bebé', icon: Baby },
      { id: 'cuidado-bebe', name: 'Cuidado del Bebé', icon: Heart }
    ]
  },

  // ALIMENTOS
  {
    id: 'golosinas-snacks',
    name: 'Golosinas y Snacks',
    icon: Cookie,
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    subcategories: [
      { id: 'chocolates', name: 'Chocolates', icon: Cookie },
      { id: 'caramelos', name: 'Caramelos', icon: Candy },
      { id: 'chicles', name: 'Chicles', icon: Candy },
      { id: 'galletitas', name: 'Galletitas', icon: Cookie },
      { id: 'alfajores', name: 'Alfajores', icon: Cookie },
      { id: 'papas-fritas', name: 'Papas Fritas', icon: Package },
      { id: 'snacks-salados', name: 'Snacks Salados', icon: Package }
    ]
  },
  {
    id: 'panaderia-reposteria',
    name: 'Panadería y Repostería',
    icon: Croissant,
    color: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-500',
    subcategories: [
      { id: 'pan', name: 'Pan', icon: Croissant },
      { id: 'facturas', name: 'Facturas', icon: Cake },
      { id: 'tortas', name: 'Tortas', icon: Cake },
      { id: 'masas', name: 'Masas', icon: Croissant }
    ]
  },
  {
    id: 'almacen',
    name: 'Almacén',
    icon: Package,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
    subcategories: [
      { id: 'arroz-pastas', name: 'Arroz y Pastas', icon: Wheat },
      { id: 'harinas', name: 'Harinas', icon: Wheat },
      { id: 'aceites', name: 'Aceites', icon: Droplets },
      { id: 'conservas', name: 'Conservas', icon: Package },
      { id: 'condimentos', name: 'Condimentos', icon: Flame },
      { id: 'sopas-caldos', name: 'Sopas y Caldos', icon: Soup },
      { id: 'sobres-polvo', name: 'Sobres en Polvo', icon: Package },
      { id: 'cereales', name: 'Cereales', icon: Wheat },
      { id: 'legumbres', name: 'Legumbres', icon: Package }
    ]
  },
  {
    id: 'carnes-pescados',
    name: 'Carnes y Pescados',
    icon: Beef,
    color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-500',
    subcategories: [
      { id: 'carnes-rojas', name: 'Carnes Rojas', icon: Beef },
      { id: 'pollo', name: 'Pollo', icon: Drumstick },
      { id: 'pescados', name: 'Pescados', icon: Fish },
      { id: 'embutidos', name: 'Embutidos', icon: Beef },
      { id: 'fiambres', name: 'Fiambres', icon: Beef }
    ]
  },
  {
    id: 'frutas-verduras',
    name: 'Frutas y Verduras',
    icon: Apple,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    subcategories: [
      { id: 'frutas', name: 'Frutas', icon: Apple },
      { id: 'verduras', name: 'Verduras', icon: Carrot },
      { id: 'frutas-secas', name: 'Frutas Secas', icon: Apple }
    ]
  },
  {
    id: 'congelados',
    name: 'Congelados',
    icon: Snowflake,
    color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400',
    subcategories: [
      { id: 'helados', name: 'Helados', icon: IceCream2 },
      { id: 'comidas-congeladas', name: 'Comidas Congeladas', icon: Pizza },
      { id: 'vegetales-congelados', name: 'Vegetales Congelados', icon: Snowflake }
    ]
  },

  // LIMPIEZA Y HOGAR
  {
    id: 'limpieza',
    name: 'Limpieza',
    icon: Sparkles,
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400',
    subcategories: [
      { id: 'detergentes', name: 'Detergentes', icon: Droplets },
      { id: 'lavandina', name: 'Lavandina', icon: Droplets },
      { id: 'limpiadores', name: 'Limpiadores', icon: SprayCan },
      { id: 'desinfectantes', name: 'Desinfectantes', icon: Sparkles },
      { id: 'suavizantes', name: 'Suavizantes', icon: Heart },
      { id: 'esponjas-trapos', name: 'Esponjas y Trapos', icon: Package }
    ]
  },
  {
    id: 'bazar-hogar',
    name: 'Bazar y Hogar',
    icon: Home,
    color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400',
    subcategories: [
      { id: 'utensilios-cocina', name: 'Utensilios de Cocina', icon: Utensils },
      { id: 'organizadores', name: 'Organizadores', icon: Package },
      { id: 'iluminacion', name: 'Iluminación', icon: Lightbulb },
      { id: 'pilas-baterias', name: 'Pilas y Baterías', icon: Battery }
    ]
  },

  // INDUMENTARIA Y ACCESORIOS
  {
    id: 'indumentaria',
    name: 'Indumentaria',
    icon: Shirt,
    color: 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
    subcategories: [
      { id: 'ropa-hombre', name: 'Ropa de Hombre', icon: Shirt },
      { id: 'ropa-mujer', name: 'Ropa de Mujer', icon: Shirt },
      { id: 'ropa-ninos', name: 'Ropa de Niños', icon: Shirt },
      { id: 'calzado', name: 'Calzado', icon: Footprints },
      { id: 'accesorios', name: 'Accesorios', icon: Watch }
    ]
  },

  // KIOSCO
  {
    id: 'kiosco',
    name: 'Kiosco',
    icon: ShoppingBag,
    color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-500',
    subcategories: [
      { id: 'cigarrillos', name: 'Cigarrillos', icon: Cigarette },
      { id: 'diarios-revistas', name: 'Diarios y Revistas', icon: Newspaper },
      { id: 'articulos-libreria', name: 'Artículos de Librería', icon: BookOpen },
      { id: 'juguetes', name: 'Juguetes', icon: Gamepad2 }
    ]
  },

  // MASCOTAS
  {
    id: 'mascotas',
    name: 'Mascotas',
    icon: Dog,
    color: 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-500',
    subcategories: [
      { id: 'alimento-perros', name: 'Alimento para Perros', icon: Dog },
      { id: 'alimento-gatos', name: 'Alimento para Gatos', icon: Cat },
      { id: 'accesorios-mascotas', name: 'Accesorios', icon: Heart },
      { id: 'higiene-mascotas', name: 'Higiene para Mascotas', icon: Sparkles }
    ]
  },

  // JARDINERÍA
  {
    id: 'jardineria',
    name: 'Jardinería',
    icon: Flower2,
    color: 'text-lime-600 bg-lime-100 dark:bg-lime-900/30 dark:text-lime-400',
    subcategories: [
      { id: 'plantas', name: 'Plantas', icon: Flower2 },
      { id: 'fertilizantes', name: 'Fertilizantes', icon: Droplets },
      { id: 'herramientas-jardin', name: 'Herramientas', icon: Wrench },
      { id: 'macetas', name: 'Macetas', icon: Flower2 }
    ]
  },

  // FERRETERÍA
  {
    id: 'ferreteria',
    name: 'Ferretería',
    icon: Hammer,
    color: 'text-gray-700 bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300',
    subcategories: [
      { id: 'herramientas', name: 'Herramientas', icon: Wrench },
      { id: 'pinturas', name: 'Pinturas', icon: PaintBucket },
      { id: 'electricidad', name: 'Electricidad', icon: Electric },
      { id: 'plomeria', name: 'Plomería', icon: Droplets },
      { id: 'tornillos-clavos', name: 'Tornillos y Clavos', icon: Bolt }
    ]
  },

  // AUTOMOTOR
  {
    id: 'automotor',
    name: 'Automotor',
    icon: Car,
    color: 'text-zinc-700 bg-zinc-200 dark:bg-zinc-700/50 dark:text-zinc-300',
    subcategories: [
      { id: 'aceites-lubricantes', name: 'Aceites y Lubricantes', icon: Droplets },
      { id: 'accesorios-auto', name: 'Accesorios para Auto', icon: Car },
      { id: 'limpieza-auto', name: 'Limpieza de Auto', icon: Sparkles },
      { id: 'bicicletas', name: 'Bicicletas y Accesorios', icon: Bike }
    ]
  },

  // ELECTRÓNICA Y TECNOLOGÍA
  {
    id: 'electronica',
    name: 'Electrónica',
    icon: Smartphone,
    color: 'text-blue-800 bg-blue-200 dark:bg-blue-800/40 dark:text-blue-300',
    subcategories: [
      { id: 'celulares', name: 'Celulares', icon: Smartphone },
      { id: 'computacion', name: 'Computación', icon: Laptop },
      { id: 'audio', name: 'Audio', icon: Headphones },
      { id: 'fotografia', name: 'Fotografía', icon: Camera },
      { id: 'accesorios-tech', name: 'Accesorios Tech', icon: Plug }
    ]
  },

  // ELECTRODOMÉSTICOS
  {
    id: 'electrodomesticos',
    name: 'Electrodomésticos',
    icon: WashingMachine,
    color: 'text-teal-700 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400',
    subcategories: [
      { id: 'cocina', name: 'Cocina', icon: Flame },
      { id: 'refrigeracion', name: 'Refrigeración', icon: Refrigerator },
      { id: 'lavado', name: 'Lavado', icon: WashingMachine },
      { id: 'climatizacion', name: 'Climatización', icon: Wind },
      { id: 'pequenos-electrodomesticos', name: 'Pequeños Electrodomésticos', icon: Plug }
    ]
  }
];

// Helper function to get all categories flattened
export const getAllCategories = () => {
  const allCategories = [];
  productCategories.forEach(category => {
    allCategories.push({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      isParent: true
    });
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        allCategories.push({
          id: sub.id,
          name: sub.name,
          icon: sub.icon,
          color: category.color,
          parentId: category.id,
          parentName: category.name,
          isParent: false
        });
      });
    }
  });
  return allCategories;
};

// Helper function to get category by id
export const getCategoryById = (id) => {
  for (const category of productCategories) {
    if (category.id === id) return category;
    if (category.subcategories) {
      const sub = category.subcategories.find(s => s.id === id);
      if (sub) return { ...sub, parentId: category.id, parentName: category.name, color: category.color };
    }
  }
  return null;
};

// Helper function to search categories
export const searchCategories = (query) => {
  const lowerQuery = query.toLowerCase();
  return getAllCategories().filter(cat => 
    cat.name.toLowerCase().includes(lowerQuery)
  );
};
