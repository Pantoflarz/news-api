const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const responseJson = require('../libs/Response.js');

const AuthController = require('../controllers/authController.js');

const auth = express.Router();

const authController = new AuthController(bcrypt, responseJson);

auth.post('/register', asyncHandler(authController.register_post.bind(authController)));

auth.post('/login', asyncHandler(authController.login_post.bind(authController)));

auth.post('/refresh_key', asyncHandler(authController.refresh_key_post.bind(authController)));

auth.post('/logout', asyncHandler(authController.logout_post.bind(authController)));

module.exports = auth;
