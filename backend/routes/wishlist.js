const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/wishlist — get user's wishlist
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price image stock');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user.wishlist);
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist — add to wishlist
router.post('/', async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:id — remove from wishlist
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.id);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist', 'name price image stock');
    res.json(updatedUser.wishlist);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
