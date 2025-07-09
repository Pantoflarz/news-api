const mongoose = require('mongoose');

const getLogger = require('../utils/Logger.js');
const logger = getLogger('MongoDB');

let isConnected = false;

async function connect(config, options = {}) {
  if (isConnected) return mongoose;

  try {
    await mongoose.connect(
      `mongodb+srv://${config.user}:${config.password}@${config.host}/app?retryWrites=true&w=majority&appName=${config.dbName}`,
      { ...options }
    );
    isConnected = true;
    logger.info('✅ MongoDB connection successful');
    return mongoose;
  } catch (err) {
    logger.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
}

module.exports = {
  connect,
  mongoose
};
