import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { businessId, limit } = req.query;
  try {
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    if (businessId) { sql += ' AND business_id = ?'; params.push(Number(businessId)); }
    sql += ' ORDER BY name';
    if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)); }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener clientes' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { business_id, name, phone } = req.body;
  if (!business_id || !name) return res.status(400).json({ message: 'business_id y name requeridos' });
  try {
    const [result] = await pool.query(
      'INSERT INTO customers (business_id, name, phone) VALUES (?, ?, ?)',
      [business_id, name, phone || null]
    );
    const [row] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
});

export default router;
