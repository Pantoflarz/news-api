const asyncHandler = require("express-async-handler");

const Track = require('../models/Track.js');

const getLogger = require('../utils/Logger.js');
const logger = getLogger('TrackController');

class TrackController {

  constructor(responseJson) {
    this.responseJson = responseJson;
  }

  async track_post(req, res, next) {

    let articleID = req.body.articleID;

    try {
      const insert = await Track.insertOne({userId: req.userId, article: articleID, time: new Date(Date.now())});
      if (insert) {
          res.status(200).send(this.responseJson("OK", "success"));
      }
    } catch (err) {
      logger.error('Failed to track article read by user', {
        error: err.message,
        stack: err.stack
      });

      res.status(500).send(this.responseJson("error", "Something went wrong. Try again later."));
    }

  }
}

module.exports = TrackController;
