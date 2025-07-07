const { body } = require('express-validator');

const Article = require('../models/Article.js');

exports.trackPostValidation = [
  body('articleID')
  .trim()
  .toLowerCase()
  .notEmpty().withMessage('Article ID is required')
  .escape()
  .custom(async (value, { req }) => {

    if (value !== undefined) {
        const result = await Article.findOne({ _id: value});
        if (result != null) {
          return true;
        } else {
          throw new Error('Invalid articleID provided in request.');
      }
    }

  }),
];
