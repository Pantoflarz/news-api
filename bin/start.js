const appPromise = require('../api.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

console.log('Running start script...');

appPromise.then(app => {
  if (!app) {
    console.error('❌ App is null or undefined. Exiting.');
    process.exit(1);
  }
  app.listen(process.env.PORT, () => {
    console.log('✅ Server running on port ' + process.env.PORT);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
