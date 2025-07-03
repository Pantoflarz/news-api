const { Router } = require('express');
const news = Router();

const news_controller = require("../controllers/newsController.js");

news.get('/dashboard', news_controller.news_dashboard_get);

module.exports = news;
