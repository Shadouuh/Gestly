import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const normalizeRole = (role) => {
  const value = String(role || 'SELLER').trim().toUpperCase();
  const allowed = new Set(['OWNER', 'ADMIN', 'MANAGER', 'SELLER', 'CASHIER', 'STOCKER', 'ANALYST']);
  return allowed.has(value) ? value : 'SELLER';
};

const mapEmployeeRows = (rows) => {
  const employees = [];
  const byBusinessUserId = new Map();

  for (const row of rows) {
    if (!byBusinessUserId.has(row.id)) {
      const employee = {
        id: row.id,
        userId: row.userId,
        businessId: row.businessId,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        isOwner: Boolean(row.is_owner),
        active: Boolean(row.profile_active ?? row.membership_active),
        baseSalary: Number(row.base_salary || 0),
        commission: Number(row.commission_rate || 0),
        hoursPerWeek: Number(row.hours_per_week || 40),
        schedule: row.schedule || '',
        createdAt: row.created_at,
        sales: Number(row.sales || 0),
        branches: [],
        branchIds: [],
      };
      byBusinessUserId.set(row.id, employee);
      employees.push(employee);
    }

    const employee = byBusinessUserId.get(row.id);
    if (row.branchId && !employee.branchIds.includes(String(row.branchId))) {
      employee.branchIds.push(String(row.branchId));
      employee.branches.push({
        id: String(row.branchId),
        name: row.branchName || `Sucursal ${row.branchId}`,
      });
    }
  }

  return employees;
};

const getEmployeesByBusiness = async (businessId) => {
  const [rows] = await pool.query(
    `
      SELECT
        bu.id,
        bu.business_id AS businessId,
        bu.user_id AS userId,
        bu.role,
        bu.is_owner,
        bu.active AS membership_active,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        ep.base_salary,
        ep.commission_rate,
        ep.hours_per_week,
        ep.schedule,
        ep.active AS profile_active,
        eba.branch_id AS branchId,
        br.name AS branchName,
        COALESCE((
          SELECT SUM(s.total)
          FROM sales s
          WHERE s.business_id = bu.business_id
            AND s.seller_id = bu.user_id
        ), 0) AS sales
      FROM business_users bu
      JOIN users u ON u.id = bu.user_id
      LEFT JOIN employee_profiles ep ON ep.business_user_id = bu.id
      LEFT JOIN employee_branch_assignments eba ON eba.business_user_id = bu.id
      LEFT JOIN branches br ON br.id = eba.branch_id
      WHERE bu.business_id = ?
      ORDER BY bu.is_owner DESC, u.name, br.name
    `,
    [Number(businessId)]
  );

  return mapEmployeeRows(rows);
};

