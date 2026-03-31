const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', validate('name', 'email', 'password'), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', validate('email', 'password'), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Refresh token required');
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    res.json({
      accessToken: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (err) {
    res.status(401);
    next(new Error('Invalid refresh token'));
  }
});

// POST /api/auth/logout (client-side token removal, this is a no-op)
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
