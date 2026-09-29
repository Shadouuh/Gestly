# Sistema de Categorías de Productos - Gestly

Este documento describe el sistema completo de categorías de productos implementado en Gestly Admin.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Estructura de Categorías](#estructura-de-categorías)
- [Uso en el Sistema](#uso-en-el-sistema)
- [Agregar Nuevas Categorías](#agregar-nuevas-categorías)
- [API de Funciones Helper](#api-de-funciones-helper)

---

## Descripción General

El sistema de categorías proporciona una estructura jerárquica completa para clasificar productos en diferentes rubros y subcategorías. Cada categoría incluye:

- **ID único**: Identificador para la categoría
- **Nombre**: Nombre descriptivo
- **Icono**: Componente de Lucide React
- **Color**: Clases de Tailwind para estilizado
- **Subcategorías**: Array de categorías hijas (opcional)

---

## Estructura de Categorías

### 🍷 Bebidas

#### Bebidas Alcohólicas
- Vinos
- Cervezas
- Licores y Destilados
- Aperitivos

#### Bebidas sin Alcohol
- Gaseosas
- Jugos
- Aguas
- Energizantes
- Té y Café

---

### 🥛 Lácteos
- Leche
- Yogures
- Quesos
- Manteca y Margarina
- Cremas
- Postres Lácteos

---

### 💆 Cuidado Personal e Higiene

#### Cuidado del Cabello
- Shampoo
- Acondicionador
- Tratamientos Capilares
- Tinturas
- Fijadores y Gel

#### Cuidado de la Piel
- Cremas Corporales
- Cremas Faciales
- Protectores Solares
- Jabones
- Exfoliantes

#### Higiene Personal
- Desodorantes
- Pasta Dental
- Cepillos Dentales
- Enjuagues Bucales
- Papel Higiénico
- Toallas Femeninas

#### Afeitado y Depilación
- Maquinitas de Afeitar
- Espuma de Afeitar
- After Shave
- Ceras Depilatorias

---

### 💊 Farmacia y Salud

#### Medicamentos
- Analgésicos
- Antigripales
- Digestivos
- Vitaminas
- Primeros Auxilios

---

### 👶 Bebé
- Pañales
- Toallitas Húmedas
- Alimentos para Bebé
- Cuidado del Bebé

---

### 🍬 Alimentos

#### Golosinas y Snacks
- Chocolates
- Caramelos
- Chicles
- Galletitas
- Alfajores
- Papas Fritas
- Snacks Salados

#### Panadería y Repostería
- Pan
- Facturas
- Tortas
- Masas

#### Almacén
- Arroz y Pastas
- Harinas
- Aceites
- Conservas
- Condimentos
- Sopas y Caldos
- Sobres en Polvo
- Cereales
- Legumbres

#### Carnes y Pescados
- Carnes Rojas
- Pollo
- Pescados
- Embutidos
- Fiambres

#### Frutas y Verduras
- Frutas
- Verduras
- Frutas Secas

#### Congelados
- Helados
- Comidas Congeladas
- Vegetales Congelados

---

### 🧹 Limpieza y Hogar

#### Limpieza
- Detergentes
- Lavandina
- Limpiadores
- Desinfectantes
- Suavizantes
- Esponjas y Trapos

#### Bazar y Hogar
- Utensilios de Cocina
- Organizadores
- Iluminación
- Pilas y Baterías

---

### 👕 Indumentaria y Accesorios
- Ropa de Hombre
- Ropa de Mujer
- Ropa de Niños
- Calzado
- Accesorios

---

### 🏪 Kiosco
- Cigarrillos
- Diarios y Revistas
- Artículos de Librería
- Juguetes

---

### 🐕 Mascotas
- Alimento para Perros
- Alimento para Gatos
- Accesorios
- Higiene para Mascotas

---

### 🌸 Jardinería
- Plantas
- Fertilizantes
- Herramientas
- Macetas

---

### 🔨 Ferretería
- Herramientas
- Pinturas
- Electricidad
- Plomería
- Tornillos y Clavos

---

### 🚗 Automotor
- Aceites y Lubricantes
- Accesorios para Auto
- Limpieza de Auto
- Bicicletas y Accesorios

---

### 📱 Electrónica y Tecnología
- Celulares
- Computación
- Audio
- Fotografía
- Accesorios Tech

---

### 🔌 Electrodomésticos
- Cocina
- Refrigeración
- Lavado
- Climatización
- Pequeños Electrodomésticos

---

## Uso en el Sistema

### Importar Categorías

```javascript
import { 
  productCategories, 
  getAllCategories, 
  getCategoryById,
  searchCategories 
} from './config/productCategories';
```

### Ejemplo de Uso en Componentes

```javascript
// Obtener todas las categorías principales
const mainCategories = productCategories;

// Obtener todas las categorías (incluyendo subcategorías) aplanadas
const allCategories = getAllCategories();

// Buscar una categoría por ID
const category = getCategoryById('shampoo');
// Retorna: { id: 'shampoo', name: 'Shampoo', icon: Droplets, ... }

// Buscar categorías por texto
const results = searchCategories('crema');
// Retorna todas las categorías que contengan "crema" en su nombre
```

### Estructura de Producto

```javascript
const product = {
  id: 1,
  name: 'Coca Cola 500ml',
  price: 1200,
  category: ['gaseosas'], // Array de IDs de categorías
  stock: 100,
  image: 'url-de-imagen', // URL de imagen o null
  useIcon: false // true para usar ícono de categoría, false para imagen
};
```

---

## Agregar Nuevas Categorías

### 1. Categoría Principal

```javascript
{
  id: 'nueva-categoria',
  name: 'Nueva Categoría',
  icon: IconoLucide, // Importar de lucide-react
  color: 'text-blue-600 bg-blue-50', // Clases de Tailwind
  subcategories: [
    // Subcategorías opcionales
  ]
}
```

### 2. Subcategoría

Agregar dentro del array `subcategories` de una categoría principal:

```javascript
subcategories: [
  {
    id: 'nueva-subcategoria',
    name: 'Nueva Subcategoría',
    icon: IconoLucide
  }
]
```

### 3. Importar Iconos Necesarios

Al inicio del archivo `productCategories.js`:

```javascript
import { 
  NuevoIcono,
  OtroIcono
} from 'lucide-react';
```

---

## API de Funciones Helper

### `getAllCategories()`

Retorna un array plano con todas las categorías y subcategorías.

**Retorno:**
```javascript
[
  {
    id: 'categoria-id',
    name: 'Nombre',
    icon: IconComponent,
    color: 'text-color bg-color',
    isParent: true/false,
    parentId: 'id-padre', // Solo en subcategorías
    parentName: 'Nombre Padre' // Solo en subcategorías
  },
  // ...
]
```

### `getCategoryById(id)`

Busca y retorna una categoría específica por su ID.

**Parámetros:**
- `id` (string): ID de la categoría a buscar

**Retorno:**
```javascript
{
  id: 'categoria-id',
  name: 'Nombre',
  icon: IconComponent,
  color: 'text-color bg-color',
  parentId: 'id-padre', // Si es subcategoría
  parentName: 'Nombre Padre' // Si es subcategoría
}
```

### `searchCategories(query)`

Busca categorías que coincidan con el texto de búsqueda.

**Parámetros:**
- `query` (string): Texto a buscar (case-insensitive)

**Retorno:**
Array de categorías que coinciden con la búsqueda.

---

## Opciones de Imagen en Productos

El sistema permite tres formas de asignar imágenes a productos:

### 1. **Búsqueda de Imagen** (Search)
- Busca imágenes en Google usando la API de búsqueda
- Ideal para productos con marcas reconocidas
- Ejemplo: "Coca Cola", "Oreo", "Colgate"

### 2. **URL de Imagen** (URL)
- Permite ingresar directamente una URL de imagen
- Útil cuando ya tienes la imagen alojada en algún lugar

### 3. **Ícono de Categoría** (Icon)
- Usa automáticamente el ícono de la categoría seleccionada
- Perfecto para productos genéricos
- Ejemplo: Productos de ferretería, medicamentos genéricos

---

## Colores Disponibles

Los colores están definidos usando clases de Tailwind CSS:

- `text-blue-600 bg-blue-50`
- `text-emerald-600 bg-emerald-50`
- `text-rose-600 bg-rose-50`
- `text-amber-600 bg-amber-50`
- `text-violet-600 bg-violet-50`
- `text-slate-600 bg-slate-50`
- `text-indigo-600 bg-indigo-50`
- `text-pink-600 bg-pink-50`
- `text-cyan-600 bg-cyan-50`
- `text-red-600 bg-red-50`
- `text-yellow-600 bg-yellow-50`
- `text-orange-600 bg-orange-50`
- `text-green-600 bg-green-50`
- `text-sky-600 bg-sky-50`
- `text-fuchsia-600 bg-fuchsia-50`
- `text-lime-600 bg-lime-50`
- `text-gray-700 bg-gray-50`
- `text-zinc-700 bg-zinc-50`
- `text-teal-700 bg-teal-50`

---

## Notas Importantes

1. **IDs únicos**: Cada categoría y subcategoría debe tener un ID único en todo el sistema
2. **Iconos**: Todos los iconos deben ser importados de `lucide-react`
3. **Colores**: Usar clases de Tailwind para consistencia visual
4. **Jerarquía**: Las subcategorías heredan el color de su categoría padre
5. **Búsqueda**: La función de búsqueda es case-insensitive y busca en el nombre

---

## Mantenimiento

Para mantener el sistema organizado:

1. Agrupa categorías relacionadas
2. Usa nombres descriptivos y claros
3. Mantén la consistencia en los colores por tipo de producto
4. Documenta cualquier categoría especial o con comportamiento único
5. Actualiza este README cuando agregues nuevas categorías principales

---

## Soporte

Para preguntas o sugerencias sobre el sistema de categorías, contacta al equipo de desarrollo de Gestly.

**Última actualización:** Abril 2026
**Versión:** 1.0.0
