const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// All routes below require authentication
router.use(protect);

// GET /api/users/profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile
router.put('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password; // pre-save hook hashes it
    }
    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      addresses: updated.addresses,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/addresses — replace all addresses
router.put('/addresses', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = req.body.addresses || [];
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/wishlist
router.get('/wishlist', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/wishlist — add product to wishlist
router.post('/wishlist', async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    const populated = await User.findById(req.user._id).populate('wishlist');
    res.json(populated.wishlist);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/wishlist/:productId
router.delete('/wishlist/:productId', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();
    const populated = await User.findById(req.user._id).populate('wishlist');
    res.json(populated.wishlist);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
