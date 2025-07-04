const asyncHandler = require("express-async-handler");

class NewsController {

  constructor(responseJson) {
    this.responseJson = responseJson;
  }

  async dashboard_get(req, res, next) {

    res.status(200).send(this.responseJson("OK", res.locals.cache.get("news")));

    next();

  }
}

module.exports = NewsController;
