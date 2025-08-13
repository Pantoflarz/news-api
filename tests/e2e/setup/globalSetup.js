const path = require('path');

const bootstrapDb = require('../../../bootstrap/bootstrapDb.js');

const getLogger = require('../../../utils/Logger.js');
const logger = getLogger('Jest globalSetup');

module.exports = async function globalSetup() {
  logger.info('⚡ Jest global setup starting...');

  // Bootstrap DB (safe: will only create missing collections)
  await bootstrapDb({ dropIfExists: false });

  const appPromise = require(path.join(__dirname, '../../../api.js'));
  const app = await appPromise;

  if (!app) {
    console.error('❌ Failed to initialize app in globalSetup');
    process.exit(1);
  }

  // Save the app instance or data globally for tests
  global.__APP__ = app;

  logger.info('✅ Jest global setup complete');
};
