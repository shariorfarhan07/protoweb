const express = require('express');
const path    = require('path');
const db      = require('./db/init');

const app   = express();
const PORTS = [5000, 5555];

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/* ── PRODUCTS ── */
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  const rows = category
    ? db.prepare('SELECT * FROM products WHERE category = ? ORDER BY id').all(category)
    : db.prepare('SELECT * FROM products ORDER BY id').all();
  res.json(rows);
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(row);
});

/* ── CART (session-based, in-memory session id via query param) ── */
app.get('/api/cart/:sessionId', (req, res) => {
  const rows = db.prepare(`
    SELECT ci.product_id, ci.quantity, p.name, p.price, p.image, p.category
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.session_id = ?
    ORDER BY ci.added_at
  `).all(req.params.sessionId);
  res.json(rows);
});

app.post('/api/cart/:sessionId', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  db.prepare(`
    INSERT INTO cart_items (session_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(session_id, product_id)
    DO UPDATE SET quantity = quantity + excluded.quantity
  `).run(req.params.sessionId, productId, quantity);

  const total = db.prepare(
    'SELECT SUM(quantity) as total FROM cart_items WHERE session_id = ?'
  ).get(req.params.sessionId).total;

  res.json({ success: true, cartTotal: total });
});

app.delete('/api/cart/:sessionId/:productId', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?')
    .run(req.params.sessionId, req.params.productId);
  res.json({ success: true });
});

/* ── START ── */
for (const port of PORTS) {
  app.listen(port, () => console.log(`Server → http://localhost:${port}`));
}
