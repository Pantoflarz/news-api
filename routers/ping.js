const express = require('express');
const asyncHandler = require("express-async-handler");
const responseJson = require('../libs/Response.js');

const PingController = require("../controllers/pingController.js");

const ping = express.Router();

const pingController = new PingController(responseJson);

ping.get('/ping', asyncHandler(pingController.ping_get.bind(pingController)));

module.exports = ping;
