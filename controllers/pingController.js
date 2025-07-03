const asyncHandler = require("express-async-handler");

(async () => {
  const responseModule = await import('../libs/Response.js');
  responseJson = responseModule.default;
})();

exports.ping_get = asyncHandler(async (req, res, next) => {

  res.send(responseJson("pong"));

  next();

});
