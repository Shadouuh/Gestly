import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { generateToken } from '../src/middleware/auth.js';
import { imageType } from '../src/services/productImages.js';

const db = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'gestly',
});
let savedPath;
const temporaryProductName = `__product_image_test_${randomUUID()}__`;
let businessId;
try {
  assert.equal(imageType(Buffer.from('<html>not an image</html>')), null);
  const [[business]] = await db.query('SELECT id FROM businesses ORDER BY id LIMIT 1');
  assert.ok(business);
  businessId = business.id;
  const token = generateToken({ id: 1, businessId: business.id });
  const base = process.env.TEST_API_URL || 'http://localhost:3002';
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64');
  const form = new FormData();
  form.append('image', new Blob([png], { type: 'image/png' }), 'test.png');
  const upload = await fetch(`${base}/product-images/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const data = await upload.json();
  assert.equal(upload.status, 201, JSON.stringify(data));
  savedPath = data.imageUrl;
  assert.match(savedPath, /^\/uploads\/products\/[a-f0-9-]+\.png$/);
  const served = await fetch(`${base}${savedPath}`);
  assert.equal(served.status, 200);
  assert.deepEqual(Buffer.from(await served.arrayBuffer()), png);
  const created = await fetch(`${base}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_id: business.id, name: temporaryProductName, sale_price: 1, image_url: savedPath, branch_ids: [] }),
  });
  const product = await created.json();
  assert.equal(created.status, 201, JSON.stringify(product));
  assert.equal(product.imageUrl, savedPath);
  const [[stored]] = await db.query('SELECT image_url AS imageUrl FROM products WHERE id = ? AND business_id = ?', [product.id, business.id]);
  assert.equal(stored.imageUrl, savedPath);

  const invalid = new FormData();
  invalid.append('image', new Blob(['<html>not an image</html>'], { type: 'image/png' }), 'fake.png');
  const badUpload = await fetch(`${base}/product-images/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: invalid });
  assert.equal(badUpload.status, 400);
  const invalidChoice = await fetch(`${base}/product-images/select`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId: 'missing' }) });
  assert.equal(invalidChoice.status, 404);
  if (!process.env.SERPAPI_API_KEY) {
    const search = await fetch(`${base}/product-images/search?q=Martillo`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(search.status, 503);
  }
  console.log('OK: subida local, archivo público, ruta en products.image_url, validación y búsqueda sin clave.');
} finally {
  if (businessId) {
    const [temporary] = await db.query('SELECT id FROM products WHERE business_id = ? AND name = ?', [businessId, temporaryProductName]);
    for (const item of temporary) {
      await db.query('DELETE FROM inventories WHERE variant_id IN (SELECT id FROM product_variants WHERE product_id = ?)', [item.id]);
      await db.query('DELETE FROM product_variants WHERE product_id = ?', [item.id]);
      await db.query('DELETE FROM products WHERE id = ? AND business_id = ? AND name = ?', [item.id, businessId, temporaryProductName]);
    }
  }
  if (savedPath) {
    const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads/products');
    await unlink(path.join(directory, path.basename(savedPath)));
  }
  await db.end();
}
