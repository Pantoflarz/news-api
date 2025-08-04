const { header } = require('express-validator');
const validator = require('validator');

const Token = require('../models/Token.js');

const { isKeyInValidFormat } = require('../utils/keyFormat.js');
const { verifyRefreshKey } = require('../services/keyService.js');

exports.refreshKeyValidator = [
  header('x-rest-api-refresh-key').custom(async (_, { req }) => {

    const refreshKey = req.get('x-rest-api-refresh-key');

    if (!refreshKey) {
      throw new Error('No x-rest-api-refresh-key header found in request.');
    }

    const { userId, normalisedApiKey, normalisedRefreshKey } = await verifyRefreshKey(req.normalisedApiKey, refreshKey, req.path);

    req.userId = userId;
    req.normalisedApiKey = normalisedApiKey;
    req.normalisedRefreshKey = normalisedRefreshKey;

    return true;

  })
];
