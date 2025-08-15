const { validationResult } = require('express-validator');

module.exports = function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      response: errors.array(),
    });
  }
  next();
};
