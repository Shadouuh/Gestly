# Gestly Backend — Documentación Técnica

> Servidor Express + MySQL para la plataforma Gestly. Gestiona autenticación, negocios, productos, ventas, inventario, sucursales, empleados, movimientos de caja, clientes y proveedores.

---

## 📋 Requisitos

- **Node.js** >= 18
- **MySQL** 8.0+ o **MariaDB** 10.4+
- **npm** >= 9

---

## 🚀 Inicio Rápido

```bash
# 1. Crear la base de datos
mysql -u root < gestly_schema.sql

# 2. Instalar dependencias del servidor
cd server && npm install && cd ..

# 3. Sembrar datos de prueba
npm run seed

# 4. Iniciar servidor
npm run dev         # Cliente (Vite) + Servidor (Express) concurrentemente
```

### Iniciar componentes por separado

```bash
npm run dev:client   # Solo frontend (puerto 5173)
npm run dev:server   # Solo backend (puerto 3001)
```

### Sembrar datos

```bash
npm run seed         # Puebla la DB con datos de prueba
```

---

## 📁 Estructura del Proyecto

```
gestly/
├── client/                    ← Frontend React (Vite)
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    ← Backend Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          ← Pool de conexión MySQL
│   │   ├── middleware/
│   │   │   ├── auth.js        ← JWT + middleware
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js        ← POST login, POST register
│   │   │   ├── businesses.js  ← CRUD negocios + productos por negocio
│   │   │   ├── products.js    ← CRUD productos
│   │   │   ├── sales.js       ← CRUD ventas
│   │   │   ├── cashMovements.js ← CRUD movimientos de caja
│   │   │   ├── branches.js    ← CRUD sucursales
│   │   │   ├── users.js       ← GET usuarios
│   │   │   ├── templates.js   ← GET plantillas
│   │   │   ├── plans.js       ← GET planes
│   │   │   ├── customers.js   ← CRUD clientes
│   │   │   ├── suppliers.js   ← CRUD proveedores
│   │   │   ├── categories.js  ← CRUD categorías
│   │   │   └── inventory.js   ← GET + PATCH inventario
│   │   ├── index.js           ← Entry point
│   │   └── seed.js            ← Seed script
│   └── package.json
├── gestly_schema.sql          ← Esquema SQL completo
├── DATA_MODEL.md              ← Mapa de datos frontend
├── README_BACKEND.md          ← Este documento
└── package.json               ← Raíz del workspace
```

---

## 🗄️ Base de Datos

### Tablas (17)

| Tabla | Propósito |
|-------|-----------|
| `plans` | Planes de suscripción (Essential, Pro, Premium) |
| `templates` | Plantillas de rubro (Kiosco, Ferretería, Carnicería) |
| `template_products` | Catálogo global de productos por rubro |
| `users` | Usuarios de la plataforma |
| `businesses` | Negocios registrados |
| `business_users` | Relación usuario-negocio con roles |
| `branches` | Sucursales por negocio |
| `categories` | Categorías de productos por negocio |
| `products` | Productos por negocio |
| `product_variants` | Variantes de producto (talle, color, etc.) |
| `inventories` | Stock por variante y sucursal |
| `inventory_movements` | Historial de movimientos de stock |
| `customers` | Clientes por negocio |
| `suppliers` | Proveedores por negocio |
| `sales` | Ventas realizadas |
| `sale_items` | Items de cada venta |
| `cash_movements` | Ingresos/egresos financieros |

### Esquema Relacional

```
plans ──→ businesses ──→ branches
                            ├──→ inventories ──→ product_variants ──→ products ──→ categories
users ──→ business_users ──→ businesses                    │                    └── template_products
                                ├── sales ──→ sale_items ──→ products
                                ├── cash_movements
                                ├── customers
                                └── suppliers
```

---

## 🔌 API Endpoints

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/login` | No | Iniciar sesión |
| `POST` | `/auth/register` | No | Registrar nuevo usuario + negocio |

**POST /auth/login**
```json
// Request
{ "email": "admin@kiosco.com", "password": "admin123" }
// Response
{ "success": true, "user": { id, email, name, phone, created_at }, "business": { id, name, slug, rubro, status }, "token": "jwt..." }
```

**POST /auth/register**
```json
// Request
{ "email": "...", "password": "...", "name": "Juan", "businessName": "Mi Kiosco", "templateId": "kiosco", "address": "Calle 123" }
// Response
{ "success": true, "user": {...}, "business": {...}, "token": "jwt..." }
```

### Usuarios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/users` | JWT | Listar todos los usuarios |
| `GET` | `/users/:id` | JWT | Obtener usuario por ID |

