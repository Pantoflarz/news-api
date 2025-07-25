const Token = require('../models/Token.js');
const Config = require('../settings/configs/ConfigLoader.js');
const { isKeyInValidFormat } = require('../utils/keyFormat.js');

exports.verifyApiKey = async (apiKey, reqPath) => {
  if (!isKeyInValidFormat(apiKey)) {
    throw new Error('x-rest-api-key provided is not in the expected format.');
  }

  const result = await Token.findOne({
    token: apiKey,
    expires: { $gt: new Date() }
  });

  const scope = result?.scope;
  const configScopes = Config.scopesConfig || {};

  const isPathAllowed = scope && configScopes[scope]?.includes(reqPath);

  if (!result || !isPathAllowed) {
    throw new Error('Invalid/expired x-rest-api-key provided in request.');
  }

  return {
    userId: result.userId,
    normalisedApiKey: result.token,
    normalisedRefreshKey: result.refreshToken
  };
};

exports.verifyRefreshKey = async (apiKey, refreshKey, reqPath) => {

  if (!isKeyInValidFormat(refreshKey)) {
    throw new Error('x-rest-api-refresh-key provided is not in the expected format.');
  }

  const { userId, normalisedApiKey, normalisedRefreshKey } = await this.verifyApiKey(apiKey, reqPath);

  if (normalisedRefreshKey !== refreshKey) {
    throw new Error('Invalid/expired x-rest-refresh-key provided in request.');
  }

  return {
    userId: userId,
    normalisedApiKey: normalisedApiKey,
    normalisedRefreshKey: normalisedRefreshKey
  };
};
