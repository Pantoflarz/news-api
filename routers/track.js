const express = require('express');
const asyncHandler = require("express-async-handler");
const responseJson = require('../libs/Response.js');

const TrackController = require("../controllers/trackController.js");

const { trackValidator } = require('../validators/trackValidator.js');
const validateRequest = require('../middleware/validateRequest.js');

const track = express.Router();

const trackController = new TrackController(responseJson);

/**
 * @route   POST /track
 * @desc    Track that a user has opened an article
 * @access  Protected - Requires API key
 * @body    {string} articleID - Required, must be a valid article ID
 * @returns {200} { "status": "OK", "response": "success" }
 * @returns {500} { "status": "error", "response": "Something went wrong. Try again later." }
 */
track.post('/track', trackValidator, validateRequest, asyncHandler(trackController.track_post.bind(trackController)));

module.exports = track;