### Negocios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/businesses` | JWT | Listar negocios (con conteos) |
| `GET` | `/businesses/:id` | JWT | Obtener negocio |
| `PATCH` | `/businesses/:id` | JWT | Actualizar negocio |
| `GET` | `/businesses/:businessId/products` | JWT | Productos por negocio (con variantes + inventario agrupados) |
| `GET` | `/businesses/:businessId/branches` | JWT | Sucursales del negocio |
| `GET` | `/businesses/:businessId/employees` | JWT | Empleados del negocio |

### Productos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/products` | JWT | Todos los productos (admin) |
| `GET` | `/products/:id` | JWT | Producto por ID |
| `POST` | `/products` | JWT | Crear producto (con variante + inventarios) |
| `PATCH` | `/products/:id` | JWT | Actualizar producto |
| `DELETE` | `/products/:id` | JWT | Eliminar producto (soft delete) |

### Sucursales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/branches?businessId=` | JWT | Listar sucursales |
| `POST` | `/branches` | JWT | Crear sucursal |
| `PATCH` | `/branches/:id` | JWT | Actualizar sucursal |
| `DELETE` | `/branches/:id` | JWT | Desactivar sucursal |

### Ventas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/salesTransactions?businessId=&branchId=` | JWT | Listar ventas |
| `GET` | `/salesTransactions/:id` | JWT | Venta por ID |
| `POST` | `/salesTransactions` | JWT | Crear venta (con items + descuento de stock) |

**POST /salesTransactions**
```json
// Request
{
  "business_id": 1,
  "branch_id": 1,
  "customer_id": null,
  "seller_id": null,
  "payment_method": "cash",
  "subtotal": 3200,
  "discount": 0,
  "total": 3200,
  "items": [
    { "product_id": 1, "variant_id": 1, "name": "Coca Cola", "qty": 2, "unit_price": 1200, "purchase_price": 800 }
  ]
}
```

### Movimientos de Caja

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/cashMovements?businessId=&branchId=` | JWT | Listar movimientos |
| `POST` | `/cashMovements` | JWT | Crear movimiento |

### Catálogos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/templates` | JWT | Plantillas de rubro |
| `GET` | `/plans` | JWT | Planes de suscripción |
| `GET` | `/categories?businessId=` | JWT | Categorías de productos |
| `GET` | `/customers?businessId=` | JWT | Clientes |
| `GET` | `/suppliers?businessId=` | JWT | Proveedores |
| `GET` | `/inventory?branchId=&lowStock=` | JWT | Inventario |
| `PATCH` | `/inventory/:id` | JWT | Actualizar stock |

---

## 🔐 Autenticación

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene de `POST /auth/login` o `POST /auth/register`. Tiene expiración de **30 días**.

### Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `OWNER` | Dueño del negocio (acceso total) |
| `ADMIN` | Administrador del negocio |
| `SELLER` | Vendedor / cajero |
| `CASHIER` | Solo caja |

---

## 🌱 Seed Data

El seed crea:

- **3 planes** de suscripción (Essential $5000, Pro $10000, Premium $20000)
- **3 plantillas** de rubro (Kiosco, Ferretería, Carnicería)
- **40 productos** de plantilla total (15 kiosco + 15 ferretería + 10 carnicería) con precios de compra y venta
- **3 usuarios** de prueba con contraseña `admin123`:
  - `admin@kiosco.com` → Kiosco El Rápido (plan Pro)
  - `admin@ferreteria.com` → Ferretería Don José (plan Pro)
  - `admin@carniceria.com` → Carnicería La Pampa (plan Pro)
- Cada negocio tiene:
  - 2 sucursales (Centro, Norte)
  - 1 categoría "General"
  - Productos copiados de su plantilla
  - Variante "Default" por cada producto
  - Inventario con stock aleatorio (10-110 unidades) en cada sucursal
  - Dueño como `OWNER` en `business_users`

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3001` | Puerto del servidor |
| `DB_HOST` | `127.0.0.1` | Host MySQL |
| `DB_PORT` | `3306` | Puerto MySQL |
| `DB_USER` | `root` | Usuario MySQL |
| `DB_PASSWORD` | `''` | Contraseña MySQL |
| `DB_NAME` | `gestly` | Nombre de la base de datos |
| `JWT_SECRET` | `gestly_dev_secret_change_in_prod` | Secreto JWT |

Ejemplo con `.env` (crear en `server/`):

```
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=gestly
JWT_SECRET=mi_secreto_jwt_seguro
```

---

## 🧪 Probar API

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kiosco.com","password":"admin123"}'

# Obtener productos del negocio (con token)
curl http://localhost:3001/businesses/1/products \
  -H "Authorization: Bearer <token>"
```

---

## 📝 Licencia

Uso interno — Gestly © 2026
