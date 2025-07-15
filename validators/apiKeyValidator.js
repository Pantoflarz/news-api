const { header } = require('express-validator');
const validator = require('validator');

const Token = require('../models/Token.js');

const Config = require('../settings/configs/ConfigLoader.js');

const { isKeyInValidFormat } = require('../utils/keyFormat.js');
const { verifyApiKey } = require('../services/keyService.js');

exports.apiKeyValidator = [
  header('x-rest-api-key').custom(async (_, { req }) => {

    const exempt = Config.apiConfig.endpointsExemptFromApiKey || [];

    if (exempt.includes(req.path)) return true;

    const apiKey = req.get('x-rest-api-key');

    if (!apiKey) {
      throw new Error('No x-rest-api-key header found in request.');
    }

    const { userId, normalisedApiKey } = await verifyApiKey(apiKey, req.path);

    req.userId = userId;
    req.normalisedApiKey = normalisedApiKey;

    return true;

  })
];
