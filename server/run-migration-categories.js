import pool from './src/config/db.js';

const categories = [
  { id: 'bebidas-alcoholicas', name: 'Bebidas Alcohólicas', icon: 'Wine', color: 'violet' },
  { id: 'bebidas-sin-alcohol', name: 'Bebidas sin Alcohol', icon: 'Droplets', color: 'blue' },
  { id: 'lacteos', name: 'Lácteos', icon: 'Milk', color: 'amber' },
  { id: 'cuidado-cabello', name: 'Cuidado del Cabello', icon: 'Sparkles', color: 'pink' },
  { id: 'cuidado-piel', name: 'Cuidado de la Piel', icon: 'Heart', color: 'rose' },
  { id: 'higiene-personal', name: 'Higiene Personal', icon: 'SprayCan', color: 'cyan' },
  { id: 'afeitado', name: 'Afeitado y Depilación', icon: 'Scissors', color: 'slate' },
  { id: 'medicamentos', name: 'Medicamentos', icon: 'Pill', color: 'red' },
  { id: 'bebe', name: 'Bebé', icon: 'Baby', color: 'yellow' },
  { id: 'golosinas-snacks', name: 'Golosinas y Snacks', icon: 'Cookie', color: 'orange' },
  { id: 'panaderia-reposteria', name: 'Panadería y Repostería', icon: 'Croissant', color: 'amber' },
  { id: 'almacen', name: 'Almacén', icon: 'Package', color: 'emerald' },
  { id: 'carnes-pescados', name: 'Carnes y Pescados', icon: 'Beef', color: 'red' },
  { id: 'frutas-verduras', name: 'Frutas y Verduras', icon: 'Apple', color: 'green' },
  { id: 'congelados', name: 'Congelados', icon: 'Snowflake', color: 'sky' },
  { id: 'limpieza', name: 'Limpieza', icon: 'Sparkles', color: 'indigo' },
  { id: 'bazar-hogar', name: 'Bazar y Hogar', icon: 'Home', color: 'violet' },
  { id: 'indumentaria', name: 'Indumentaria', icon: 'Shirt', color: 'fuchsia' },
  { id: 'kiosco', name: 'Kiosco', icon: 'ShoppingBag', color: 'blue' },
  { id: 'mascotas', name: 'Mascotas', icon: 'Dog', color: 'orange' },
  { id: 'jardineria', name: 'Jardinería', icon: 'Flower2', color: 'lime' },
  { id: 'ferreteria', name: 'Ferretería', icon: 'Hammer', color: 'gray' },
  { id: 'automotor', name: 'Automotor', icon: 'Car', color: 'zinc' },
  { id: 'electronica', name: 'Electrónica', icon: 'Smartphone', color: 'blue' },
  { id: 'electrodomesticos', name: 'Electrodomésticos', icon: 'WashingMachine', color: 'teal' },
];

const subcategories = [
  { id: 'vinos', name: 'Vinos', parent: 'bebidas-alcoholicas', icon: 'Wine' },
  { id: 'cervezas', name: 'Cervezas', parent: 'bebidas-alcoholicas', icon: 'Beer' },
  { id: 'licores', name: 'Licores y Destilados', parent: 'bebidas-alcoholicas', icon: 'Wine' },
  { id: 'aperitivos', name: 'Aperitivos', parent: 'bebidas-alcoholicas', icon: 'Wine' },
  { id: 'gaseosas', name: 'Gaseosas', parent: 'bebidas-sin-alcohol', icon: 'Droplets' },
  { id: 'jugos', name: 'Jugos', parent: 'bebidas-sin-alcohol', icon: 'Apple' },
  { id: 'aguas', name: 'Aguas', parent: 'bebidas-sin-alcohol', icon: 'Droplets' },
  { id: 'energizantes', name: 'Energizantes', parent: 'bebidas-sin-alcohol', icon: 'Zap' },
  { id: 'te-cafe', name: 'Té y Café', parent: 'bebidas-sin-alcohol', icon: 'Coffee' },
  { id: 'leche', name: 'Leche', parent: 'lacteos', icon: 'Milk' },
  { id: 'yogures', name: 'Yogures', parent: 'lacteos', icon: 'Milk' },
  { id: 'quesos', name: 'Quesos', parent: 'lacteos', icon: 'Milk' },
  { id: 'carnes-rojas', name: 'Carnes Rojas', parent: 'carnes-pescados', icon: 'Beef' },
  { id: 'pollo', name: 'Pollo', parent: 'carnes-pescados', icon: 'Drumstick' },
  { id: 'pescados', name: 'Pescados', parent: 'carnes-pescados', icon: 'Fish' },
  { id: 'herramientas', name: 'Herramientas', parent: 'ferreteria', icon: 'Wrench' },
  { id: 'pinturas', name: 'Pinturas', parent: 'ferreteria', icon: 'PaintBucket' },
  { id: 'electricidad', name: 'Electricidad', parent: 'ferreteria', icon: 'Zap' },
];

try {
  // 1. Add columns
  const alters = [
    "ALTER TABLE categories ADD COLUMN icon VARCHAR(50) DEFAULT NULL AFTER parent_id",
    "ALTER TABLE categories ADD COLUMN color VARCHAR(50) DEFAULT NULL AFTER icon",
    "ALTER TABLE categories ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER color",
    "ALTER TABLE products ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER unit",
  ];
  for (const sql of alters) {
    try {
      await pool.query(sql);
      console.log('✓', sql.slice(0, 70));
    } catch (e) {
      if (e.errno === 1060) console.log('→ already exists:', sql.slice(0, 50));
      else throw e;
    }
  }

  // 2. Insert categories for each business
  const [businesses] = await pool.query('SELECT id FROM businesses');
  for (const b of businesses) {
    for (const cat of categories) {
      const [existing] = await pool.query('SELECT id FROM categories WHERE business_id = ? AND name = ?', [b.id, cat.name]);
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO categories (business_id, parent_id, name, icon, color) VALUES (?, NULL, ?, ?, ?)',
          [b.id, cat.name, cat.icon, cat.color]
        );
        console.log(`  + ${cat.name} → business ${b.id}`);
      }
    }
  }

  // 3. Update existing 'General' categories with icon/color
  await pool.query("UPDATE categories SET icon = 'Package', color = 'blue' WHERE name = 'General' AND (icon IS NULL OR color IS NULL)");
  console.log('  → General categories updated with icon/color');

  // 4. Insert subcategories linked to parent categories
  for (const b of businesses) {
    for (const sub of subcategories) {
      const [parent] = await pool.query('SELECT id FROM categories WHERE business_id = ? AND name = ?', [b.id, categories.find(c => c.id === sub.parent).name]);
      if (parent.length === 0) continue;
      const [existing] = await pool.query('SELECT id FROM categories WHERE business_id = ? AND name = ?', [b.id, sub.name]);
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO categories (business_id, parent_id, name, icon, color) VALUES (?, ?, ?, ?, ?)',
          [b.id, parent[0].id, sub.name, sub.icon, null]
        );
        console.log(`  +   ${sub.name} → ${sub.parent}`);
      }
    }
  }

  console.log('\nMigración de categorías completada.');
} catch (err) {
  console.error('Error:', err.message);
}
process.exit(0);
