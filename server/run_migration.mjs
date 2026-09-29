import pool from './src/config/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(__dirname, 'migration_fiado.sql'), 'utf8');

const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

async function migrate() {
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      console.log('OK:', stmt.slice(0, 80) + '...');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('SKIP (already exists):', stmt.slice(0, 80) + '...');
      } else {
        console.error('ERROR:', err.message, '\n  Statement:', stmt.slice(0, 100));
      }
    }
  }
  process.exit(0);
}

migrate();
