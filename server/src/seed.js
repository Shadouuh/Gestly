import pool from './config/db.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding Gestly database...\n');

  // ── Plans ──
  await pool.query(`INSERT INTO plans (id, name, price, config_json) VALUES
    (1, 'Essential', 5000.00, '{"monthly_limit":300,"features":["facturacion","inventario","1_sucursal"]}'),
    (2, 'Pro', 10000.00, '{"monthly_limit":1000,"features":["facturacion","inventario","multi_sucursal","reportes"]}'),
    (3, 'Premium', 20000.00, '{"monthly_limit":-1,"features":["facturacion","inventario","multi_sucursal","reportes","soporte_prioritario","api"]}')
  ON DUPLICATE KEY UPDATE name=VALUES(name)`);

  // ── Templates (global rubros) ──
  await pool.query(`INSERT INTO templates (id, name, description, icon, color) VALUES
    ('kiosco', 'Kiosco', 'Plantilla para kioscos y comercios minoristas', 'Store', 'text-blue-600 bg-blue-50'),
    ('ferreteria', 'Ferretería', 'Plantilla para ferreterías y comercios de construcción', 'Hammer', 'text-slate-600 bg-slate-50'),
    ('carniceria', 'Carnicería', 'Plantilla para carnicerías y verdulerías', 'Beef', 'text-red-600 bg-red-50')
  ON DUPLICATE KEY UPDATE name=VALUES(name)`);



  // ── Seed users (password: admin123) ──
  const hash = await bcrypt.hash('admin123', 10);
  const users = [
    { email: 'admin@kiosco.com', name: 'Juan Pérez', phone: '+54 11 4567-8901' },
    { email: 'admin@ferreteria.com', name: 'María García', phone: '+54 11 4567-8902' },
    { email: 'admin@carniceria.com', name: 'Carlos López', phone: '+54 11 4567-8903' },
  ];

  for (const u of users) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length > 0) {
      console.log(`  ⏩ Usuario ${u.email} ya existe, omitiendo.`);
      continue;
    }
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)',
      [u.email, hash, u.name, u.phone]
    );
    const userId = result.insertId;

    // Create business
    const businessName = u.email === 'admin@kiosco.com' ? 'Kiosco El Rápido'
      : u.email === 'admin@ferreteria.com' ? 'Ferretería Don José'
      : 'Carnicería La Pampa';
    const rubro = u.email === 'admin@kiosco.com' ? 'kiosco'
      : u.email === 'admin@ferreteria.com' ? 'ferreteria'
      : 'carniceria';
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + userId;

    const [bizResult] = await pool.query(
      'INSERT INTO businesses (plan_id, name, slug, rubro, status) VALUES (?, ?, ?, ?, ?)',
      [2, businessName, slug, rubro, 'ACTIVE']
    );
    const businessId = bizResult.insertId;

    await pool.query(
      'INSERT INTO business_users (business_id, user_id, role, is_owner) VALUES (?, ?, ?, ?)',
      [businessId, userId, 'OWNER', true]
    );

    // Create 2 branches
    const branchNames = ['Sucursal Centro', 'Sucursal Norte'];
    const branchIds = [];
    for (const bn of branchNames) {
      const [br] = await pool.query(
        'INSERT INTO branches (business_id, name, address) VALUES (?, ?, ?)',
        [businessId, bn, businessName + ', ' + bn]
      );
      branchIds.push(br.insertId);
    }

    // Create default category
    const [catResult] = await pool.query(
      'INSERT INTO categories (business_id, name) VALUES (?, ?)',
      [businessId, 'General']
    );
    const catId = catResult.insertId;

    console.log(`  ✅ ${businessName} creado`);
  }

  console.log('\n📦 Seed completado!');
  console.log('   Usuarios seed:');
  console.log('   admin@kiosco.com / admin123');
  console.log('   admin@ferreteria.com / admin123');
  console.log('   admin@carniceria.com / admin123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
