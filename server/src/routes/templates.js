import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, description, icon, color,
        (SELECT COUNT(*) FROM template_products WHERE rubro = t.id) AS product_count
      FROM templates t
      ORDER BY name
    `);
    // Add defaultProducts array for backwards compat
    for (const t of rows) {
      const [prods] = await pool.query('SELECT id FROM template_products WHERE rubro = ?', [t.id]);
      t.defaultProducts = prods.map(p => p.id);
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener plantillas' });
  }
});

export default router;
