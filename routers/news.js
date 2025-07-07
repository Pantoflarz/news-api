const express = require('express');
const asyncHandler = require("express-async-handler");
const responseJson = require('../libs/Response.js');

const NewsController = require("../controllers/newsController.js");

const news = express.Router();

const newsController = new NewsController(responseJson);

news.get('/news/dashboard', asyncHandler(newsController.dashboard_get.bind(newsController)));

module.exports = news;
