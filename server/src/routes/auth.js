import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    const [bizRows] = await pool.query(
      `SELECT
         b.*,
         bu.id AS business_user_id,
         bu.role AS user_role,
         bu.is_owner AS user_is_owner,
         bu.active AS user_active
       FROM businesses b
       JOIN business_users bu ON bu.business_id = b.id
       WHERE bu.user_id = ? AND bu.active = 1
       ORDER BY bu.is_owner DESC, bu.id ASC
       LIMIT 1`,
      [user.id]
    );
    const business = bizRows.length > 0 ? bizRows[0] : null;
    let assignedBranches = [];

    if (business?.business_user_id) {
      const [branchRows] = await pool.query(
        `SELECT br.id, br.name
         FROM employee_branch_assignments eba
         JOIN branches br ON br.id = eba.branch_id
         WHERE eba.business_user_id = ?
         ORDER BY br.name`,
        [business.business_user_id]
      );
      assignedBranches = branchRows.map((branch) => ({
        id: String(branch.id),
        name: branch.name,
      }));
    }

    const { password_hash, ...userData } = user;
    const token = generateToken({
      id: user.id,
      email: user.email,
      businessId: business?.id,
      businessUserId: business?.business_user_id,
      role: business?.user_role,
      isOwner: Boolean(business?.user_is_owner),
    });

    const normalizedBusiness = business
      ? {
          ...business,
          business_user_id: undefined,
          user_role: undefined,
          user_is_owner: undefined,
          user_active: undefined,
        }
      : null;
    const normalizedUser = {
      ...userData,
      businessUserId: business?.business_user_id || null,
      role: business?.user_role || null,
      isOwner: Boolean(business?.user_is_owner),
      assignedBranches,
    };

    res.json({ success: true, user: normalizedUser, business: normalizedBusiness, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

router.post('/register', async (req, res) => {
  const { email, password, name, businessName, templateId, address, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    const password_hash = await bcrypt.hash(password, 10);

    // Fetch plan (default plan or first one)
    const [plans] = await pool.query('SELECT id FROM plans ORDER BY id LIMIT 1');
    const planId = plans.length > 0 ? plans[0].id : null;

    const [userResult] = await pool.query(
      'INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)',
      [email, password_hash, name, phone || null]
    );
    const userId = userResult.insertId;

    const slug = (businessName || `${name}'s Business`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + userId;

    const [bizResult] = await pool.query(
      'INSERT INTO businesses (plan_id, name, slug, rubro, status) VALUES (?, ?, ?, ?, ?)',
      [planId, businessName || `${name}'s Negocio`, slug, templateId || 'kiosco', 'TRIAL']
    );
    const businessId = bizResult.insertId;

    await pool.query(
      'INSERT INTO business_users (business_id, user_id, role, is_owner) VALUES (?, ?, ?, ?)',
      [businessId, userId, 'OWNER', true]
    );

    // Create default branch
    const [branchResult] = await pool.query(
      'INSERT INTO branches (business_id, name, address) VALUES (?, ?, ?)',
      [businessId, 'Sucursal Principal', address || '']
    );
    const branchId = branchResult.insertId;

    await pool.query(
      'INSERT IGNORE INTO employee_profiles (business_user_id, active) VALUES ((SELECT id FROM business_users WHERE business_id = ? AND user_id = ? LIMIT 1), ?)',
      [businessId, userId, true]
    );
    await pool.query(
      'INSERT IGNORE INTO employee_branch_assignments (business_user_id, branch_id) VALUES ((SELECT id FROM business_users WHERE business_id = ? AND user_id = ? LIMIT 1), ?)',
      [businessId, userId, branchId]
    );

    // Copy template products if templateId matches a known rubro
    const [templateProds] = await pool.query(
      'SELECT id, sale_price, purchase_price, name, unit, category_id FROM template_products WHERE rubro = ?',
      [templateId || 'kiosco']
    );

    // Get or create a default category
    const [cats] = await pool.query('SELECT id FROM categories WHERE business_id = ? LIMIT 1', [businessId]);
    let catId = null;
    if (cats.length > 0) {
      catId = cats[0].id;
    }

    for (const tp of templateProds) {
      const [prodResult] = await pool.query(
        `INSERT INTO products (business_id, category_id, name, purchase_price, sale_price, unit, active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [businessId, catId, tp.name, tp.purchase_price || 0, tp.sale_price, tp.unit || 'u', true]
      );
      const productId = prodResult.insertId;

      // Create default variant + inventory
      const [varResult] = await pool.query(
        'INSERT INTO product_variants (product_id, name, extra_price) VALUES (?, ?, ?)',
        [productId, 'Default', 0]
      );
      const variantId = varResult.insertId;

      // Get all branches for this business
      const [branches] = await pool.query('SELECT id FROM branches WHERE business_id = ?', [businessId]);
      for (const branch of branches) {
        await pool.query(
          'INSERT INTO inventories (variant_id, branch_id, current_stock, minimum_stock) VALUES (?, ?, ?, ?)',
          [variantId, branch.id, 0, 10]
        );
      }
    }

    const [newUser] = await pool.query('SELECT id, email, name, phone, created_at FROM users WHERE id = ?', [userId]);
    const [newBusiness] = await pool.query('SELECT * FROM businesses WHERE id = ?', [businessId]);

    const [branchRows] = await pool.query('SELECT id, name FROM branches WHERE business_id = ? ORDER BY name', [businessId]);
    const token = generateToken({ id: userId, email, businessId });

    res.status(201).json({
      success: true,
      user: {
        ...newUser[0],
        businessUserId: null,
        role: 'OWNER',
        isOwner: true,
        assignedBranches: branchRows.map((branch) => ({ id: String(branch.id), name: branch.name })),
      },
      business: newBusiness[0],
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
