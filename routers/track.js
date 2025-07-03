const { Router } = require('express');
const track = Router();

const track_controller = require("../controllers/trackController.js");

track.post('/track', track_controller.track_track_post);

module.exports = track;
