import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const directory = path.dirname(fileURLToPath(import.meta.url));
const migration = await fs.readFile(path.join(directory, '..', 'migrations', '002_custom_nodes.sql'), 'utf8');
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestly',
});

try {
  await connection.query(migration);
  const [nodeColumn] = await connection.query("SHOW COLUMNS FROM custom_tables LIKE 'node_id'");
  if (!nodeColumn.length) {
    await connection.query('ALTER TABLE custom_tables ADD COLUMN node_id BIGINT NULL, ADD INDEX idx_custom_tables_node (node_id), ADD CONSTRAINT fk_custom_tables_node FOREIGN KEY (node_id) REFERENCES custom_nodes(id) ON DELETE CASCADE');
  }
  const [configColumn] = await connection.query("SHOW COLUMNS FROM custom_columns LIKE 'config_json'");
  if (!configColumn.length) {
    await connection.query('ALTER TABLE custom_columns ADD COLUMN config_json JSON NULL');
  }
  const [typeColumn] = await connection.query("SHOW COLUMNS FROM custom_columns LIKE 'data_type'");
  if (!typeColumn[0]?.Type.includes("'relation'")) {
    await connection.query("ALTER TABLE custom_columns MODIFY COLUMN data_type ENUM('text','number','date','boolean','relation','aggregate') NOT NULL DEFAULT 'text'");
  }

  // Every section from the first prototype becomes a node with its existing table.
  const [legacyTables] = await connection.query('SELECT id, business_id, title, subtitle FROM custom_tables WHERE node_id IS NULL ORDER BY id');
  for (const table of legacyTables) {
    await connection.beginTransaction();
    try {
      const [node] = await connection.query(
        'INSERT INTO custom_nodes (business_id, title, subtitle) VALUES (?, ?, ?)',
        [table.business_id, table.title, table.subtitle]
      );
      await connection.query('UPDATE custom_tables SET node_id = ? WHERE id = ? AND node_id IS NULL', [node.insertId, table.id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
  console.log(`Nodos y relaciones listos. Se conservaron ${legacyTables.length} tablas anteriores.`);
} finally {
  await connection.end();
}
