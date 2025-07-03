module.exports = async () => {
  console.log('🧹 Global teardown running...');

  // For example, if using Mongoose:
  const mongoose = require('mongoose');
  await mongoose.connection.close();

  console.log('✅ Global teardown complete.');
};
