import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /salesTransactions
router.get('/', authMiddleware, async (req, res) => {
  const { businessId, branchId, limit, status } = req.query;
  try {
    let sql = `
      SELECT s.*, b.name AS branch_name,
        c.name AS customer_name,
        (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) AS item_count
      FROM sales s
      LEFT JOIN branches b ON b.id = s.branch_id
      LEFT JOIN customers c ON c.id = s.customer_id
      WHERE 1=1
    `;
    const params = [];
    if (businessId) { sql += ' AND s.business_id = ?'; params.push(Number(businessId)); }
    if (branchId) { sql += ' AND s.branch_id = ?'; params.push(Number(branchId)); }
    if (status) { sql += ' AND s.status = ?'; params.push(status); }
    sql += ' ORDER BY s.created_at DESC';
    if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)); }

    const [sales] = await pool.query(sql, params);

    for (const sale of sales) {
      const [items] = await pool.query(
        'SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id',
        [sale.id]
      );
      sale.items = items;
    }
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
});

// GET /salesTransactions/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [sales] = await pool.query(
      'SELECT s.*, b.name AS branch_name FROM sales s LEFT JOIN branches b ON b.id = s.branch_id WHERE s.id = ?',
      [req.params.id]
    );
    if (sales.length === 0) return res.status(404).json({ message: 'Venta no encontrada' });
    const [items] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [sales[0].id]);
    sales[0].items = items;
    res.json(sales[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener venta' });
  }
});

// POST /salesTransactions — create sale with items
router.post('/', authMiddleware, async (req, res) => {
  const { business_id, branch_id, customer_id, seller_id, payment_method, subtotal, discount, total, status, items } = req.body;
  if (!business_id || !branch_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Datos de venta incompletos' });
  }
  try {
    const saleStatus = status || (payment_method === 'fiado' ? 'pending' : 'paid');
    const [result] = await pool.query(
      `INSERT INTO sales (business_id, branch_id, customer_id, seller_id, payment_method, subtotal, total, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [business_id, branch_id, customer_id || null, seller_id || null, payment_method || 'cash', subtotal || 0, total || 0, saleStatus]
    );
    const saleId = result.insertId;

    for (const item of items) {
      await pool.query(
        `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, purchase_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [saleId, item.product_id, item.name || item.product_name, item.qty || item.quantity, item.unit_price, item.purchase_price || 0, (item.qty || item.quantity) * item.unit_price]
      );
      // Update inventory
      if (item.variant_id) {
        const [inventories] = await pool.query(
          'SELECT id FROM inventories WHERE variant_id = ? AND branch_id = ? LIMIT 1',
          [item.variant_id, branch_id]
        );
        if (inventories.length > 0) {
          await pool.query(
            'UPDATE inventories SET current_stock = current_stock - ? WHERE id = ?',
            [item.qty || item.quantity, inventories[0].id]
          );
        }
      }
    }

    const [sale] = await pool.query('SELECT * FROM sales WHERE id = ?', [saleId]);
    const [saleItems] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);
    sale[0].items = saleItems;
    res.status(201).json(sale[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear venta' });
  }
});

// PATCH /salesTransactions/:id/status — update sale status (paid/pending/voided)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['paid', 'pending', 'voided'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido' });
  }
  try {
    await pool.query('UPDATE sales SET status = ? WHERE id = ?', [status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar venta' });
  }
});

// DELETE /salesTransactions/:id — void sale and restore stock
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [sales] = await pool.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
    if (sales.length === 0) return res.status(404).json({ message: 'Venta no encontrada' });
    const sale = sales[0];

    const [items] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale.id]);

    // Restore inventory stock
    for (const item of items) {
      if (item.product_id) {
        const variants = await pool.query(
          'SELECT id FROM product_variants WHERE product_id = ?',
          [item.product_id]
        );
        for (const v of variants[0]) {
          const [inventories] = await pool.query(
            'SELECT id FROM inventories WHERE variant_id = ? AND branch_id = ? LIMIT 1',
            [v.id, sale.branch_id]
          );
          if (inventories.length > 0) {
            await pool.query(
              'UPDATE inventories SET current_stock = current_stock + ? WHERE id = ?',
              [item.quantity, inventories[0].id]
            );
          }
        }
      }
    }

    // If fiado, remove the debt
    if (sale.payment_method === 'fiado' && sale.customer_id) {
      await pool.query(
        'UPDATE customers SET debt_balance = GREATEST(0, COALESCE(debt_balance, 0) - ?) WHERE id = ?',
        [sale.total, sale.customer_id]
      );
      await pool.query(
        'UPDATE customer_debts SET status = ? WHERE sale_id = ? AND status != ?',
        ['voided', sale.id, 'paid']
      );
    }

    // Mark sale as voided
    await pool.query('UPDATE sales SET status = ? WHERE id = ?', ['voided', sale.id]);
    res.json({ message: 'Venta anulada y stock restaurado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al anular venta' });
  }
});

export default router;
