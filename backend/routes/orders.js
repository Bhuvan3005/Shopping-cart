const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// POST /api/orders — create order
router.post('/', validate('items', 'shippingAddress'), async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Validate stock and build order items
    const orderItems = [];
    let itemsTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
      itemsTotal += product.price * item.quantity;

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const taxPrice = Math.round(itemsTotal * 0.18); // 18% GST
    const shippingPrice = itemsTotal > 999 ? 0 : 99;
    const totalPrice = itemsTotal + taxPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      itemsTotal,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'Pending', // strict requirement: no simulation
    });

    // Clear user's server cart after order
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — user's order history
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    // Only allow the order owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
