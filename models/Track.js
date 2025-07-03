const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  userId: String,
  article: String,
  time: Date
}, {
  collection: 'track'
});

module.exports = mongoose.model('Track', TrackSchema);
