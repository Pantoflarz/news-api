const mockLoggerInstance = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const getLogger = jest.fn(() => mockLoggerInstance);

module.exports = getLogger;
