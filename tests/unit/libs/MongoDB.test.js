jest.mock('mongoose');
jest.mock('../../../utils/Logger.js'); // mocks getLogger

let mongoose;
let getLogger;
let mockLoggerInstance;
let mongoModule;

beforeEach(() => {
  jest.resetModules();

  mongoose = require('mongoose');
  getLogger = require('../../../utils/Logger.js');
  mongoModule = require('../../../libs/MongoDB.js');

  mongoModule.__setIsConnected(false);

  mockLoggerInstance = getLogger.mockLoggerInstance;
  mockLoggerInstance.info.mockClear();
  mockLoggerInstance.error.mockClear();

  mongoose.connect.mockReset();
});

describe('MongoDB connect()', () => {
  const config = {
    user: 'testUser',
    password: 'testPass',
    host: 'testhost.mongodb.net',
    dbCluster: 'testCluster',
    dbName: 'testDb'
  };

  test('should connect successfully and log info', async () => {
    mongoose.connect.mockResolvedValueOnce();

    const result = await mongoModule.connect(config);

    expect(mongoose.connect).toHaveBeenCalledWith(
      expect.stringContaining(`mongodb+srv://${config.user}:${config.password}@${config.host}/${config.dbName}?retryWrites=true&w=majority&appName=${config.dbCluster}`),
      expect.any(Object)
    );

    expect(mockLoggerInstance.info).toHaveBeenCalledWith('✅ MongoDB connection successful');
    expect(result).toBe(mongoose);
  });

  test('should not reconnect if already connected', async () => {
    mongoModule.__setIsConnected(true);

    mongoose.connect.mockClear();

    const result = await mongoModule.connect(config);

    expect(mongoose.connect).not.toHaveBeenCalled();
    expect(result).toBe(mongoose);
  });

  test('should log error and throw if connection fails', async () => {
    const error = new Error('connection error');
    mongoose.connect.mockRejectedValueOnce(error);

    await expect(mongoModule.connect(config)).rejects.toThrow('connection error');

    expect(mockLoggerInstance.error).toHaveBeenCalledWith(
      '❌ MongoDB connection failed:',
      'connection error'
    );
  });
});
