const mongoose = require('mongoose');

const bootstrapDb = require('../bootstrap/bootstrapDb.js');

const getLogger = require('../utils/Logger.js');
const logger = getLogger('MongoDB');

let isConnected = false;

async function connect(config, options = {}) {
  if (isConnected) return mongoose;

  try {

    //always check that the right collections exist, this is fine to use even in prod calls
    await bootstrapDb();

    await mongoose.connect(
      `mongodb+srv://${config.user}:${config.password}@${config.host}/${config.dbName}?retryWrites=true&w=majority&appName=${config.dbCluster}`,
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

//test helper to reset isConnected for test isolation and mock purposes
function __setIsConnected(value) {
  isConnected = value;
}

module.exports = {
  connect,
  mongoose,
  __setIsConnected,
};
