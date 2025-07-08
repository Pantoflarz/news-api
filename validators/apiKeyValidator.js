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

    //return early if the endpoint is exempt from api key verification
    if(RestAPI.api.endpointsExemptFromApiKey.includes(req.path)) return true;

    const apiKey = req.get('x-rest-api-key');

    //check header exists
    if (!Boolean(apiKey)) {
      throw new Error('No x-rest-api-key header found in request.');
    }

    // Validate UUID
    if (!validator.isUUID(apiKey, 4)) {
      throw new Error('x-rest-api-key provided is not in the expected format.');
    }

    const result = await Token.findOne({ token: apiKey, expires: { $gt: new Date() }});

    if (result?.scope && RestAPI.scopes[result.scope] && RestAPI.scopes[result.scope].includes(req.path)) {
      req.userId = result.userId;

      // Store normalized key for use in controller
      req.apiKey = apiKey;

      return true;
    } else {
      throw new Error('Invalid/expired x-rest-api-key provided in request.');
    }
  }),
];
