const express = require('express');
const asyncHandler = require("express-async-handler");
const responseJson = require('../libs/Response.js');

const PingController = require("../controllers/pingController.js");

const ping = express.Router();

const pingController = new PingController(responseJson);

/**
 * @route   GET /ping
 * @desc    Check alive endpoint for the API
 * @access  Protected - Requires API key
 * @returns {200} { "status": "OK", "response": "pong" }
 */
ping.get('/ping', asyncHandler(pingController.ping_get.bind(pingController)));

module.exports = ping;
