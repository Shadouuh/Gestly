import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { businessId } = req.query;
  try {
    let sql = 'SELECT * FROM branches WHERE 1=1';
    const params = [];
    if (businessId) { sql += ' AND business_id = ?'; params.push(Number(businessId)); }
    sql += ' ORDER BY name';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener sucursales' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { business_id, name, address } = req.body;
  if (!business_id || !name) {
    return res.status(400).json({ message: 'business_id y name requeridos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO branches (business_id, name, address) VALUES (?, ?, ?)',
      [business_id, name, address || null]
    );
    const branchId = result.insertId;
    const [variants] = await pool.query(
      `SELECT pv.id
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE p.business_id = ? AND p.deleted_at IS NULL`,
      [business_id]
    );
    for (const variant of variants) {
      await pool.query(
        'INSERT IGNORE INTO inventories (variant_id, branch_id, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
        [variant.id, branchId, 0, 0]
      );
    }
    const [row] = await pool.query('SELECT * FROM branches WHERE id = ?', [branchId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear sucursal' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  const allowed = ['name', 'address', 'active'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No hay campos' });
  try {
    await pool.query('UPDATE branches SET ? WHERE id = ?', [updates, req.params.id]);
    const [row] = await pool.query('SELECT * FROM branches WHERE id = ?', [req.params.id]);
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar sucursal' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE branches SET active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar sucursal' });
  }
});

export default router;
