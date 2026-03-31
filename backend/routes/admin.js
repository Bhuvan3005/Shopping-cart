const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect, admin);

// ───────────── Dashboard ─────────────
// GET /api/admin/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalProducts, totalUsers, totalOrders, revenueAgg] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');
    res.json({ totalProducts, totalUsers, totalOrders, revenue, recentOrders });
  } catch (err) {
    next(err);
  }
});

// ───────────── Products CRUD ─────────────
// GET /api/admin/products
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products
router.post('/products', validate('name', 'description', 'price', 'category'), async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

// ───────────── Users ─────────────
// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.role = req.body.role || user.role;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

// ───────────── Orders ─────────────
// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    order.status = req.body.status || order.status;
    if (req.body.status === 'Delivered') {
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
