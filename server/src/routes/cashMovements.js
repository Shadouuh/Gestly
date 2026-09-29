import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { businessId, branchId, limit } = req.query;
  try {
    let sql = 'SELECT cm.*, u.name AS created_by_name FROM cash_movements cm LEFT JOIN users u ON u.id = cm.created_by_user_id WHERE 1=1';
    const params = [];
    if (businessId) { sql += ' AND cm.business_id = ?'; params.push(Number(businessId)); }
    if (branchId) { sql += ' AND cm.branch_id = ?'; params.push(Number(branchId)); }
    sql += ' ORDER BY cm.created_at DESC';
    if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)); }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener movimientos de caja' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { business_id, branch_id, type, category, description, amount, created_by_user_id, related_sale_id } = req.body;
  if (!business_id || !type || !amount) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO cash_movements (business_id, branch_id, type, category, description, amount, created_by_user_id, related_sale_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [business_id, branch_id || null, type, category || null, description || null, amount, created_by_user_id || null, related_sale_id || null]
    );
    const [row] = await pool.query('SELECT * FROM cash_movements WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear movimiento de caja' });
  }
});

export default router;
