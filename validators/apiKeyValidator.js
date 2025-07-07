const { header } = require('express-validator');
const validator = require('validator');

const fs = require('fs');
const path = require('path');

const Token = require('../models/Token.js');

const RestAPI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../settings/configs/RestAPI.json'), 'utf8')
);

exports.apiKeyValidator = [
  header('x-rest-api-key').custom(async (_, { req }) => {

    if(RestAPI.api.endpointsExemptFromApiKey.includes(req.path)) return true;

    const hasApiKeyHeader = Boolean(req.headers['x-rest-api-key']);

    if (!hasApiKeyHeader) {
      throw new Error('No x-rest-api-key header found in request.');
    }

    const apiKey = req.headers['x-rest-api-key'];

    // Validate UUID
    if (!validator.isUUID(apiKey, 4)) {
      throw new Error('x-rest-api-key provided is not in the expected format.');
    }

    // Store normalized key for use in controller
    req.apiKey = apiKey;

    if (req.apiKey !== undefined) {
        const result = await Token.findOne({ token: req.apiKey});
        if (result != null) {
          if (RestAPI.scopes.basic.includes(req.path)) {
            req.userId = result.userId;
          }
        } else {
          throw new Error('Invalid/expired x-rest-api-key provided in request.');
      }
    }

    return true;
  }),
];
