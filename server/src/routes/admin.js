import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const safeQuery = async (sql, defaultVal = 0) => { try { const [r] = await pool.query(sql); const v = Object.values(r[0] || {})[0]; return v ?? defaultVal; } catch { return defaultVal; } };
    const totalUsers = await safeQuery('SELECT COUNT(*) AS v FROM users');
    const totalBusinesses = await safeQuery('SELECT COUNT(*) AS v FROM businesses');
    const activeBusinesses = await safeQuery("SELECT COUNT(*) AS v FROM businesses WHERE deleted_at IS NULL");
    const totalProducts = await safeQuery("SELECT COUNT(*) AS v FROM products WHERE active = 1 AND deleted_at IS NULL");
    const totalCities = await safeQuery("SELECT COUNT(DISTINCT city) AS v FROM businesses WHERE city IS NOT NULL AND city != ''");
    const monthlySales = Number(await safeQuery("SELECT COALESCE(SUM(total), 0) AS v FROM sales WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
    res.json({ totalUsers, totalBusinesses, activeBusinesses, totalProducts, totalCities, monthlySales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

router.get('/users', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at, u.phone,
        COALESCE((SELECT b.name FROM businesses b JOIN business_users bu ON bu.business_id = b.id WHERE bu.user_id = u.id LIMIT 1), '—') AS business,
        (SELECT COALESCE(b.city, '—') FROM businesses b JOIN business_users bu ON bu.business_id = b.id WHERE bu.user_id = u.id LIMIT 1) AS city,
        COALESCE((SELECT bu.role FROM business_users bu WHERE bu.user_id = u.id LIMIT 1), '—') AS role,
        CASE WHEN u.id = 1 THEN 'active' ELSE 'active' END AS status,
        u.created_at AS lastLogin
      FROM users u ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

router.get('/businesses', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.name, b.rubro, b.city, b.address, b.phone, b.email, b.created_at,
        (SELECT COUNT(*) FROM products WHERE business_id = b.id AND active = 1 AND deleted_at IS NULL) AS product_count,
        (SELECT COUNT(*) FROM business_users WHERE business_id = b.id) AS user_count,
        (SELECT COUNT(*) FROM branches WHERE business_id = b.id) AS branch_count,
        (SELECT COALESCE(SUM(total), 0) FROM sales WHERE business_id = b.id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS monthly_sales
      FROM businesses b ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener negocios' });
  }
});

router.get('/events', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT 'user' AS type, CONCAT('Nuevo usuario registrado: ', name) AS msg, created_at AS time FROM users ORDER BY created_at DESC LIMIT 3");
    const [businesses] = await pool.query("SELECT 'business' AS type, CONCAT(name, ' se registró en la plataforma') AS msg, created_at AS time FROM businesses ORDER BY created_at DESC LIMIT 3");
    const events = [...users, ...businesses].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);
    res.json(events.map(e => ({ type: e.type, msg: e.msg, time: formatTimeAgo(e.time) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
});

function formatTimeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} hs`;
  return `Hace ${Math.floor(hrs / 24)} días`;
}

export default router;
