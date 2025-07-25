module.exports = {
  moduleNameMapper: {
    '^@mocks/(.*)$': '<rootDir>/tests/__mocks__/$1'
  },
  testEnvironment: 'node',
  globalSetup: './tests/setup/globalSetup.js',
  globalTeardown: './tests/setup/globalTeardown.js',
};
