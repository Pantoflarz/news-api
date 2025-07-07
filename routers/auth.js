const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const AuthController = require('../controllers/authController.js');

const { registerPostValidation, loginPostValidation } = require('../validators/authValidator.js');
const { refreshKeyValidator } = require('../validators/refreshKeyValidator.js');
const validateRequest = require('../middleware/validateRequest.js');

const responseJson = require('../libs/Response.js');

const auth = express.Router();

const authController = new AuthController(bcrypt, responseJson);

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    {string} username - Required, must be between 3-16 characters and contain only letters, numbers and underscores
 * @body    {string} email - Required, valid email
 * @body    {string} password - Required, minimum 6 characters, must contain a number, an uppercase letter, a lowercase letter and a special character
 * @returns {200} { "status": "OK", "response": "success" }
 * @returns {500} { "status": "error", "response": "Something went wrong. Try again later." }
 */
auth.post('/auth/register', registerPostValidation, validateRequest, asyncHandler(authController.register_post.bind(authController)));

/**
 * @route   POST /auth/login
 * @desc    Logs in a user
 * @access  Public
 * @body    {string} login - Required, can be a username or email
 * @body    {string} password - Required, password linked to the login provided
 * @returns {200} { "status": "OK", "response": { "token": UUIDv4, "refreshToken": UUIDv4 } }
 * @returns {403} { "status": "error", "response": "Provided details invalid." }
 */
auth.post('/auth/login', loginPostValidation, validateRequest, asyncHandler(authController.login_post.bind(authController)));

/**
 * @route   POST /auth/refresh_key
 * @desc    Refreshes an api key with the provided refresh key
 * @access  Protected - Requires API key
 *
 * @header  {string} X-REST-API-KEY - Optional if `api_key` is in query parameters
 * @query   {string} api_key - Optional if `X-REST-API-KEY` is in headers
 * @header  {string} X-REST-API-REFRESH-KEY - Optional if `refresh_key` is in query parameters
 * @query   {string} refresh_key - Optional if `X-REST-API-REFRESH-KEY` is in headers
 *
 * Both an api key and a refresh key must be presented.
 *
 * @returns {200} { "status": "OK", "response": { "token": UUIDv4, "refreshToken": UUIDv4 } }
 * @returns {500} { "status": "error", "response": "Something went wrong. Try again later." } if the token cannot be refreshed
 */
auth.post('/auth/refresh_key', refreshKeyValidator, validateRequest, asyncHandler(authController.refresh_key_post.bind(authController)));

auth.post('/auth/logout', asyncHandler(authController.logout_post.bind(authController)));

module.exports = auth;
