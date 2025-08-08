jest.mock('fs');
jest.mock('../../../libs/dateFormatWrapper.js', () => ({
  getDateFormat: jest.fn(() => Promise.resolve(() => '01-01-2025')),
}));

const fs = require('fs');
const { getDateFormat } = require('../../../libs/dateFormatWrapper.js');
const AuditLogger = require('../../../libs/AuditLogger.js');

describe('AuditLogger', () => {
  let writeMock;
  let endMock;
  let mockStream;

  beforeEach(() => {
    writeMock = jest.fn();
    endMock = jest.fn();

    mockStream = {
      write: writeMock,
      end: endMock,
    };

    fs.createWriteStream.mockReturnValue(mockStream);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('init creates a write stream with correct filename and flags', async () => {
    const logger = new AuditLogger();

    await logger.init();

    expect(getDateFormat).toHaveBeenCalled();
    expect(fs.createWriteStream).toHaveBeenCalledWith(
      'logs/audit/audit-log-01-01-2025.txt',
      { flags: 'a' }
    );
  });

  test('log writes JSON stringified log and ends stream', async () => {
    const logger = new AuditLogger();

    await logger.init();

    const type = 'ACCESS';
    const status = 'SUCCESS';
    const requestObj = { timestamp: '2025-01-01T00:00:00Z', foo: 'bar' };
    const responseObj = { statusCode: 200 };

    logger.log(type, status, requestObj, responseObj);

    expect(writeMock).toHaveBeenCalledWith(
      JSON.stringify({
        type,
        status,
        timestamp: requestObj.timestamp,
        request: requestObj,
        response: responseObj,
      }) + '\n'
    );
    expect(endMock).toHaveBeenCalled();
  });

  test('log throws if logger is not initialized', () => {
    const logger = new AuditLogger();

    expect(() => logger.log('ACCESS', 'SUCCESS', {}, {})).toThrow(TypeError);
  });
});
