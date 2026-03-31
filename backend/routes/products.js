const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/products — list with pagination, filtering, sorting, search
router.get('/', async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    switch (sort) {
      case 'price_asc':  sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'rating':     sortOption = { averageRating: -1 }; break;
      case 'newest':     sortOption = { createdAt: -1 }; break;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id — single product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id/related — related products (same category)
router.get('/:id/related', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);
    res.json(related);
  } catch (error) {
    next(error);
  }
});

// POST /api/products/:id/reviews — add review (protected)
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      res.status(400);
      throw new Error('Rating and comment are required');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
