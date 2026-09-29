import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.join(__dirname, 'migration_cash.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

try {
  await pool.query(sql);
  console.log('✓ Tabla cash_registers creada (o ya existía)');
  console.log('\nMigración completada.');
} catch (err) {
  console.error('Error:', err.message);
}
process.exit(0);
