-- ============================================================
-- Gestly — Esquema Completo de Base de Datos
-- Motor: MySQL / MariaDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestly;

-- ============================================================
-- PLANES DE SUSCRIPCIÓN
-- ============================================================
CREATE TABLE plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  config_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PLANTILLAS DE RUBRO (catálogo global de productos por rubro)
-- ============================================================
CREATE TABLE templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTOS DE PLANTILLA (catálogo global)
-- ============================================================
CREATE TABLE template_products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rubro VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  sale_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  purchase_price DECIMAL(15,2) DEFAULT 0,
  category VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'u',
  image VARCHAR(255),
  use_icon BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NEGOCIOS
-- ============================================================
CREATE TABLE businesses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  plan_id BIGINT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE,
  rubro VARCHAR(100),
  status ENUM('ACTIVE','TRIAL','SUSPENDED') DEFAULT 'TRIAL',
  stock_mode ENUM('SIMPLE','LOTES') DEFAULT 'SIMPLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SUCURSALES
-- ============================================================
CREATE TABLE branches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- ============================================================
-- USUARIOS DE NEGOCIO (relación muchos a muchos con roles)
-- ============================================================
CREATE TABLE business_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  role ENUM('OWNER','ADMIN','SELLER','CASHIER') DEFAULT 'SELLER',
  is_owner BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ============================================================
-- CATEGORÍAS DE PRODUCTOS
-- ============================================================
CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- ============================================================
-- PRODUCTOS (por negocio)
-- ============================================================
CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  category_id BIGINT NULL,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  name VARCHAR(150) NOT NULL,
  purchase_price DECIMAL(15,2) DEFAULT 0,
  sale_price DECIMAL(15,2) DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'u',
  active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============================================================
-- VARIANTES DE PRODUCTO (por ej: talle, color)
-- ============================================================
CREATE TABLE product_variants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  extra_price DECIMAL(15,2) DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================
-- INVENTARIO (stock por variante y sucursal)
-- ============================================================
CREATE TABLE inventories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  variant_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  current_stock DECIMAL(15,3) DEFAULT 0,
  minimum_stock DECIMAL(15,3) DEFAULT 0,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ============================================================
-- MOVIMIENTOS DE INVENTARIO (stock log)
-- ============================================================
CREATE TABLE inventory_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  variant_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  type ENUM('PURCHASE','SALE','ADJUSTMENT','LOSS','TRANSFER') NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50)
);

-- ============================================================
-- PROVEEDORES
-- ============================================================
CREATE TABLE suppliers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL
);

-- ============================================================
-- VENTAS
-- ============================================================
CREATE TABLE sales (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  customer_id BIGINT NULL,
  seller_id BIGINT,
  payment_method VARCHAR(50),
  subtotal DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ============================================================
-- ITEMS DE VENTA
-- ============================================================
CREATE TABLE sale_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sale_id BIGINT NOT NULL,
  product_id BIGINT,
  product_name VARCHAR(150),
  quantity DECIMAL(15,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  purchase_price DECIMAL(15,2) DEFAULT 0,
  subtotal DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

-- ============================================================
-- MOVIMIENTOS DE CAJA (ingresos/egresos financieros)
-- ============================================================
CREATE TABLE cash_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  business_id BIGINT NOT NULL,
  branch_id BIGINT,
  type ENUM('expense','income') NOT NULL,
  category VARCHAR(100),
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  created_by_user_id BIGINT,
  related_sale_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- ============================================================
-- ÍNDICES RECOMENDADOS
-- ============================================================
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_rubro ON businesses(rubro);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_sales_business ON sales(business_id);
CREATE INDEX idx_sales_created ON sales(created_at);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_inventories_variant ON inventories(variant_id);
CREATE INDEX idx_inventories_branch ON inventories(branch_id);
CREATE INDEX idx_cash_movements_business ON cash_movements(business_id);
CREATE INDEX idx_template_products_rubro ON template_products(rubro);
