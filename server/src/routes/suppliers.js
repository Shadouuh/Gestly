import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { businessId } = req.query;
  try {
    let sql = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];
    if (businessId) { sql += ' AND business_id = ?'; params.push(Number(businessId)); }
    sql += ' ORDER BY name';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { business_id, name } = req.body;
  if (!business_id || !name) return res.status(400).json({ message: 'business_id y name requeridos' });
  try {
    const [result] = await pool.query('INSERT INTO suppliers (business_id, name) VALUES (?, ?)', [business_id, name]);
    const [row] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
});

export default router;
