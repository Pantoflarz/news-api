const Token = require('../models/Token.js');

const responseJson = require('../libs/Response.js');

const fs = require('fs');
const path = require('path');

const RestAPI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../settings/configs/RestAPI.json'), 'utf8')
);

function Authentication() {

  return async function(req, res, next) {

      if(RestAPI.api.endpointsExemptFromApiKey.includes(req.path)) return next();

      let path = req.path;

      let token = req.query.api_key || req.get('X-REST-API-KEY') || null;

      if (token !== undefined) {
          const result = await Token.findOne({ token: token});
          if (result != null) {
            if (RestAPI.scopes.basic.includes(path)) {
              res.locals.userId = result.userId;
              return next();
            }
          }
      }

      res.status(500).send(responseJson("error", "No or wrong/expired/unauthorised query api_key/X-REST-API-KEY header found in request."));

    }

}

module.exports = Authentication;
