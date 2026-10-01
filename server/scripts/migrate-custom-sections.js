import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const directory = path.dirname(fileURLToPath(import.meta.url));
const migration = await fs.readFile(path.join(directory, '..', 'migrations', '001_custom_sections.sql'), 'utf8');
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestly',
  multipleStatements: true,
});

try {
  await connection.query(migration);
  console.log('Tablas custom_tables, custom_columns y custom_rows listas.');
} finally {
  await connection.end();
}
