const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userEmail: String,
  userName: String,
  password: String,
  registeredDate: Date
});

module.exports = mongoose.model('User', UserSchema);
