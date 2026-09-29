import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { branchId, variantId, lowStock } = req.query;
  try {
    let sql = `
      SELECT i.*, p.name AS product_name, pv.name AS variant_name, b.name AS branch_name
      FROM inventories i
      JOIN product_variants pv ON pv.id = i.variant_id
      JOIN products p ON p.id = pv.product_id
      JOIN branches b ON b.id = i.branch_id
      WHERE p.deleted_at IS NULL
    `;
    const params = [];
    if (branchId) { sql += ' AND i.branch_id = ?'; params.push(Number(branchId)); }
    if (variantId) { sql += ' AND i.variant_id = ?'; params.push(Number(variantId)); }
    if (lowStock === 'true') { sql += ' AND i.current_stock <= i.minimum_stock'; }
    sql += ' ORDER BY p.name';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener inventario' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  const { current_stock, minimum_stock } = req.body;
  try {
    const updates = {};
    if (current_stock !== undefined) updates.current_stock = current_stock;
    if (minimum_stock !== undefined) updates.minimum_stock = minimum_stock;
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No hay campos' });
    await pool.query('UPDATE inventories SET ? WHERE id = ?', [updates, req.params.id]);
    const [row] = await pool.query('SELECT * FROM inventories WHERE id = ?', [req.params.id]);
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar inventario' });
  }
});

export default router;
