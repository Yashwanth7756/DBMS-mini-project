// ============================================
//  LOCAL FARMER'S CROP & MARKET PORTAL
//  Backend: Node.js + Express.js + MySQL
//  FIXED VERSION - all null/undefined handled
// ============================================
//
//  SETUP:
//  1. npm init -y
//  2. npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
//  3. Create .env file
//  4. node server.js
// ============================================

const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB CONNECTION POOL ───────────────────────
const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'farmer_market_db',
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── TEST DB CONNECTION ───────────────────────
db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch(err => console.error('❌ MySQL connection failed:', err.message));

// ─── JWT MIDDLEWARE ───────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function roleOnly(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Access denied' });
    next();
  };
}

// ════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role, phone, location, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashed,
        role        || 'buyer',
        phone       || null,
        location    || null,
        role === 'buyer' ? 1 : 0
      ]
    );
    res.status(201).json({ message: 'Registered successfully', user_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [[user]] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!user)          return res.status(404).json({ error: 'User not found' });
    if (!user.is_approved) return res.status(403).json({ error: 'Account pending approval' });
    const match = await bcrypt.compare(password, user.password);
    if (!match)         return res.status(401).json({ error: 'Wrong password' });
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { user_id: user.user_id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
//  CROP ROUTES
// ════════════════════════════════════════════

// GET /api/crops — all available crops (public)
app.get('/api/crops', async (req, res) => {
  try {
    const { category, season, search } = req.query;
    let query  = 'SELECT * FROM available_crops_view WHERE 1=1';
    const params = [];
    if (category) { query += ' AND category = ?';     params.push(category); }
    if (season)   { query += ' AND season = ?';       params.push(season);   }
    if (search)   { query += ' AND crop_name LIKE ?'; params.push(`%${search}%`); }
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/crops/:id
app.get('/api/crops/:id', async (req, res) => {
  try {
    const [[crop]] = await db.execute(
      'SELECT * FROM available_crops_view WHERE crop_id = ?', [req.params.id]
    );
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    res.json(crop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/crops — farmer adds crop
app.post('/api/crops', authMiddleware, roleOnly('farmer'), async (req, res) => {
  const { name, category, quantity, unit, price, season, description, image_url } = req.body;
  try {
    if (!name || !quantity || !price) {
      return res.status(400).json({ error: 'Name, quantity and price are required' });
    }
    const [result] = await db.execute(
      `INSERT INTO crops (farmer_id, name, category, quantity, unit, price, season, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        name,
        category    || null,
        quantity,
        unit        || 'kg',
        price,
        season      || 'all_season',
        description || null,
        image_url   || null
      ]
    );
    await db.execute(
      'INSERT INTO prices (crop_id, market_rate, demand_level) VALUES (?, ?, ?)',
      [result.insertId, price, 'medium']
    );
    res.status(201).json({ message: 'Crop listed successfully', crop_id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/crops/:id — farmer updates crop
app.put('/api/crops/:id', authMiddleware, roleOnly('farmer'), async (req, res) => {
  const { quantity, price, description, is_available } = req.body;
  try {
    await db.execute(
      `UPDATE crops SET quantity=?, price=?, description=?, is_available=?
       WHERE crop_id=? AND farmer_id=?`,
      [
        quantity,
        price,
        description  || null,
        is_available !== undefined ? is_available : 1,
        req.params.id,
        req.user.user_id
      ]
    );
    res.json({ message: 'Crop updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/crops/:id
app.delete('/api/crops/:id', authMiddleware, roleOnly('farmer', 'admin'), async (req, res) => {
  try {
    await db.execute('DELETE FROM crops WHERE crop_id = ?', [req.params.id]);
    res.json({ message: 'Crop removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
//  ORDER ROUTES
// ════════════════════════════════════════════

// POST /api/orders — buyer places order
app.post('/api/orders', authMiddleware, roleOnly('buyer'), async (req, res) => {
  const { crop_id, quantity, delivery_address } = req.body;
  try {
    if (!crop_id || !quantity) {
      return res.status(400).json({ error: 'Crop and quantity are required' });
    }
    const [[crop]] = await db.execute(
      'SELECT * FROM crops WHERE crop_id = ?', [crop_id]
    );
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    if (crop.quantity < quantity) {
      return res.status(400).json({ error: `Only ${crop.quantity} ${crop.unit} available` });
    }
    const total_price = (crop.price * quantity).toFixed(2);
    const [result] = await db.execute(
      `INSERT INTO orders (buyer_id, crop_id, quantity, total_price, delivery_address)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        crop_id,
        quantity,
        total_price,
        delivery_address || null
      ]
    );
    res.status(201).json({
      message: 'Order placed successfully',
      order_id: result.insertId,
      total_price
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'buyer') {
      query  = `SELECT osv.* FROM order_summary_view osv
                JOIN orders o ON osv.order_id = o.order_id
                WHERE o.buyer_id = ?`;
      params = [req.user.user_id];
    } else if (req.user.role === 'farmer') {
      query  = `SELECT osv.* FROM order_summary_view osv
                JOIN orders o ON osv.order_id = o.order_id
                JOIN crops c  ON o.crop_id = c.crop_id
                WHERE c.farmer_id = ?`;
      params = [req.user.user_id];
    } else {
      query  = 'SELECT * FROM order_summary_view';
      params = [];
    }
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', authMiddleware, roleOnly('farmer', 'admin'), async (req, res) => {
  const { status } = req.body;
  try {
    if (!status) return res.status(400).json({ error: 'Status is required' });
    await db.execute(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, req.params.id]
    );
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
//  TRANSPORT ROUTES
// ════════════════════════════════════════════

// POST /api/transport
app.post('/api/transport', authMiddleware, roleOnly('admin', 'farmer'), async (req, res) => {
  const { order_id, driver_name, vehicle_no, eta } = req.body;
  try {
    if (!order_id) return res.status(400).json({ error: 'Order ID is required' });
    await db.execute(
      `INSERT INTO transport (order_id, driver_name, vehicle_no, eta)
       VALUES (?, ?, ?, ?)`,
      [
        order_id,
        driver_name || null,
        vehicle_no  || null,
        eta         || null
      ]
    );
    await db.execute(
      "UPDATE orders SET status = 'shipped' WHERE order_id = ?",
      [order_id]
    );
    res.status(201).json({ message: 'Transport assigned successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/transport/:order_id
app.get('/api/transport/:order_id', authMiddleware, async (req, res) => {
  try {
    const [[trip]] = await db.execute(
      'SELECT * FROM transport WHERE order_id = ?', [req.params.order_id]
    );
    res.json(trip || { message: 'Transport not assigned yet' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
//  REVIEW ROUTES
// ════════════════════════════════════════════

// POST /api/reviews
app.post('/api/reviews', authMiddleware, roleOnly('buyer'), async (req, res) => {
  const { farmer_id, crop_id, rating, comment } = req.body;
  try {
    if (!farmer_id || !rating) {
      return res.status(400).json({ error: 'Farmer and rating are required' });
    }
    await db.execute(
      `INSERT INTO reviews (buyer_id, farmer_id, crop_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        farmer_id,
        crop_id || null,
        rating,
        comment || null
      ]
    );
    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/reviews/:farmer_id
app.get('/api/reviews/:farmer_id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.*, u.name AS buyer_name
       FROM reviews r
       JOIN users u ON r.buyer_id = u.user_id
       WHERE r.farmer_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.farmer_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
//  ADMIN ROUTES
// ════════════════════════════════════════════

// GET /api/admin/users
app.get('/api/admin/users', authMiddleware, roleOnly('admin'), async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT user_id, name, email, role, phone, location, is_approved, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/approve/:user_id
app.put('/api/admin/approve/:user_id', authMiddleware, roleOnly('admin'), async (req, res) => {
  try {
    await db.execute(
      'UPDATE users SET is_approved = 1 WHERE user_id = ?',
      [req.params.user_id]
    );
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/reject/:user_id
app.put('/api/admin/reject/:user_id', authMiddleware, roleOnly('admin'), async (req, res) => {
  try {
    await db.execute(
      'UPDATE users SET is_approved = 0 WHERE user_id = ?',
      [req.params.user_id]
    );
    res.json({ message: 'User rejected' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/stats
app.get('/api/admin/stats', authMiddleware, roleOnly('admin'), async (req, res) => {
  try {
    const [[{ total_users }]]   = await db.execute('SELECT COUNT(*) AS total_users FROM users');
    const [[{ total_crops }]]   = await db.execute('SELECT COUNT(*) AS total_crops FROM crops');
    const [[{ total_orders }]]  = await db.execute('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_revenue }]] = await db.execute(
      "SELECT COALESCE(SUM(total_price), 0) AS total_revenue FROM orders WHERE status != 'cancelled'"
    );
    const [[{ pending_farmers }]] = await db.execute(
      "SELECT COUNT(*) AS pending_farmers FROM users WHERE role = 'farmer' AND is_approved = 0"
    );
    res.json({ total_users, total_crops, total_orders, total_revenue, pending_farmers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════
//  CROP CALENDAR
// ════════════════════════════════════════════

app.get('/api/crop-calendar', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM crop_calendar ORDER BY calendar_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HEALTH CHECK ─────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '🌾 Farmer Market API is running!' });
});

// ─── START SERVER ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌾 Farmer Market API running on port ${PORT}`);
});
