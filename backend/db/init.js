const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'protoweb.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    sku         TEXT    NOT NULL UNIQUE,
    category    TEXT    NOT NULL,
    price       INTEGER NOT NULL,
    description TEXT,
    image       TEXT
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT    NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL DEFAULT 1,
    added_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, product_id)
  );
`);

const seed = db.prepare(`
  INSERT OR IGNORE INTO products (name, sku, category, price, description, image)
  VALUES (@name, @sku, @category, @price, @description, @image)
`);

const seedMany = db.transaction(rows => rows.forEach(r => seed.run(r)));

seedMany([
  {
    name: 'Bambu Lab A1 Mini', sku: 'BLA1M-2024', category: '3d-printers',
    price: 45500,
    description: 'Auto-calibrating, multi-color AMS Lite ready. 500 mm/s print speed.',
    image: 'images/asthetic-printer-595x595.png'
  },
  {
    name: 'Creality Ender-3 V3 SE', sku: 'CRE3V3SE', category: '3d-printers',
    price: 22900,
    description: 'Auto-leveling via CR Touch, 250 mm/s speed. Best entry-level pick.',
    image: 'images/asthetic-printer-595x595.png'
  },
  {
    name: 'Two Trees Totem S', sku: 'TTS-V2', category: '3d-printers',
    price: 38000,
    description: 'Enclosed CoreXY structure. 32-bit silent mainboard, 300×300 mm bed.',
    image: 'images/Twotrees-595x595.png'
  },
  {
    name: 'Bambu Lab P1S', sku: 'BLP1S-2024', category: '3d-printers',
    price: 89000,
    description: 'High-speed enclosed printer. AMS compatible. 600 mm/s print speed.',
    image: 'images/asthetic-printer-595x595.png'
  },
  {
    name: 'xTool D1 Pro 20W', sku: 'XTD1P-20W', category: 'laser',
    price: 35500,
    description: '20W compressed-spot diode laser. Cuts 20 mm wood in a single pass.',
    image: 'images/Laser-Engraver-595x595.png'
  },
  {
    name: 'Sculpfun S30 Pro Max', sku: 'SFS30PM', category: 'laser',
    price: 28900,
    description: '20W output, 600×600 mm work area, built-in air-assist pump.',
    image: 'images/Laser-Engraver-595x595.png'
  },
  {
    name: 'Two Trees TS2 10W', sku: 'TTTS2-10W', category: 'laser',
    price: 42000,
    description: 'Galvo-diode hybrid. 10 000 mm/s engraving speed. Metal marking capable.',
    image: 'images/Twotrees-595x595.png'
  },
  {
    name: 'eSUN PLA+ 1 kg — White', sku: 'ESUPLAW-1K', category: 'filament',
    price: 1150,
    description: 'Vacuum sealed, tangle-free. 1.75 mm ±0.03 mm tolerance.',
    image: 'images/Filament.png'
  },
  {
    name: 'eSUN PETG 1 kg — Black', sku: 'ESUPETGB-1K', category: 'filament',
    price: 1450,
    description: 'High impact strength, food-safe. Ideal for functional and mechanical parts.',
    image: 'images/Filament.png'
  },
  {
    name: 'eSUN ABS+ 1 kg — Gray', sku: 'ESUABSG-1K', category: 'filament',
    price: 1050,
    description: 'Low-warp formula. High heat resistance. Great for engineering prototypes.',
    image: 'images/Filament.png'
  },
  {
    name: 'Bambu Lab PLA Matte 1 kg', sku: 'BLPLAM-1K', category: 'filament',
    price: 1800,
    description: 'Premium matte finish. Consistent flow rate, minimal stringing.',
    image: 'images/Filament.png'
  },
  {
    name: 'Sunlu TPU 95A 1 kg', sku: 'SNTPU95-1K', category: 'filament',
    price: 1750,
    description: 'Flexible, Shore 95A hardness. Abrasion-resistant. Perfect for grips and gaskets.',
    image: 'images/Filament.png'
  },
]);

module.exports = db;
