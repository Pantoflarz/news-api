const express = require('express');
const auth = express.Router();

const auth_controller = require("../controllers/authController.js");

auth.post('/register', auth_controller.auth_register_post);

auth.post('/login', auth_controller.auth_login_post);

auth.post('/refresh_key', auth_controller.auth_refresh_key_post);

auth.post('/logout', auth_controller.auth_logout_post);

module.exports = auth;
