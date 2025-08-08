const { body } = require('express-validator');

const Article = require('../models/Article.js');

exports.trackValidator = [
  body('articleID')
    .exists({ checkFalsy: true }).withMessage('articleID is required')
    .bail()
    .trim()
    .toLowerCase()
    .escape()
    .custom(async (value) => {
      const result = await Article.findOne({ _id: value });
      if (!result) {
        throw new Error('Invalid articleID provided in request.');
      }
      return true;
    })
];
