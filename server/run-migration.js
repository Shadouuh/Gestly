import pool from './src/config/db.js';

const statements = [
  "ALTER TABLE businesses ADD COLUMN city VARCHAR(100) DEFAULT NULL AFTER rubro",
  "ALTER TABLE businesses ADD COLUMN address VARCHAR(255) DEFAULT NULL AFTER city",
  "ALTER TABLE businesses ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER address",
  "ALTER TABLE businesses ADD COLUMN email VARCHAR(150) DEFAULT NULL AFTER phone",
  "ALTER TABLE business_users ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER is_owner",
  "ALTER TABLE product_variants ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER extra_price",
  "ALTER TABLE product_variants ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER active",
  "UPDATE businesses SET city = 'Córdoba', address = 'Av. Colón 123', phone = '+54 351 123-4567', email = 'info@kioscoelrapido.com' WHERE id = 1 AND city IS NULL",
  "UPDATE businesses SET city = 'Buenos Aires', address = 'Av. Rivadavia 456', phone = '+54 11 234-5678', email = 'info@ferreterianorte.com' WHERE id = 2 AND city IS NULL",
  "UPDATE businesses SET city = 'Rosario', address = 'San Martín 789', phone = '+54 341 345-6789', email = 'info@carniceriasur.com' WHERE id = 3 AND city IS NULL",
];

try {
  for (const sql of statements) {
    try {
      await pool.query(sql);
      console.log('✓', sql.slice(0, 70));
    } catch (e) {
      if (e.errno === 1060) {
        console.log('→ already exists:', sql.slice(0, 50));
      } else if (e.errno === 1062) {
        console.log('→ already updated');
      } else {
        throw e;
      }
    }
  }
  console.log('\nMigración completada.');
} catch (err) {
  console.error('Error:', err.message);
}
process.exit(0);
