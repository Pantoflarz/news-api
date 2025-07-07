const { body } = require('express-validator');

exports.registerPostValidation = [

  body('username')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 16 }).withMessage('Username must be between 3-16 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email address'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[@$!%*?&]/).withMessage('Password must contain a special character')

];

exports.loginPostValidation = [

  body('login')
    .trim()
    .notEmpty().withMessage('Login is required')
    .isLength({ min: 3, max: 16 }).withMessage('Username must be between 3-16 characters')
    .escape(),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')

];
