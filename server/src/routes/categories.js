import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { businessId } = req.query;
  try {
    let sql = 'SELECT * FROM categories WHERE deleted_at IS NULL';
    const params = [];
    if (businessId) { sql += ' AND business_id = ?'; params.push(Number(businessId)); }
    sql += ' ORDER BY name';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { business_id, parent_id, name, icon, color } = req.body;
  if (!business_id || !name) return res.status(400).json({ message: 'business_id y name requeridos' });
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (business_id, parent_id, name, icon, color) VALUES (?, ?, ?, ?, ?)',
      [business_id, parent_id || null, name, icon || null, color || null]
    );
    const [row] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear categoría' });
  }
});

export default router;
