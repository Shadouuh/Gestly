import pool from './src/config/db.js';

const statements = [
  "ALTER TABLE categories ADD COLUMN icon VARCHAR(50) NULL AFTER name",
  "ALTER TABLE categories ADD COLUMN color VARCHAR(100) NULL AFTER icon",
  "ALTER TABLE products ADD COLUMN image_url VARCHAR(255) NULL AFTER unit",
  "ALTER TABLE business_users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'SELLER'",
  `CREATE TABLE IF NOT EXISTS employee_profiles (
    business_user_id BIGINT PRIMARY KEY,
    base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
    hours_per_week INT NOT NULL DEFAULT 40,
    schedule VARCHAR(255) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employee_profiles_business_user
      FOREIGN KEY (business_user_id) REFERENCES business_users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS employee_branch_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_user_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_employee_branch_assignment (business_user_id, branch_id),
    CONSTRAINT fk_employee_branch_assignments_business_user
      FOREIGN KEY (business_user_id) REFERENCES business_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_branch_assignments_branch
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
  )`,
  `INSERT IGNORE INTO employee_profiles (business_user_id, active)
   SELECT id, COALESCE(active, TRUE) FROM business_users`,
  `INSERT IGNORE INTO employee_branch_assignments (business_user_id, branch_id)
   SELECT bu.id, bu.branch_id
   FROM business_users bu
   WHERE bu.branch_id IS NOT NULL`,
  `INSERT IGNORE INTO employee_branch_assignments (business_user_id, branch_id)
   SELECT bu.id, br.id
   FROM business_users bu
   JOIN branches br ON br.business_id = bu.business_id
   WHERE bu.branch_id IS NULL`,
];

try {
  for (const sql of statements) {
    try {
      await pool.query(sql);
      console.log('✓', sql.replace(/\s+/g, ' ').slice(0, 88));
    } catch (error) {
      if (error.errno === 1060 || error.errno === 1061 || error.errno === 1068) {
        console.log('→ ya aplicado:', sql.replace(/\s+/g, ' ').slice(0, 72));
      } else {
        throw error;
      }
    }
  }

  console.log('\nMigracion de sucursales/empleados completada.');
} catch (error) {
  console.error('Error en migracion:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
