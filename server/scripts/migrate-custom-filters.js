import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const directory = path.dirname(fileURLToPath(import.meta.url));
const migration = await fs.readFile(path.join(directory, '..', 'migrations', '003_row_filter_overrides.sql'), 'utf8');

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestly',
});

try {
  const [columns] = await connection.query("SHOW COLUMNS FROM custom_rows LIKE 'filters_json'");
  if (!columns.length) await connection.query(migration);
  console.log('Filtros por fila listos.');
} finally {
  await connection.end();
}
