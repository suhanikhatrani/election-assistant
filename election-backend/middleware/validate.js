const { body, validationResult } = require('express-validator');

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

exports.validateRegister = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  exports.handleValidationErrors
];

exports.validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  exports.handleValidationErrors
];

exports.validateQuizScore = [
  body('score')
    .isInt({ min: 0 }).withMessage('Score must be a non-negative integer'),
  exports.handleValidationErrors
];

exports.validateStep = [
  body('stepNumber')
    .isInt({ min: 1 }).withMessage('Step number must be a positive integer'),
  exports.handleValidationErrors
];
