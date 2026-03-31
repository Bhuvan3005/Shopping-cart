const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = { items: [] };
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart — replace entire cart
router.put('/', async (req, res, next) => {
  try {
    const { items } = req.body; // [{ product: id, quantity }]
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = items || [];
    } else {
      cart = new Cart({ user: req.user._id, items: items || [] });
    }
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/merge — merge guest cart into user cart
router.post('/merge', async (req, res, next) => {
  try {
    const { items: guestItems } = req.body; // [{ product: id, quantity }]
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const guestItem of (guestItems || [])) {
      const existing = cart.items.find(
        (i) => i.product.toString() === guestItem.product
      );
      if (existing) {
        // Take the higher quantity
        const product = await Product.findById(guestItem.product);
        const maxQty = product ? product.stock : 999;
        existing.quantity = Math.min(existing.quantity + guestItem.quantity, maxQty);
      } else {
        cart.items.push(guestItem);
      }
    }
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart — clear cart
router.delete('/', async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
