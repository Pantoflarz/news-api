const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  source: String,
  author: String,
  title: String,
  description: String,
  url: String,
  urlToImage: String,
  publishedAt: Date,
  fetchedAt: Date
});

module.exports = mongoose.model('Article', ArticleSchema);
