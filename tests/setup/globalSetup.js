const path = require('path');

module.exports = async () => {
  console.log('🚀 Global setup starting...');

  const appPromise = require(path.join(__dirname, '../../api.js'));
  const app = await appPromise;

  if (!app) {
    console.error('❌ Failed to initialize app in globalSetup');
    process.exit(1);
  }

  // Save the app instance or data globally for tests
  global.__APP__ = app;

  console.log('✅ Global setup complete.');
};
