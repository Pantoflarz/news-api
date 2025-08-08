const { body } = require('express-validator');

exports.registerPostValidation = [

  body('name')
    .exists({ checkFalsy: true }).withMessage('Name is required')
    .bail()
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 32 }).withMessage('Name must be between 3-32 characters')
    .matches(/^[a-zA-Z]+$/).withMessage('Name can only contain letters')
    .escape(),

  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required')
    .bail()
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Invalid email address'),

  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
    .bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[@$!%*?&]/).withMessage('Password must contain a special character')
];

exports.loginPostValidation = [

  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required')
    .bail()
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Invalid email address'),

  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
    .bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
