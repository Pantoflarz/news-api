const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  userId: String,
  scope: String,
  token: String,
  refreshToken: String,
  expires: Date
});

module.exports = mongoose.model('Token', TokenSchema);
