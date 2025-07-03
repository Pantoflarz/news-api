const appPromise = require('../api.js');
const fs = require('fs');
const path = require('path');

const RestAPI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../settings/configs/RestAPI.json'), 'utf8')
);

console.log('Running start script...');

appPromise.then(app => {
  if (!app) {
    console.error('❌ App is null or undefined. Exiting.');
    process.exit(1);
  }
  app.listen(RestAPI.port, () => {
    console.log('✅ Server running on port ' + RestAPI.port);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
