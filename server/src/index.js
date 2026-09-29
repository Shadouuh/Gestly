import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import businessRoutes from './routes/businesses.js';
import productRoutes from './routes/products.js';
import variantRoutes from './routes/variants.js';
import saleRoutes from './routes/sales.js';
import cashMovementRoutes from './routes/cashMovements.js';
import cashRoutes from './routes/cash.js';
import templateRoutes from './routes/templates.js';
import planRoutes from './routes/plans.js';
import userRoutes from './routes/users.js';
import branchRoutes from './routes/branches.js';
import customerRoutes from './routes/customers.js';
import supplierRoutes from './routes/suppliers.js';
import categoryRoutes from './routes/categories.js';
import inventoryRoutes from './routes/inventory.js';
import businessProductRoutes from './routes/businessProducts.js';
import appEmployeeRoutes from './routes/appEmployees.js';
import adminRoutes from './routes/admin.js';
import ocrRoutes from './routes/ocr.js';
import customerDebtRoutes from './routes/customerDebts.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Auth (no middleware needed)
app.use('/auth', authRoutes);

// Users
app.use('/users', userRoutes);

// Businesses
app.use('/businesses', businessRoutes);

// Products
app.use('/products', productRoutes);

// Variants
app.use('/variants', variantRoutes);

// Branches
app.use('/branches', branchRoutes);

// Sales
app.use('/salesTransactions', saleRoutes);

// Cash movements
app.use('/cashMovements', cashMovementRoutes);

// Cash registers
app.use('/cash', cashRoutes);

// Templates
app.use('/templates', templateRoutes);

// Plans
app.use('/plans', planRoutes);

// Customers
app.use('/customers', customerRoutes);

// Suppliers
app.use('/suppliers', supplierRoutes);

// Categories
app.use('/categories', categoryRoutes);

// Inventory
app.use('/inventory', inventoryRoutes);

// Business Products (legacy-compat)
app.use('/businessProducts', businessProductRoutes);

// App Employees
app.use('/appEmployees', appEmployeeRoutes);

// Admin
app.use('/admin', adminRoutes);

// OCR
app.use('/ocr', ocrRoutes);

// Customer Debts (Fiado)
app.use('/customerDebts', customerDebtRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const server = app.listen(PORT, () => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const geminiPreview = hasGemini ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'NO CONFIGURADA';

  console.log(`\n  Gestly API corriendo en http://localhost:${PORT}\n`);
  console.log(`  Gemini API:  ${hasGemini ? '✓ ' + geminiPreview : '✗ ' + geminiPreview}`);
  console.log(`  Auth:        POST /auth/login  |  POST /auth/register`);
  console.log(`  Users:       GET  /users`);
  console.log(`  Businesses:  GET  /businesses`);
  console.log(`  Products:    GET|POST /products`);
  console.log(`  Variants:    GET|POST /variants`);
  console.log(`  Branches:    GET  /branches`);
  console.log(`  Sales:       GET|POST /salesTransactions`);
  console.log(`  Cash:        GET  /cashMovements  |  GET  /cash`);
  console.log(`  Templates:   GET  /templates`);
  console.log(`  Plans:       GET  /plans`);
  console.log(`  Categories:  GET|POST /categories`);
  console.log(`  Customers:   GET  /customers`);
  console.log(`  Suppliers:   GET  /suppliers`);
  console.log(`  Inventory:   GET  /inventory`);
  console.log(`  OCR Legacy:  GET  /ocr/health  |  POST /ocr/catalog/analyze`);
  console.log(`  OCR Gemini:  GET  /ocr/gemini/health  |  POST /ocr/gemini/analyze`);
  console.log(`  Health:      GET  /api/health\n`);
});

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(`No se pudo iniciar Gestly API: el puerto ${PORT} ya esta en uso.`);
    console.error('Cerrando el proceso actual para evitar reinicios con stack no manejado.');
    process.exit(1);
  }

  console.error('No se pudo iniciar Gestly API:', error);
  process.exit(1);
});
