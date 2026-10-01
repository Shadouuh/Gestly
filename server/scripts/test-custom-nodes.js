import 'dotenv/config';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import { generateToken } from '../src/middleware/auth.js';

const db = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestly',
});
const base = process.env.TEST_API_URL || 'http://localhost:3002';
const createdNodeIds = [];

try {
  const [[business]] = await db.query('SELECT id FROM businesses ORDER BY id LIMIT 1');
  assert.ok(business, 'Se necesita un negocio existente para probar la API');
  const token = generateToken({ id: 1, businessId: business.id });
  const call = async (path, method = 'GET', body, expectedStatus) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    if (expectedStatus) assert.equal(response.status, expectedStatus, JSON.stringify(data));
    else assert.ok(response.ok, `${response.status}: ${JSON.stringify(data)}`);
    return data;
  };

  const node = await call('/custom-nodes', 'POST', { title: 'Prueba temporal', tableTitle: 'Contenedores' }, 201);
  createdNodeIds.push(node.id);
  const containerTable = node.tables[0].id;
  const itemsTable = (await call(`/custom-nodes/${node.id}/tables`, 'POST', { title: 'Costos de carga' }, 201)).id;
  const otherNode = await call('/custom-nodes', 'POST', { title: 'Otro nodo temporal', tableTitle: 'Órdenes' }, 201);
  createdNodeIds.push(otherNode.id);
  const otherTable = otherNode.tables[0].id;

  const name = await call(`/custom-sections/${containerTable}/columns`, 'POST', { name: 'Nombre', dataType: 'text' }, 201);
  const container = await call(`/custom-sections/${containerTable}/rows`, 'POST', { values: { [name.id]: 'Contenedor A' } }, 201);
  const link = await call(`/custom-sections/${itemsTable}/columns`, 'POST', {
    name: 'Contenedor', dataType: 'relation', config: { targetType: 'custom', targetTableId: containerTable },
  }, 201);
  const cost = await call(`/custom-sections/${itemsTable}/columns`, 'POST', { name: 'Costo', dataType: 'number' }, 201);
  await call(`/custom-sections/${itemsTable}/rows`, 'POST', { values: { [link.id]: container.id, [cost.id]: 12 } }, 201);
  await call(`/custom-sections/${itemsTable}/rows`, 'POST', { values: { [link.id]: container.id, [cost.id]: 18 } }, 201);

  const total = await call(`/custom-sections/${containerTable}/columns`, 'POST', {
    name: 'Costo total', dataType: 'aggregate', config: {
      sourceType: 'custom', sourceTableId: itemsTable, valueColumnId: cost.id,
      matchMode: 'row', filterField: String(link.id),
    },
  }, 201);
  const detail = await call(`/custom-sections/${containerTable}`);
  assert.equal(detail.rows[0].computed[total.id], 30);

  const crossNodeLink = await call(`/custom-sections/${otherTable}/columns`, 'POST', {
    name: 'Contenedor relacionado', dataType: 'relation', config: { targetType: 'custom', targetTableId: containerTable },
  }, 201);
  const options = await call(`/custom-sections/${otherTable}/columns/${crossNodeLink.id}/options`);
  assert.ok(options.some((option) => option.id === container.id && option.label.includes('Contenedor A')));
  const otherRow = await call(`/custom-sections/${otherTable}/rows`, 'POST', { values: { [crossNodeLink.id]: container.id } }, 201);
  const [[product]] = await db.query('SELECT id FROM products WHERE business_id = ? AND deleted_at IS NULL ORDER BY id LIMIT 1', [business.id]);
  if (product) {
    const productLink = await call(`/custom-sections/${otherTable}/columns`, 'POST', {
      name: 'Producto existente', dataType: 'relation', config: { targetType: 'products' },
    }, 201);
    await call(`/custom-sections/${otherTable}/rows/${otherRow.id}`, 'PATCH', {
      values: { [crossNodeLink.id]: container.id, [productLink.id]: product.id },
    });
  }

  const salesTotal = await call(`/custom-sections/${containerTable}/columns`, 'POST', {
    name: 'Ventas pagadas', dataType: 'aggregate', config: { sourceType: 'sales', matchMode: 'fixed', filterField: 'status', filterValue: 'paid' },
  }, 201);
  const [[sales]] = await db.query("SELECT COALESCE(SUM(total), 0) AS total FROM sales WHERE business_id = ? AND status = 'paid'", [business.id]);
  const withSales = await call(`/custom-sections/${containerTable}`);
  assert.equal(withSales.rows[0].computed[salesTotal.id], Number(sales.total));

  const expenseTotal = await call(`/custom-sections/${containerTable}/columns`, 'POST', {
    name: 'Gastos de caja', dataType: 'aggregate', config: { sourceType: 'cash', matchMode: 'fixed', filterField: 'type', filterValue: 'expense' },
  }, 201);
  const [[expenses]] = await db.query("SELECT COALESCE(SUM(amount), 0) AS total FROM cash_movements WHERE business_id = ? AND type = 'expense'", [business.id]);
  const withExpenses = await call(`/custom-sections/${containerTable}`);
  assert.equal(withExpenses.rows[0].computed[expenseTotal.id], Number(expenses.total));

  const invalid = await call(`/custom-sections/${otherTable}/rows`, 'POST', { values: { [crossNodeLink.id]: 999999999 } }, 400);
  assert.match(invalid.message, /relacionada/i);
  const protectedDelete = await call(`/custom-sections/${containerTable}/rows/${container.id}`, 'DELETE', undefined, 409);
  assert.match(protectedDelete.message, /relacionada/i);
  console.log('OK: nodos, varias tablas, relaciones entre nodos y totales personalizados, de ventas y de caja.');
} finally {
  for (const id of createdNodeIds.reverse()) {
    await db.query("DELETE FROM custom_nodes WHERE id = ? AND title IN ('Prueba temporal', 'Otro nodo temporal')", [id]);
  }
  await db.end();
}
