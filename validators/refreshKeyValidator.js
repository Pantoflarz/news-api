const { header } = require('express-validator');
const validator = require('validator');

const fs = require('fs');
const path = require('path');

const Token = require('../models/Token.js');

const RestAPI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../settings/configs/RestAPI.json'), 'utf8')
);

exports.refreshedKeyValidator = [
  header('x-rest-api-refresh-key').custom(async (_, { req }) => {

    const apiKey = req.get('x-rest-api-refresh-key');

    //check header exists
    if (!Boolean(apiKey)) {
      throw new Error('No x-rest-api-refresh-key header found in request.');
    }

    // Validate UUID
    if (!validator.isUUID(apiKey, 4)) {
      throw new Error('x-rest-api-refresh-key provided is not in the expected format.');
    }

    const result = await Token.findOne({ refreshToken: apiKey, expires: { $gt: new Date() }});

    if (result !== null) {
      return true;
    } else {
      throw new Error('Invalid/expired x-rest-api-refresh-key provided in request.');
    }
  }),
];
