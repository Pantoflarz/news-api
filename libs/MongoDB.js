const mongoose = require('mongoose');

let isConnected = false;

async function connect(config, options = {}) {
  if (isConnected) return mongoose;

  try {
    await mongoose.connect(
      `mongodb+srv://${config.user}:${config.password}@${config.host}/app?retryWrites=true&w=majority&appName=${config.dbName}`,
      { ...options }
    );
    isConnected = true;
    console.log('✅ MongoDB connection successful');
    return mongoose;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err; // rethrow if you want calling code to handle it
  }
}

module.exports = {
  connect,
  mongoose, // optionally expose for advanced use
};
