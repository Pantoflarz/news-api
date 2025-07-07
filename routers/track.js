const express = require('express');
const asyncHandler = require("express-async-handler");
const responseJson = require('../libs/Response.js');

const TrackController = require("../controllers/trackController.js");

const { trackPostValidation } = require('../validators/trackValidator.js');
const validateRequest = require('../middleware/validateRequest.js');

const track = express.Router();

const trackController = new TrackController(responseJson);

track.post('/track', trackPostValidation, validateRequest, asyncHandler(trackController.track_post.bind(trackController)));

module.exports = track;
