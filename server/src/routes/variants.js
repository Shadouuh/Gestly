import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  const { product_id, name, extra_price } = req.body;
  if (!product_id || !name) {
    return res.status(400).json({ message: 'product_id y name requeridos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO product_variants (product_id, name, extra_price) VALUES (?, ?, ?)',
      [product_id, name, extra_price || 0]
    );
    const variantId = result.insertId;

    const [branches] = await pool.query('SELECT id FROM branches WHERE business_id = (SELECT business_id FROM products WHERE id = ?)', [product_id]);
    for (const branch of branches) {
      await pool.query(
        'INSERT INTO inventories (variant_id, branch_id, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
        [variantId, branch.id, 0, 10]
      );
    }

    const [row] = await pool.query('SELECT * FROM product_variants WHERE id = ?', [variantId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear variante' });
  }
});

export default router;
