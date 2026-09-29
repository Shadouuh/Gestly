import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const getProductDetails = async (productId) => {
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
    WHERE p.id = ? AND p.deleted_at IS NULL
    ORDER BY p.name
  `, [productId]);

  if (rows.length === 0) return null;

  const product = {
    id: rows[0].id,
    businessId: rows[0].businessId,
    categoryId: rows[0].category_id,
    categoryName: rows[0].categoryName || 'general',
    categoryIcon: rows[0].categoryIcon || null,
    categoryColor: rows[0].categoryColor || null,
    imageUrl: rows[0].imageUrl || null,
    name: rows[0].name,
    sku: rows[0].sku,
    barcode: rows[0].barcode,
    purchasePrice: rows[0].purchasePrice,
    price: rows[0].price,
    unit: rows[0].unit,
    isActive: Boolean(rows[0].isActive),
    variants: [],
  };

  for (const row of rows) {
    if (!row.variantId) continue;

    let variant = product.variants.find((item) => item.id === row.variantId);
    if (!variant) {
      variant = {
        id: row.variantId,
        name: row.variantName,
        extraPrice: row.variantExtraPrice,
        inventories: [],
      };
      product.variants.push(variant);
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

  return product;
};

// GET /products — all products across all businesses (for admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, b.name AS business_name, c.name AS category_name
      FROM products p
      LEFT JOIN businesses b ON b.id = p.business_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET /products/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await getProductDetails(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// POST /products — create a product + default variant + inventory for all branches
router.post('/', authMiddleware, async (req, res) => {
  const {
    business_id,
    category_id,
    name,
    sku,
    barcode,
    purchase_price,
    sale_price,
    unit,
    image_url,
    branch_ids,
    inventories,
  } = req.body;
  if (!business_id || !name) {
    return res.status(400).json({ message: 'business_id y name son requeridos' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO products (business_id, category_id, name, sku, barcode, purchase_price, sale_price, unit, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [business_id, category_id || null, name, sku || null, barcode || null, purchase_price || 0, sale_price || 0, unit || 'u', image_url || null]
    );
    const productId = result.insertId;

    // Create default variant
    const [varResult] = await pool.query(
      'INSERT INTO product_variants (product_id, name, extra_price) VALUES (?, ?, ?)',
      [productId, 'Default', 0]
    );
    const variantId = varResult.insertId;

    const requestedBranchIds = Array.isArray(branch_ids)
      ? [...new Set(branch_ids.map((value) => Number(value)).filter(Boolean))]
      : [];
    const inventoryMap = new Map(
      (Array.isArray(inventories) ? inventories : [])
        .map((inventory) => ({
          branchId: Number(inventory?.branch_id || inventory?.branchId),
          currentStock: Number(inventory?.current_stock ?? inventory?.currentStock ?? 0) || 0,
          minimumStock: Number(inventory?.minimum_stock ?? inventory?.minimumStock ?? 0) || 0,
        }))
        .filter((inventory) => inventory.branchId)
        .map((inventory) => [inventory.branchId, inventory])
    );

    // Create inventory for the selected branches or all branches by default
    const [branches] = await pool.query(
      `SELECT id FROM branches
       WHERE business_id = ?
         ${requestedBranchIds.length > 0 ? `AND id IN (${requestedBranchIds.map(() => '?').join(',')})` : ''}`,
      requestedBranchIds.length > 0 ? [business_id, ...requestedBranchIds] : [business_id]
    );
    for (const branch of branches) {
      const inventory = inventoryMap.get(Number(branch.id));
      await pool.query(
        'INSERT INTO inventories (variant_id, branch_id, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
        [
          variantId,
          branch.id,
          inventory?.currentStock ?? 0,
          inventory?.minimumStock ?? 0,
        ]
      );
    }

    const product = await getProductDetails(productId);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// PATCH /products/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  const allowed = ['category_id', 'name', 'sku', 'barcode', 'purchase_price', 'sale_price', 'unit', 'image_url', 'active'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No hay campos para actualizar' });
  }
  try {
    await pool.query('UPDATE products SET ? WHERE id = ?', [updates, req.params.id]);
    const product = await getProductDetails(req.params.id);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// DELETE /products/:id (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE products SET deleted_at = NOW(), active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

export default router;
