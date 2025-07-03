const asyncHandler = require("express-async-handler");

(async () => {
  const responseModule = await import('../libs/Response.js');
  responseJson = responseModule.default;
})();

exports.news_dashboard_get = asyncHandler(async (req, res, next) => {

  res.status(200).send(responseJson("OK", res.locals.cache.get("news")));

  next();

});
