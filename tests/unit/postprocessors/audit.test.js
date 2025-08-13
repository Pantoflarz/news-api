const Audit = require('../../../postprocessors/Audit.js');
const AuditLogger = require('../../../libs/AuditLogger.js');

jest.mock('../../../libs/AuditLogger.js');
jest.mock('../../../utils/getClientIp.js');  // will use jest.fn() automatically
jest.mock('../../../utils/Logger.js');       // uses the manual mock in __mocks__/Logger.js

const getClientIp = require('../../../utils/getClientIp.js');
const getLogger = require('../../../utils/Logger.js');
const mockLoggerInstance = getLogger.mockLoggerInstance;

describe('Audit', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mock logger spies
    mockLoggerInstance.error.mockClear();
    mockLoggerInstance.info.mockClear();
    mockLoggerInstance.debug.mockClear();
    mockLoggerInstance.warn.mockClear();

    // Reset AuditLogger mocks
    AuditLogger.mockClear();
    AuditLogger.prototype.init = jest.fn().mockResolvedValue();
    AuditLogger.prototype.log = jest.fn().mockResolvedValue();

    // Default request and response mocks
    req = {
      method: 'POST',
      path: '/some-path',
      userId: 'user123',
      get: jest.fn(),
      connection: { remoteAddress: '::ffff:127.0.0.1' }
    };

    res = {
      statusCode: 200
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.DEVELOPMENT_PUBLIC_IP; // clean env after tests
  });

  test('should log SUCCESS event with correct request and response info', async () => {
    getClientIp.mockReturnValue('1.1.1.1');

    req.get.mockImplementation(header => {
      if (header === 'x-forwarded-for') return '192.168.1.100';
      if (header === 'x-rest-api-key') return 'myapikey123456';
      if (header === 'x-rest-api-refresh-key') return 'refreshkeyabcdef';
      return null;
    });

    await Audit(req, res);

    expect(AuditLogger.prototype.init).toHaveBeenCalled();
    expect(AuditLogger.prototype.log).toHaveBeenCalled();

    const [eventType, status, requestObj, responseObj] = AuditLogger.prototype.log.mock.calls[0];

    expect(eventType).toBe('ACCESS');
    expect(status).toBe('SUCCESS');

    expect(requestObj).toMatchObject({
      action: 'POST',
      path: '/some-path',
      actor: 'user123',
      source: '1.1.1.1',
    });
    expect(requestObj.metadata['x-rest-api-key']).toBe('***123456');
    expect(requestObj.metadata['x-rest-api-refresh-key']).toBe('***abcdef');
    expect(typeof requestObj.timestamp).toBe('string');

    expect(responseObj).toEqual({ statusCode: 200 });
  });

  test('should replace local IP with DEVELOPMENT_PUBLIC_IP env var', async () => {
    getClientIp.mockReturnValue('127.0.0.1');
    process.env.DEVELOPMENT_PUBLIC_IP = '203.0.113.42';

    req.get.mockImplementation(() => null);
    req.connection.remoteAddress = '::ffff:127.0.0.1';

    await Audit(req, res);

    const [, , requestObj] = AuditLogger.prototype.log.mock.calls[0];

    expect(requestObj.source).toBe('203.0.113.42');
  });

  test('should log AUTHENTICATION event for /auth paths', async () => {
    req.path = '/auth/login';
    req.get.mockReturnValue(null);

    await Audit(req, res);

    expect(AuditLogger.prototype.log).toHaveBeenCalledWith(
      'AUTHENTICATION',
      'SUCCESS',
      expect.any(Object),
      expect.any(Object)
    );
  });

  test('should handle error thrown by AuditLogger and log it', async () => {
    req.get.mockReturnValue(null);

    AuditLogger.prototype.init.mockRejectedValue(new Error('init failure'));

    await Audit(req, res);

    expect(mockLoggerInstance.error).toHaveBeenCalledWith(
      expect.stringContaining('📋 Audit logging failed'),
      expect.any(Error)
    );
  });

  test('should mark status ERROR for non-200/201 responses', async () => {
    res.statusCode = 500;
    req.get.mockReturnValue(null);

    await Audit(req, res);

    const [, status] = AuditLogger.prototype.log.mock.calls[0];
    expect(status).toBe('ERROR');
  });
});
