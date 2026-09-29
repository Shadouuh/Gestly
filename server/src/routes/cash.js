import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { business_id, branch_id } = req.query;
  if (!business_id) {
    return res.status(400).json({ message: 'business_id es requerido' });
  }
  try {
    let sql = 'SELECT * FROM cash_registers WHERE business_id = ?';
    const params = [Number(business_id)];
    if (branch_id) { sql += ' AND branch_id = ?'; params.push(Number(branch_id)); }
    sql += ' ORDER BY id DESC LIMIT 50';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener registros de caja' });
  }
});

router.get('/status', authMiddleware, async (req, res) => {
  const { businessId, branchId } = req.query;
  if (!businessId) {
    return res.status(400).json({ message: 'businessId es requerido' });
  }
  try {
    let sql = 'SELECT * FROM cash_registers WHERE business_id = ? AND status = ?';
    const params = [Number(businessId), 'OPEN'];
    if (branchId) { sql += ' AND branch_id = ?'; params.push(Number(branchId)); }
    sql += ' ORDER BY id DESC LIMIT 1';
    const [rows] = await pool.query(sql, params);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener estado de caja' });
  }
});

router.post('/open', authMiddleware, async (req, res) => {
  const { business_id, branch_id, initial_amount, opened_by_user_id } = req.body;
  if (!business_id || initial_amount === undefined) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }
  try {
    const [existing] = await pool.query(
      'SELECT id FROM cash_registers WHERE business_id = ? AND branch_id = ? AND status = ? LIMIT 1',
      [Number(business_id), Number(branch_id) || null, 'OPEN']
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Ya hay una caja abierta para esta sucursal' });
    }
    const [result] = await pool.query(
      `INSERT INTO cash_registers (business_id, branch_id, initial_amount, expected_close, opened_by_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(business_id), Number(branch_id) || null, Number(initial_amount), Number(initial_amount), opened_by_user_id || null]
    );
    const [row] = await pool.query('SELECT * FROM cash_registers WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al abrir caja' });
  }
});

router.post('/close', authMiddleware, async (req, res) => {
  const { business_id, branch_id, real_close, notes, closed_by_user_id } = req.body;
  if (!business_id || real_close === undefined) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }
  try {
    let sql = 'SELECT * FROM cash_registers WHERE business_id = ? AND status = ?';
    const params = [Number(business_id), 'OPEN'];
    if (branch_id) { sql += ' AND branch_id = ?'; params.push(Number(branch_id)); }
    sql += ' ORDER BY id DESC LIMIT 1';
    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay una caja abierta' });
    }
    const register = rows[0];
    await pool.query(
      `UPDATE cash_registers SET status = ?, closed_at = NOW(), real_close = ?, expected_close = ?, notes = ?, closed_by_user_id = ? WHERE id = ?`,
      ['CLOSED', Number(real_close), register.initial_amount + (Number(real_close) - register.initial_amount), notes || null, closed_by_user_id || null, register.id]
    );
    const [updated] = await pool.query('SELECT * FROM cash_registers WHERE id = ?', [register.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al cerrar caja' });
  }
});

export default router;
