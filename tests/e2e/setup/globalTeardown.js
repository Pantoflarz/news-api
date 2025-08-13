const teardownDb = require('../../../bootstrap/teardownDb.js');
const getLogger = require('../../../utils/Logger.js');
const logger = getLogger('Jest globalTeardown');

module.exports = async function globalTeardown() {
  logger.info('🧹 Jest global teardown starting...');

  await teardownDb();

  const mongoose = require('mongoose');
  await mongoose.connection.close();

  logger.info('✅ Jest global teardown complete');
};
