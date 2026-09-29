import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, p.name AS plan_name, p.price AS plan_price,
        (SELECT COUNT(*) FROM business_users WHERE business_id = b.id) AS user_count,
        (SELECT COUNT(*) FROM branches WHERE business_id = b.id) AS branch_count,
        (SELECT COUNT(*) FROM products WHERE business_id = b.id AND active = 1) AS product_count
      FROM businesses b
      LEFT JOIN plans p ON p.id = b.plan_id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener negocios' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, p.name AS plan_name, p.price AS plan_price
      FROM businesses b
      LEFT JOIN plans p ON p.id = b.plan_id
      WHERE b.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Negocio no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener negocio' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  const allowed = ['name', 'rubro', 'status', 'plan_id', 'stock_mode', 'address', 'phone'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No hay campos para actualizar' });
  }
  try {
    await pool.query('UPDATE businesses SET ? WHERE id = ?', [updates, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar negocio' });
  }
});

// GET /businesses/:businessId/products — JOIN products + variants + inventories
router.get('/:businessId/products', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.business_id AS businessId,
        p.category_id,
        c.name AS categoryName,
        c.icon AS categoryIcon,
        c.color AS categoryColor,
        p.image_url AS imageUrl,
        p.name,
        p.sku,
        p.barcode,
        p.purchase_price AS purchasePrice,
        p.sale_price AS price,
        p.unit,
        p.active AS isActive,
        pv.id AS variantId,
        pv.name AS variantName,
        pv.extra_price AS variantExtraPrice,
        i.id AS inventoryId,
        i.branch_id AS branchId,
        i.current_stock AS stock,
        i.minimum_stock AS minStock,
        b.name AS branchName
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      LEFT JOIN inventories i ON i.variant_id = pv.id
      LEFT JOIN branches b ON b.id = i.branch_id
      WHERE p.business_id = ? AND p.deleted_at IS NULL
      ORDER BY p.name
    `, [req.params.businessId]);

    // Group by product with nested variants and branches
    const productMap = new Map();
    for (const row of rows) {
      if (!productMap.has(row.id)) {
        productMap.set(row.id, {
          id: row.id,
          businessId: row.businessId,
          categoryId: row.category_id,
          categoryName: row.categoryName || 'general',
          categoryIcon: row.categoryIcon || null,
          categoryColor: row.categoryColor || null,
          imageUrl: row.imageUrl || null,
          name: row.name,
          sku: row.sku,
          barcode: row.barcode,
          purchasePrice: row.purchasePrice,
          price: row.price,
          unit: row.unit,
          isActive: row.isActive,
          variants: [],
        });
      }
      const prod = productMap.get(row.id);
      if (row.variantId) {
        let variant = prod.variants.find(v => v.id === row.variantId);
        if (!variant) {
          variant = { id: row.variantId, name: row.variantName, extraPrice: row.variantExtraPrice, inventories: [] };
          prod.variants.push(variant);
        }
        if (row.inventoryId) {
          variant.inventories.push({
            id: row.inventoryId,
            branchId: row.branchId,
            branchName: row.branchName,
            stock: row.stock,
            minStock: row.minStock,
          });
        }
      }
    }
    const products = Array.from(productMap.values());
    const summary = {
      businessId: Number(req.params.businessId),
      productCount: products.length,
      variantCount: products.reduce((sum, product) => sum + (product.variants?.length || 0), 0),
      inventoryCount: products.reduce(
        (sum, product) => sum + (product.variants || []).reduce((variantSum, variant) => variantSum + (variant.inventories?.length || 0), 0),
        0
      ),
      sample: products.slice(0, 5).map((product) => ({
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        price: product.price,
        stock: (product.variants || []).reduce(
          (sum, variant) => sum + (variant.inventories || []).reduce((innerSum, inventory) => innerSum + Number(inventory.stock || 0), 0),
          0
        ),
        variantNames: (product.variants || []).map((variant) => variant.name),
      })),
    };

    console.log('[businesses/:id/products] response summary');
    console.dir(summary, { depth: null });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener productos del negocio' });
  }
});

// GET /businesses/:businessId/branches
router.get('/:businessId/branches', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          br.id,
          br.name,
          br.address,
          br.active,
          COALESCE(emp.employee_count, 0) AS employees,
          COALESCE(sales.today_sales, 0) AS todaySales,
          COALESCE(stock.stock_value, 0) AS stockValue,
          COALESCE(stock.products_count, 0) AS productsCount
        FROM branches br
        LEFT JOIN (
          SELECT
            eba.branch_id,
            COUNT(DISTINCT eba.business_user_id) AS employee_count
          FROM employee_branch_assignments eba
          JOIN business_users bu ON bu.id = eba.business_user_id
          WHERE bu.active = 1
          GROUP BY eba.branch_id
        ) emp ON emp.branch_id = br.id
        LEFT JOIN (
          SELECT
            s.branch_id,
            SUM(s.total) AS today_sales
          FROM sales s
          WHERE DATE(s.created_at) = CURDATE()
          GROUP BY s.branch_id
        ) sales ON sales.branch_id = br.id
        LEFT JOIN (
          SELECT
            i.branch_id,
            COUNT(DISTINCT pv.product_id) AS products_count,
            SUM(COALESCE(i.current_stock, 0) * COALESCE(p.purchase_price, 0)) AS stock_value
          FROM inventories i
          JOIN product_variants pv ON pv.id = i.variant_id
          JOIN products p ON p.id = pv.product_id
          WHERE p.deleted_at IS NULL
          GROUP BY i.branch_id
        ) stock ON stock.branch_id = br.id
        WHERE br.business_id = ?
        ORDER BY br.name
      `,
      [req.params.businessId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener sucursales' });
  }
});

// GET /businesses/:businessId/employees
router.get('/:businessId/employees', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bu.id, bu.role, bu.is_owner, bu.branch_id,
        u.id AS userId, u.name, u.email, u.phone
      FROM business_users bu
      JOIN users u ON u.id = bu.user_id
      WHERE bu.business_id = ?
      ORDER BY bu.is_owner DESC, u.name
    `, [req.params.businessId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
});

export default router;
