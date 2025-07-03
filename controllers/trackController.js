const asyncHandler = require("express-async-handler");

const Track = require('../models/Track.js');

(async () => {
  const responseModule = await import('../libs/Response.js');
  responseJson = responseModule.default;
})();

exports.track_track_post = asyncHandler(async (req, res, next) => {

  let token = req.query.token;
  let articleID = req.body.articleID;

  const insert = await Track.insertOne({userId: res.locals.userId, article: articleID, time: new Date(Date.now())})
  if (insert.acknowledged) {
      res.status(200).send(responseJson("OK", "success"));
  } else {
      res.status(500).send(responseJson("error", "Something went wrong. Try again later."));
  }

  next();

});
