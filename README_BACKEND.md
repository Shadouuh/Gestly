# Backend con JSON Server - Gestly

## 📋 Descripción

Este proyecto utiliza **JSON Server** como backend simulado para gestionar usuarios, negocios, plantillas y productos.

## 🗂️ Estructura de Datos

### Users (Usuarios)
Cada usuario está vinculado a un negocio.

```json
{
  "id": 1,
  "email": "admin@kiosco.com",
  "password": "admin123",
  "name": "Juan Pérez",
  "role": "owner",
  "businessId": 1,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Businesses (Negocios)
Cada negocio tiene una plantilla asociada.

```json
{
  "id": 1,
  "name": "Kiosco El Rápido",
  "templateId": "kiosco",
  "ownerId": 1,
  "address": "Av. Corrientes 1234, CABA",
  "phone": "+54 11 4567-8901",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### Templates (Plantillas)
Plantillas predefinidas de negocios (Kiosco, Ferretería, Carnicería).

```json
{
  "id": "kiosco",
  "name": "Kiosco",
  "description": "Plantilla para kioscos y comercios minoristas",
  "icon": "Store",
  "color": "text-blue-600 bg-blue-50",
  "defaultProducts": [1, 2, 3, 4, 5, ...]
}
```

### Products (Productos Maestros)
Catálogo maestro de productos.

```json
{
  "id": 1,
  "name": "Coca Cola 500ml",
  "price": 1200,
  "category": "gaseosas",
  "templateId": "kiosco",
  "image": null,
  "useIcon": true
}
```

### BusinessProducts (Productos por Negocio)
Relación entre negocios y productos con stock personalizado.

```json
{
  "id": 1,
  "businessId": 1,
  "productId": 1,
  "stock": 100,
  "customPrice": null,
  "isActive": true
}
```

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor JSON Server:
```bash
npm run server
```

3. En otra terminal, iniciar el frontend:
```bash
npm run dev
```

O iniciar ambos simultáneamente:
```bash
npm run dev:all
```

## 📡 API Endpoints

### Autenticación

#### POST `/auth/login`
Login de usuario.

**Request:**
```json
{
  "email": "admin@kiosco.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "business": { ... },
  "token": "token_1_1234567890"
}
```

#### POST `/auth/register`
Registro de nuevo usuario y negocio.

**Request:**
```json
{
  "email": "nuevo@negocio.com",
  "password": "password123",
  "name": "Nombre Usuario",
  "businessName": "Mi Negocio",
  "templateId": "kiosco",
  "address": "Dirección del negocio",
  "phone": "+54 11 1234-5678"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "business": { ... },
  "token": "token_..."
}
```

### Plantillas

#### GET `/templates`
Obtener todas las plantillas con contador de productos.

### Productos

#### GET `/products`
Obtener todos los productos del catálogo maestro.

#### GET `/products/:id`
Obtener un producto específico.

### Productos del Negocio

#### GET `/businesses/:businessId/products`
Obtener todos los productos de un negocio con detalles completos.

**Response:**
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
      ...
    }
  }
]
```

#### PATCH `/businessProducts/:id`
Actualizar stock o precio de un producto del negocio.

**Request:**
```json
{
  "stock": 150,
  "customPrice": 1300,
  "isActive": true
}
```

### Negocios

#### GET `/businesses/:id`
Obtener información de un negocio.

#### PATCH `/businesses/:id`
Actualizar información de un negocio.

## 🔄 Flujo de Trabajo

### 1. Registro de Usuario
1. Usuario completa formulario de registro
2. Selecciona tipo de plantilla (Kiosco, Ferretería, Carnicería)
3. Sistema crea:
   - Usuario nuevo
   - Negocio vinculado
   - BusinessProducts con todos los productos de la plantilla (stock inicial en 0)

### 2. Gestión de Productos
1. Usuario ve productos de su plantilla
2. Puede activar/desactivar productos
3. Puede modificar stock
4. Puede establecer precio personalizado (opcional)

### 3. Login
1. Usuario ingresa email y password
2. Sistema devuelve usuario, negocio y token
3. Frontend guarda en localStorage

## 🔐 Usuarios de Prueba

### Kiosco
- Email: `admin@kiosco.com`
- Password: `admin123`
- Negocio: Kiosco El Rápido

### Ferretería
- Email: `admin@ferreteria.com`
- Password: `admin123`
- Negocio: Ferretería Don José

### Carnicería
- Email: `admin@carniceria.com`
- Password: `admin123`
- Negocio: Carnicería La Pampa

## 📝 Notas Importantes

1. **Stock por Negocio**: Cada negocio tiene su propio stock independiente
2. **Precios Personalizados**: Los negocios pueden sobrescribir el precio base
3. **Productos Activos**: Los negocios pueden desactivar productos que no venden
4. **Plantillas Fijas**: Las plantillas son predefinidas y no se pueden modificar
5. **Productos Maestros**: El catálogo maestro es compartido, cada negocio decide qué productos usar

## 🛠️ Desarrollo

El servidor corre en `http://localhost:3001`

Para ver la base de datos completa:
```bash
GET http://localhost:3001/db
```

Para reiniciar la base de datos, simplemente edita `db.json` y reinicia el servidor.
