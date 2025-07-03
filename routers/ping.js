const { Router } = require('express');
const ping = Router();

const ping_controller = require("../controllers/pingController.js");

ping.get('/', ping_controller.ping_get);

module.exports = ping;
