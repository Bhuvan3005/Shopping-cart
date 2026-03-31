/**
 * Validate that required fields exist on req.body.
 * Usage: validate('name', 'email', 'password')
 */
const validate = (...fields) => (req, res, next) => {
  const missing = fields.filter((f) => !req.body[f] && req.body[f] !== 0);
  if (missing.length) {
    res.status(400);
    return next(new Error(`Missing required fields: ${missing.join(', ')}`));
  }
  next();
};

module.exports = validate;
