const { header } = require('express-validator');
const validator = require('validator');

const fs = require('fs');
const path = require('path');

const Token = require('../models/Token.js');

const RestAPI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../settings/configs/RestAPI.json'), 'utf8')
);

exports.refreshKeyValidator = [
  header('x-rest-api-refresh-key').custom(async (_, { req }) => {

    if(RestAPI.api.endpointsExemptFromApiKey.includes(req.path)) return true;

    const hasRefreshKeyHeader = Boolean(req.headers['x-rest-api-refresh-key']);

    if (!hasRefreshKeyHeader) {
      throw new Error('No x-rest-api-refresh-key header found in request.');
    }

    const refreshKey = req.headers['x-rest-api-refresh-key'];

    // Validate UUID
    if (!validator.isUUID(refreshKey, 4)) {
      throw new Error('x-rest-api-refresh-key provided is not in the expected format.');
    }

    // Store normalized key for use in controller
    req.refreshKey = refreshKey;

    if (req.apiKey !== undefined) {
        const result = await Token.findOne({ refreshToken: req.refreshKey});
        if (result != null) {
          return true;
        } else {
          throw new Error('Invalid/expired x-rest-api-refresh-key provided in request.');
      }
    }

  }),
];