router.get('/', authMiddleware, async (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ message: 'businessId es requerido' });
  }
  try {
    const employees = await getEmployeesByBusiness(businessId);
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const {
    businessId,
    name,
    email,
    password,
    phone,
    role,
    branchIds = [],
    baseSalary = 0,
    commission = 0,
    hoursPerWeek = 40,
    schedule = '',
    active = true,
  } = req.body;

  if (!businessId || !name || !email || !password) {
    return res.status(400).json({ message: 'businessId, name, email y password son requeridos' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const normalizedRole = normalizeRole(role);
    const uniqueBranchIds = [...new Set((Array.isArray(branchIds) ? branchIds : []).map((value) => Number(value)).filter(Boolean))];

    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)',
      [email.trim().toLowerCase(), passwordHash, name.trim(), phone?.trim() || null]
    );

    const [membershipResult] = await connection.query(
      'INSERT INTO business_users (business_id, user_id, role, is_owner, active) VALUES (?, ?, ?, ?, ?)',
      [Number(businessId), userResult.insertId, normalizedRole, false, Boolean(active)]
    );

    await connection.query(
      `INSERT INTO employee_profiles (business_user_id, base_salary, commission_rate, hours_per_week, schedule, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        membershipResult.insertId,
        Number(baseSalary) || 0,
        Number(commission) || 0,
        Number(hoursPerWeek) || 40,
        schedule?.trim() || null,
        Boolean(active),
      ]
    );

    for (const branchId of uniqueBranchIds) {
      await connection.query(
        'INSERT IGNORE INTO employee_branch_assignments (business_user_id, branch_id) VALUES (?, ?)',
        [membershipResult.insertId, branchId]
      );
    }

    await connection.commit();
    const employees = await getEmployeesByBusiness(businessId);
    const created = employees.find((employee) => employee.id === membershipResult.insertId);
    res.status(201).json(created);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error al crear empleado' });
  } finally {
    connection.release();
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  const businessUserId = Number(req.params.id);
  const {
    name,
    email,
    password,
    phone,
    role,
    branchIds,
    baseSalary,
    commission,
    hoursPerWeek,
    schedule,
    active,
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingMembershipRows] = await connection.query(
      'SELECT id, user_id, business_id, is_owner FROM business_users WHERE id = ? LIMIT 1',
      [businessUserId]
    );
    if (existingMembershipRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    const membership = existingMembershipRows[0];

    if (name !== undefined || email !== undefined || phone !== undefined || password !== undefined) {
      const userUpdates = {};
      if (name !== undefined) userUpdates.name = String(name).trim();
      if (email !== undefined) userUpdates.email = String(email).trim().toLowerCase();
      if (phone !== undefined) userUpdates.phone = phone?.trim() || null;
      if (password) userUpdates.password_hash = await bcrypt.hash(password, 10);

      if (userUpdates.email) {
        const [conflicts] = await connection.query(
          'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
          [userUpdates.email, membership.user_id]
        );
        if (conflicts.length > 0) {
          await connection.rollback();
          return res.status(400).json({ message: 'Ya existe otro usuario con ese email' });
        }
      }

      if (Object.keys(userUpdates).length > 0) {
        await connection.query('UPDATE users SET ? WHERE id = ?', [userUpdates, membership.user_id]);
      }
    }

    const membershipUpdates = {};
    if (role !== undefined && !membership.is_owner) membershipUpdates.role = normalizeRole(role);
    if (active !== undefined) membershipUpdates.active = Boolean(active);
    if (Object.keys(membershipUpdates).length > 0) {
      await connection.query('UPDATE business_users SET ? WHERE id = ?', [membershipUpdates, businessUserId]);
    }

    const profileUpdates = {};
    if (baseSalary !== undefined) profileUpdates.base_salary = Number(baseSalary) || 0;
    if (commission !== undefined) profileUpdates.commission_rate = Number(commission) || 0;
    if (hoursPerWeek !== undefined) profileUpdates.hours_per_week = Number(hoursPerWeek) || 40;
    if (schedule !== undefined) profileUpdates.schedule = schedule?.trim() || null;
    if (active !== undefined) profileUpdates.active = Boolean(active);

    if (Object.keys(profileUpdates).length > 0) {
      await connection.query(
        `INSERT INTO employee_profiles (business_user_id, base_salary, commission_rate, hours_per_week, schedule, active)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           base_salary = VALUES(base_salary),
           commission_rate = VALUES(commission_rate),
           hours_per_week = VALUES(hours_per_week),
           schedule = VALUES(schedule),
           active = VALUES(active)`,
        [
          businessUserId,
          profileUpdates.base_salary ?? 0,
          profileUpdates.commission_rate ?? 0,
          profileUpdates.hours_per_week ?? 40,
          profileUpdates.schedule ?? null,
          profileUpdates.active ?? true,
        ]
      );
    }

    if (Array.isArray(branchIds) && !membership.is_owner) {
      const uniqueBranchIds = [...new Set(branchIds.map((value) => Number(value)).filter(Boolean))];
      await connection.query('DELETE FROM employee_branch_assignments WHERE business_user_id = ?', [businessUserId]);
      for (const branchId of uniqueBranchIds) {
        await connection.query(
          'INSERT IGNORE INTO employee_branch_assignments (business_user_id, branch_id) VALUES (?, ?)',
          [businessUserId, branchId]
        );
      }
    }

    await connection.commit();
    const employees = await getEmployeesByBusiness(membership.business_id);
    const updated = employees.find((employee) => employee.id === businessUserId);
    res.json(updated);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar empleado' });
  } finally {
    connection.release();
  }
});

export default router;
