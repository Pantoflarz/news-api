const express = require('express');
const asyncHandler = require("express-async-handler");
const responseJson = require('../libs/Response.js');

const TrackController = require("../controllers/trackController.js");

const track = express.Router();

const trackController = new TrackController(responseJson);

track.post('/track', asyncHandler(pingController.track_post.bind(pingController)));

module.exports = track;
