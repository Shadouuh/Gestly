# Gestly — Mapa de Datos Completo

Este documento cataloga **todos los datos** que existen en la app: estructuras actuales en JSON Server, mock data hardcodeada en componentes, localStorage keys, y formas de cada entidad. Sirve como guía para modelar una base de datos real (SQL / MongoDB).

---

## Índice

1. [JSON Server — Recursos Actuales](#1-json-server--recursos-actuales)
2. [LocalStorage Keys](#2-localstorage-keys)
3. [Mock Data por Componente](#3-mock-data-por-componente)
   - 3.1 [Admin Mock Data](#31-adminmockdatajs)
   - 3.2 [AdminDashboard](#32-admindashboardjsx)
   - 3.3 [Onboarding](#33-onboardingjsx)
   - 3.4 [Settings (App)](#34-settingsjsx)
   - 3.5 [POS](#35-posjsx)
   - 3.6 [ShoppingList](#36-shoppinglistjsx)
   - 3.7 [Catalog](#37-catalogjsx)
   - 3.8 [Login](#38-loginjsx)
4. [Categorías de Productos](#4-categorías-de-productos)
5. [API Endpoints](#5-api-endpoints)
6. [Esquemas JSON Reales](#6-esquemas-json-reales-para-decisiones-db)

---

## 1. JSON Server — Recursos Actuales

### `users`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | PK |
| `email` | string | Único |
| `password` | string | En plano (solo seed) |
| `name` | string | Nombre completo |
| `role` | `"owner"` | Solo rol seed |
| `businessId` | number | FK → businesses.id |
| `createdAt` | ISO date | |

### `businesses`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | PK |
| `name` | string | Razón social |
| `templateId` | `"kiosco"\|"ferreteria"\|"carniceria"` | Plantilla de productos |
| `ownerId` | number | FK → users.id |
| `address` | string | Opcional |
| `phone` | string | Opcional |
| `createdAt` | ISO date | |

### `templates`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `"kiosco"\|"ferreteria"\|"carniceria"` | PK (string) |
| `name` | string | "Kiosco", etc. |
| `description` | string | |
| `icon` | string | Nombre Lucide icon |
| `color` | string | Tailwind classes |
| `defaultProducts` | number[] | IDs de productos predeterminados |

### `products` (catálogo global de plantillas)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | PK |
| `name` | string | |
| `price` | number | Precio de venta sugerido |
| `category` | string | ID de subcategoría (ej: `"gaseosas"`) |
| `templateId` | `"kiosco"\|"ferreteria"\|"carniceria"` | FK → templates.id |
| `image` | string\|null | URL |
| `useIcon` | boolean | Fallback a ícono de categoría |

### `businessProducts` (relación negocio ↔ producto)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | PK |
| `businessId` | number | FK → businesses.id |
| `productId` | number | FK → products.id |
| `stock` | number | Stock actual |
| `customPrice` | number\|null | Precio personalizado (si difiere del template) |
| `isActive` | boolean | Si se muestra en el catálogo del negocio |

### `branches`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `"centro"\|"norte"` | PK (string) |
| `businessId` | number | FK → businesses.id |
| `name` | string | "Sucursal Centro" |

### `appEmployees`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | PK |
| `businessId` | number | FK → businesses.id |
| `name` | string | |
| `role` | `"Vendedor"\|"Administrador"` | |
| `color` | hex string | Color de avatar |
| `avatar` | string | Inicial |

### `salesTransactions`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | PK |
| `businessId` | number | FK → businesses.id |
| `branchId` | string | FK → branches.id |
| `occurredAt` | ISO date | |
| `sellerEmployeeId` | string | FK → appEmployees.id |
| `customerName` | string | |
| `paymentMethod` | `"cash"\|"mp"\|"transfer"\|"fiado"` | |
| `status` | `"paid"\|"open"` | |
| `items` | array | Ver abajo |
| `subtotal` | number | |
| `discount` | number | |
| `total` | number | |

#### `salesTransactions[].items[]`
| Campo | Tipo |
|-------|------|
| `productId` | number |
| `name` | string |
| `qty` | number |
| `unitPrice` | number |

### `cashMovements`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | PK |
| `businessId` | number | FK → businesses.id |
| `branchId` | string | FK → branches.id |
| `occurredAt` | ISO date | |
| `type` | `"expense"\|"income"` | |
| `category` | `"Proveedor"\|"Servicios"\|"Caja chica"\|"Ingreso extra"\|"Merma"\|"Logística"\|"Ajuste"` | |
| `description` | string | |
| `amount` | number | |
| `createdByEmployeeId` | string | FK → appEmployees.id |
| `relatedSaleId` | number\|null | FK → salesTransactions.id (opcional) |

---

## 2. LocalStorage Keys

| Key | Almacena | Seteado por | Leído por |
|-----|----------|-------------|-----------|
| `token` | string | `api.js` (login/register) | `api.js` interceptor |
| `user` | JSON `{ id, email, name, role, businessId, createdAt }` | `api.js` | `api.js`, componentes |
| `business` | JSON `{ id, name, templateId, ownerId, address, phone, createdAt }` | `api.js` | `api.js`, componentes |
| `theme` | `"light"\|"dark"` | AppLayout | AppLayout |
| `gestly_arca_config` | JSON (ver ARCA Config) | Settings | Settings, POS |
| `gestly_global_expenses` | JSON array | Layout | Layout |
| `gestly_mock_expenses` | JSON array | Sales, ShoppingList | Sales, ShoppingList |

### Shape de `gestly_arca_config`
```json
{
  "businessName": "",
  "cuit": "",
  "ivaCondition": "monotributista",
  "address": "",
  "pointOfSale": 1,
  "iibbCondition": "",
  "arcaKey": "",
  "defaultReceiptType": "B",
  "isConnected": false
}
```

### IVA Conditions (hardcodeadas en Settings)
```js
[
  { value: "consumidor_final", label: "Consumidor Final" },
  { value: "monotributista", label: "Monotributista" },
  { value: "responsable_inscripto", label: "Responsable Inscripto" },
  { value: "exento", label: "Exento" },
  { value: "no_alcanzado", label: "No Alcanzado" },
]
```

### Receipt Types (hardcodeados en Settings)
```js
[
  { value: "A", label: "Factura A", desc: "Responsables Inscriptos" },
  { value: "B", label: "Factura B", desc: "Consumidores / Monotributistas" },
  { value: "C", label: "Factura C", desc: "No alcanzados" },
  { value: "ticket", label: "Ticket / Comprobante", desc: "Sin requisitos fiscales" },
]
```

---

## 3. Mock Data por Componente

### 3.1 `adminMockData.js`

#### `BUSINESSES` (array[100])
Generado por `generateBusinesses(100)` con seed RNG 42. Cada item:

| Campo | Tipo | Rango/Origen |
|-------|------|-------------|
| `id` | number | 1..100 |
| `name` | string | 28 nombres base + rotación |
| `rubro` | `"Kiosco"\|"Ferretería"\|"Carnicería"\|"Supermercado"\|"Farmacia"\|"Librería"\|"Indumentaria"\|"Electrodomésticos"` | Random |
| `city` | string | 10 ciudades argentinas |
| `address` | string | Calle + número aleatorio |
| `phone` | string | Código área + número |
| `email` | string | `contacto{N}@mail.com` |
| `status` | `"active"(75%)\|"trial"(13%)\|"expired"(7%)\|"cancelled"(5%)` | Random ponderado |
| `users` | number | 1..8 |
| `employees` | number | 1..15 |
| `products` | number | 20..500 |
| `monthlySales` | number | 200000..5000000 |
| `lat` | number | -34..-39 |
| `lng` | number | -58..-64 |
| `plan` | `"essential"(40%)\|"pro"(60%)` | Random |
| `planPrice` | number | 5000 (essential) / 10000 (pro) |
| `frequency` | `"monthly"(70%)\|"annual"(30%)` | Random |
| `monthlyAmount` | number | price × (12×0.85 si annual, 1 si monthly) |
| `startDate` | string (YYYY-MM-DD) | 2024 + offset aleatorio |
| `nextBilling` | string | startDate + 30/365 días |
| `affiliate` | `"JUAN10"\|"SOLEDAD20"\|null` | 35% / 25% / 40% |

#### Ciudades disponibles
`Córdoba`, `Buenos Aires`, `Rosario`, `Mendoza`, `La Plata`, `Mar del Plata`, `Salta`, `Tucumán`, `Santa Fe`, `Neuquén`

#### `AFFILIATES` (array[2])
| Campo | Valor 1 | Valor 2 |
|-------|---------|---------|
| `id` | 1 | 2 |
| `code` | `"JUAN10"` | `"SOLEDAD20"` |
| `name` | "Juan Cottier" | "Soledad Ocampo" |
| `email` | "juan@cottier.com" | "sole@ocampo.com" |
| `phone` | "351-1234567" | "11-7654321" |
| `commissionFirst3` | 0.40 | 0.40 |
| `commissionAfter` | 0.10 | 0.10 |

#### `AFFILIATE_COMMISSIONS` (computed)
Cada item = `{ ...AFFILIATE, totalBusinesses, totalPending, totalEarned, details: [...], avgCommission }`

Donde `details[]` = item del business con `{ ...business, monthsActive, isFirst3, rate, commission }`

#### `INVOICES` (array[300])
| Campo | Tipo |
|-------|------|
| `id` | `"INV-000001"` |
| `businessId` | number |
| `businessName` | string |
| `plan` | string |
| `amount` | number |
| `date` | YYYY-MM-DD |
| `status` | `"paid"(95%)\|"pending"(5%)` |
| `period` | `"mayo 2026"` |
| `affiliate` | string\|null |

#### `getSubscriptionStats()` → `{ total, active, paying, essential, pro, monthly, annual, mrr, essentialMrr, proMrr, totalBilled }`

### 3.2 `AdminDashboard.jsx`

Hardcodeada en el mismo archivo:

```js
STATS = {
  totalBusinesses: 7,
  activeBusinesses: 5,
  totalCities: 4,
  totalUsers: 18,
  totalProducts: 1520,
  monthlySales: 9190000,
}

CITY_DATA = [
  { city, count, businesses: string[], users, sales }
]

ROLE_DATA = [
  { role: "Super Admin"|"Dueños"|"Admin"|"Cajeros", count, color }
]

RECENT_EVENTS = [
  { type: "business"|"user"|"alert"|"payment"|"warning"|"system", msg, time, color }
]

MONTHLY_TREND = [
  { month: "Ene".."Jun", ventas: number, usuarios: number }
]
```

### 3.3 `Onboarding.jsx`

#### Rubros disponibles (3)
```js
[
  { name: "Kiosco", image: kioscoImg, id: "kiosco" },
  { name: "Ferretería", image: ferreteriaImg, id: "ferreteria" },
  { name: "Carnicería", image: carniceriaImg, id: "carniceria" }
]
```

#### `productTemplates` (por rubro)
**Kiosco** — 15 productos (Coca Cola 500ml a Helado Palito) con price y category[].
**Ferretería** — 15 (Tornillos a Enchufe 3 Patas).
**Carnicería** — 10 (Asado a Tomate x Kg).

Cada producto: `{ name: string, price: number, category: string[] }`

#### Form data shape
```js
{
  name: string,
  rubro: string,
  stockType: "simple",
  themeColor: "blue"|"indigo"|"violet"|"emerald"|"rose"|"orange"|"slate",
  themeMode: "light"|"dark",
  branches: [{ id: number, name: string, address?: string }],
  employees: [{ id: number, name, role: "Administrador"|"Vendedor", email, phone, password, branchIds: number[], isFixed?: boolean }],
  products: [{ ...productTemplate, customPrice: number, stock: number, isActive: boolean, needsPriceReview: boolean }]
}
```

#### Color options
```js
{ blue: "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6", emerald: "#10b981", rose: "#f43f5e", orange: "#f97316", slate: "#475569" }
```

#### Stock types (hardcodeados)
- `"simple"` — Stock general
- `"multiple"` — Stock por lote

### 3.4 `Settings.jsx`

#### Sectiones de configuración (6)
```js
SECTIONS = [
  { id: "business", title: "Tu negocio", icon: Store, description: "Nombre, logo, rubro y datos fiscales.", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "payments", title: "Métodos de pago", icon: CreditCard, ... },
  { id: "billing", title: "Facturación", icon: Receipt, ... },
  { id: "notifications", title: "Notificaciones", icon: Bell, ... },
  { id: "security", title: "Seguridad", icon: Shield, ... },
  { id: "subscription", title: "Suscripción", icon: Users, ... },
]
```

#### Plan Features table
```js
PLAN_FEATURES = [
  { name: "Emisión de facturas electrónicas", free: true, pro: true, premium: true },
  { name: "Factura A / B / C", free: false, pro: true, premium: true },
  { name: "Exportación a PDF", free: true, pro: true, premium: true },
  { name: "Multi-sucursal", free: false, pro: true, premium: true },
  { name: "Límite facturas/mes", free: 50, pro: 500, premium: "Ilimitado" },
  { name: "Soporte prioritario", free: false, pro: false, premium: true },
]
```

#### Plan actual (mock)
```js
currentPlan = "pro"  // hardcodeado
```

### 3.5 `POS.jsx`

#### Productos hardcodeados (17)
```js
products: [{ id: 1..17, name, price, category: string[], stock, image/useIcon }]
```
Mismos que Catalog pero sin purchasePrice.

#### Payment methods
```js
paymentMethod state: "efectivo"|"tarjeta"|"mp"|"transferencia"|"fiado"
```

#### Caja state
```js
cajaSales: [{ id, time: Date, items: number, total: number, method: string }]
cajaExpenses: [{ id, time: Date, concept: string, amount: number, type: "gasto"|"perdida" }]
```

#### Invoice state
```js
shouldInvoice: boolean
invoiceReceiptType: "A"|"B"|"C"|"ticket"
invoiceCustomerName: string
lastInvoice: null|{ receiptType, customerName, date, number, items, subtotal, discount, total }
```

### 3.6 `ShoppingList.jsx`

#### Lists (3 hardcodeadas)
```js
lists = [
  {
    id: "L1"|"L2"|"L3",
    name: string,
    date: "YYYY-MM-DD",
    status: "pending"|"completed",
    branch: "centro"|"norte"|"all",
    items: [{ id, name, quantity, checked, reason: "Stock Crítico"|"Alta Demanda"|"Manual"|"Agotado", cost, isCostUpdated, currentStock }]
  }
]
```

#### Catálogo mock (8 productos)
```js
catalogProducts = [
  { id, name, cost, currentStock }
]
```

### 3.7 `Catalog.jsx`

Ahora consume de API (`getBusinessProducts`), pero el shape de mapeo es:

```js
product = {
  id: number,                // businessProduct.id
  name: string,              // product.name
  purchasePrice: number,     // product.purchasePrice
  price: number,             // customPrice || product.price
  category: string[],        // [product.category]
  stock: number,             // bp.stock (single number, no per-branch)
  branches: ["general"],
  useIcon: true,
  image: string,
  isActive: boolean,
}
```

### 3.8 `Login.jsx`

#### Feature chips (3)
```js
FEATURE_CHIPS = [
  { icon: BarChart3, text: "Ventas en tiempo real", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Package, text: "Control de inventario", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: FileBarChart, text: "Reportes inteligentes", color: "text-indigo-600", bg: "bg-indigo-50" },
]
```

---

## 4. Categorías de Productos

Definidas en `src/pages/Admin/config/productCategories.js` (20 categorías padre, ~90 subcategorías).

### Categorías padre y subcategorías

| Categoría (id) | Subcategorías (id) |
|----------------|-------------------|
| `bebidas-alcoholicas` | vinos, cervezas, licores, aperitivos |
| `bebidas-sin-alcohol` | gaseosas, jugos, aguas, energizantes, te-cafe |
| `lacteos` | leche, yogures, quesos, manteca-margarina, cremas, postres-lacteos |
| `cuidado-cabello` | shampoo, acondicionador, tratamientos-capilares, tinturas, fijadores |
| `cuidado-piel` | cremas-corporales, cremas-faciales, protectores-solares, jabones, exfoliantes |
| `higiene-personal` | desodorantes, pasta-dental, cepillos-dental, enjuagues, papel-higienico, toallas-femeninas, cuidado-personal |
| `afeitado` | maquinitas-afeitar, espuma-afeitar, aftershave, ceras-depilatorias |
| `medicamentos` | analgesicos, antigripales, digestivos, vitaminas, primeros-auxilios |
| `bebe` | panales, toallitas, alimentos-bebe, cuidado-bebe |
| `golosinas-snacks` | chocolates, caramelos, chicles, galletitas, alfajores, papas-fritas, snacks-salados |
| `panaderia-reposteria` | pan, facturas, tortas, masas |
| `almacen` | arroz-pastas, harinas, aceites, conservas, condimentos, sopas-caldos, sobres-polvo, cereales, legumbres |
| `carnes-pescados` | carnes-rojas, pollo, pescados, embutidos, fiambres |
| `frutas-verduras` | frutas, verduras, frutas-secas |
| `congelados` | helados, comidas-congeladas, vegetales-congelados |
| `limpieza` | detergentes, lavandina, limpiadores, desinfectantes, suavizantes, esponjas-trapos |
| `bazar-hogar` | utensilios-cocina, organizadores, iluminacion, pilas-baterias |
| `indumentaria` | ropa-hombre, ropa-mujer, ropa-ninos, calzado, accesorios |
| `kiosco` | cigarrillos, diarios-revistas, articulos-libreria, juguetes |
| `mascotas` | alimento-perros, alimento-gatos, accesorios-mascotas, higiene-mascotas |
| `jardineria` | plantas, fertilizantes, herramientas-jardin, macetas |
| `ferreteria` | herramientas, pinturas, electricidad, plomeria, tornillos-clavos |
| `automotor` | aceites-lubricantes, accesorios-auto, limpieza-auto, bicicletas |
| `electronica` | celulares, computacion, audio, fotografia, accesorios-tech |
| `electrodomesticos` | cocina, refrigeracion, lavado, climatizacion, pequenos-electrodomesticos |

Cada subcategoría tiene `{ id, name, icon: LucideIcon }`. Las categorías padre tienen además `color: TailwindClasses`.

Funciones helper: `getCategoryById(id)`, `getAllCategories()`, `searchCategories(query)`.

---

## 5. API Endpoints

### Servidor: `server.cjs` (Express + json-server)

#### Endpoints custom

| Método | Ruta | Request | Response |
|--------|------|---------|----------|
| **POST** | `/auth/login` | `{ email, password }` | `{ success, user (sin password), business, token }` |
| **POST** | `/auth/register` | `{ email, password, name, businessName, templateId, address?, phone? }` | `{ success, user (sin password), business, token }` |
| **GET** | `/templates` | — | `[{ ...template, productCount }]` |
| **GET** | `/businesses/:businessId/products` | — | `[{ ...businessProduct, product: { ... } }]` |
| **PATCH** | `/businessProducts/:id` | `{ stock?, customPrice?, isActive? }` | `businessProduct` actualizado |

#### Endpoints CRUD estándar (json-server router)

| Método | Ruta | Recurso |
|--------|------|---------|
| GET/POST | `/users` | users |
| GET/PATCH/DELETE | `/users/:id` | users |
| GET/POST | `/businesses` | businesses |
| GET/PATCH/DELETE | `/businesses/:id` | businesses |
| GET/POST | `/products` | products |
| GET/PUT/PATCH/DELETE | `/products/:id` | products |
| GET/POST | `/businessProducts` | businessProducts |
| GET/PATCH/DELETE | `/businessProducts/:id` | businessProducts |
| GET/POST | `/branches` | branches |
| GET/PATCH/DELETE | `/branches/:id` | branches |
| GET/POST | `/appEmployees` | appEmployees |
| GET/PATCH/DELETE | `/appEmployees/:id` | appEmployees |
| GET/POST | `/salesTransactions` | salesTransactions |
| GET/PATCH/DELETE | `/salesTransactions/:id` | salesTransactions |
| GET/POST | `/cashMovements` | cashMovements |
| GET/PATCH/DELETE | `/cashMovements/:id` | cashMovements |

### API Service (`src/services/api.js`)

```js
login(email, password)                                    → POST /auth/login
register({ email, password, name, businessName, ... })    → POST /auth/register
logout()                                                  → localStorage cleanup
getCurrentUser()                                          → localStorage getter
getCurrentBusiness()                                      → localStorage getter
getTemplates()                                            → GET /templates
getProducts()                                             → GET /products
getProductById(id)                                        → GET /products/:id
getBusinessProducts(businessId)                           → GET /businesses/:businessId/products
updateBusinessProduct(id, { stock, customPrice, isActive }) → PATCH /businessProducts/:id
createBusinessProduct({ businessId, productId, stock, customPrice }) → POST /businessProducts
deleteBusinessProduct(id)                                 → DELETE /businessProducts/:id
createProduct({ name, price, category, image? })          → POST /products
getBusiness(id)                                           → GET /businesses/:id
updateBusiness(id, { ...fields })                         → PATCH /businesses/:id
getAppEmployees(params?)                                  → GET /appEmployees
getSalesTransactions(params?)                             → GET /salesTransactions
getCashMovements(params?)                                 → GET /cashMovements
```

---

## 6. Esquemas JSON Reales (para decisiones DB)

### `POST /auth/register` request
```json
{
  "email": "user@mail.com",
  "password": "xxx",
  "name": "Juan Pérez",
  "businessName": "Kiosco El Rápido",
  "templateId": "kiosco",
  "address": "Av. Siempre Viva 123",
  "phone": "+54 351 1234567"
}
```

### `POST /auth/register` response
```json
{
  "success": true,
  "user": { "id": 123456, "email": "user@mail.com", "name": "Juan Pérez", "role": "owner", "businessId": 123457, "createdAt": "..." },
  "business": { "id": 123457, "name": "Kiosco El Rápido", "templateId": "kiosco", "ownerId": 123456, "address": "...", "phone": "...", "createdAt": "..." },
  "token": "token_123456_1234567890"
}
```

### `GET /businesses/:businessId/products` response
```json
[
  {
    "id": 1,
    "businessId": 1,
    "productId": 1,
    "stock": 100,
    "customPrice": null,
    "isActive": true,
    "product": {
      "id": 1,
      "name": "Coca Cola 500ml",
      "price": 1200,
      "category": "gaseosas",
      "templateId": "kiosco",
      "image": null,
      "useIcon": true
    }
  }
]
```

### `ProductCard` props shape
```js
{
  product: {
    id: number,
    name: string,
    price: number,
    purchasePrice?: number,
    stock: number,
    category?: string[],
    image?: string,
    useIcon?: boolean,
    unit?: string,
  },
  categoryData: {
    icon: LucideIcon,
    color: string,  // Tailwind classes
    name: string,
    id: string,
  },
  viewMode: "grid"|"list",
  onEdit: (product) => void,
  onDelete: (product) => void,
  onClick: () => void,
  isSelected: boolean,
  showActions: boolean,
  className: string,
  children: ReactNode,
}
```
