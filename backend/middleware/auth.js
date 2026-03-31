const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Verify JWT and attach user to req */
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized — no token'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized — user not found'));
    }
    next();
  } catch (err) {
    res.status(401);
    next(new Error('Not authorized — token invalid'));
  }
};

/** Require admin role (call after protect) */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized — admin only'));
  }
};

module.exports = { protect, admin };
