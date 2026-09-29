import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) return res.status(400).json({ message: 'businessId requerido' });
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.sku, p.barcode, p.purchase_price, p.sale_price, p.unit,
        COALESCE(i.current_stock, 0) AS stock, c.name AS category_name,
        (SELECT SUM(si.quantity) FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE si.product_id = p.id AND s.business_id = p.business_id) AS total_sold
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      LEFT JOIN inventories i ON i.variant_id = pv.id
      WHERE p.business_id = ? AND p.active = 1 AND p.deleted_at IS NULL
      GROUP BY p.id
      ORDER BY p.name
    `, [Number(businessId)]);
    const data = rows.map(r => ({
      id: r.id,
      businessId: Number(businessId),
      productId: r.id,
      stock: r.stock || 0,
      customPrice: null,
      isActive: true,
      product: { id: r.id, name: r.name, purchasePrice: r.purchase_price, price: r.sale_price, category: r.category_name || 'general', image: '', sku: r.sku, barcode: r.barcode, unit: r.unit },
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener productos del negocio' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { businessId, productId, stock, customPrice } = req.body;
  if (!businessId || !productId) return res.status(400).json({ message: 'businessId y productId requeridos' });
  try {
    const [variantRows] = await pool.query('SELECT id FROM product_variants WHERE product_id = ? LIMIT 1', [productId]);
    if (variantRows.length > 0) {
      const branchRows = await pool.query('SELECT id FROM branches WHERE business_id = ?', [businessId]);
      for (const b of branchRows[0]) {
        await pool.query(
          'INSERT IGNORE INTO inventories (variant_id, branch_id, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
          [variantRows[0].id, b.id, stock || 0, 0]
        );
      }
    }
    const [prod] = await pool.query('SELECT id, name, purchase_price, sale_price FROM products WHERE id = ?', [productId]);
    res.status(201).json({
      id: productId, businessId, productId, stock: stock || 0,
      customPrice: customPrice || null, isActive: true,
      product: prod[0] ? { id: prod[0].id, name: prod[0].name, purchasePrice: prod[0].purchase_price, price: prod[0].sale_price, category: 'general', image: '' } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear producto del negocio' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { customPrice } = req.body;
    if (customPrice !== undefined) {
      const [prod] = await pool.query('SELECT id, sale_price FROM products WHERE id = ?', [req.params.id]);
      if (prod.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const [prod] = await pool.query('SELECT id, name, purchase_price, sale_price FROM products WHERE id = ?', [req.params.id]);
    res.json({ id: Number(req.params.id), customPrice: customPrice || null, isActive: true, product: prod[0] ? { id: prod[0].id, name: prod[0].name, purchasePrice: prod[0].purchase_price, price: prod[0].sale_price } : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE products SET deleted_at = NOW(), active = 0 WHERE id = ?', [req.params.id]);
    await pool.query('UPDATE product_variants SET deleted_at = NOW(), active = 0 WHERE product_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

export default router;
