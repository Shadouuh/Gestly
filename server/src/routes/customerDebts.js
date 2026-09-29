import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const { business_id, customer_id, status } = req.query;
  if (!business_id) return res.status(400).json({ message: 'business_id requerido' });
  try {
    let sql = 'SELECT cd.*, c.name as customer_name FROM customer_debts cd JOIN customers c ON cd.customer_id = c.id WHERE cd.business_id = ?';
    const params = [Number(business_id)];
    if (customer_id) { sql += ' AND cd.customer_id = ?'; params.push(Number(customer_id)); }
    if (status) { sql += ' AND cd.status = ?'; params.push(status); }
    sql += ' ORDER BY cd.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener deudas' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { business_id, customer_id, sale_id, branch_id, amount, notes } = req.body;
  if (!business_id || !customer_id || !amount) {
    return res.status(400).json({ message: 'business_id, customer_id, amount requeridos' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO customer_debts (business_id, customer_id, sale_id, branch_id, amount, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(business_id), Number(customer_id), sale_id || null, branch_id || null, Number(amount), notes || null]
    );
    await pool.query(
      'UPDATE customers SET debt_balance = COALESCE(debt_balance, 0) + ? WHERE id = ?',
      [Number(amount), Number(customer_id)]
    );
    const [row] = await pool.query('SELECT * FROM customer_debts WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear deuda' });
  }
});

router.post('/:id/pay', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ message: 'amount requerido' });
  try {
    const [existing] = await pool.query('SELECT * FROM customer_debts WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Deuda no encontrada' });
    const debt = existing[0];
    const newPaid = Number(debt.paid) + Number(amount);
    const newStatus = newPaid >= Number(debt.amount) ? 'paid' : 'partial';
    await pool.query(
      'UPDATE customer_debts SET paid = ?, status = ?, paid_at = CASE WHEN ? >= amount THEN NOW() ELSE NULL END WHERE id = ?',
      [newPaid, newStatus, newPaid, debt.id]
    );
    await pool.query(
      'UPDATE customers SET debt_balance = GREATEST(0, COALESCE(debt_balance, 0) - ?) WHERE id = ?',
      [Number(amount), debt.customer_id]
    );
    const [row] = await pool.query('SELECT * FROM customer_debts WHERE id = ?', [debt.id]);
    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al pagar deuda' });
  }
});

export default router;
