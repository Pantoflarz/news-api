const asyncHandler = require("express-async-handler");

const Track = require('../models/Track.js');

class TrackController {

  constructor(responseJson) {
    this.responseJson = responseJson;
  }

  async track_post(req, res, next) {

    let articleID = req.body.articleID;

    const insert = await Track.insertOne({userId: req.userId, article: articleID, time: new Date(Date.now())});
    if (insert) {
        res.status(200).send(this.responseJson("OK", "success"));
    } else {
        res.status(500).send(this.responseJson("error", "Something went wrong. Try again later."));
    }

    next();

  }
}

module.exports = TrackController;
