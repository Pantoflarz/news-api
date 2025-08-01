const mockLoggerInstance = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const getLogger = jest.fn(() => mockLoggerInstance);

// Export an object with getLogger as default and the mock attached
getLogger.mockLoggerInstance = mockLoggerInstance;

module.exports = getLogger;
