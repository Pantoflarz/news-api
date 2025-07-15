const asyncHandler = require("express-async-handler");

class PingController {

  constructor(responseJson) {
    this.responseJson = responseJson;
  }

  ping_get(req, res, next) {

    res.send(this.responseJson("pong"));

  }
}

module.exports = PingController;
