const validator = require('validator');

function isKeyInValidFormat(apiKey) {
  if (typeof apiKey !== 'string') return false;
  return validator.isUUID(apiKey, 4);
}

module.exports = { isKeyInValidFormat };
