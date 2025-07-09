require('dotenv').config();

const appPromise = require('../api.js');

const getLogger = require('../utils/Logger.js');
const logger = getLogger('start.js');

logger.info('🚀 Running start script...');

appPromise.then(app => {
  if (!app) {
    logger.info('❌ App is null or undefined. Exiting.');
    process.exit(1);
  }
  app.listen(process.env.PORT, () => {
    logger.info('✅ Server running on port ' + process.env.PORT);
  });
}).catch(err => {
  logger.info('❌ Failed to start server:', err);
  process.exit(1);
});
