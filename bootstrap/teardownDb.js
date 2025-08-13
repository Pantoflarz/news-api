const mongoose = require('mongoose');
const getLogger = require('../utils/Logger.js');
const logger = getLogger('teardown/db.js');

async function teardownDb() {
  if (process.env.RUN_BOOTSTRAP === 'true') {
    if (process.env.NODE_ENV !== 'test') {
      logger.info('🛑 Skipping teardown, not in test environment.');
      return;
    }

    logger.info('🧹 Teardown MongoDB: Dropping database...');

    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
    const conn = mongoose.createConnection(uri);

    try {
      await conn.asPromise();
      await conn.db.dropDatabase();
      logger.info('Database dropped ✅');
    } finally {
      await conn.close();
    }
  }
}

module.exports = teardownDb;
