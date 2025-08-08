const getClientIp = require('../../../utils/getClientIp');

describe('getClientIp', () => {
  test('returns first IP from x-forwarded-for header if present', () => {
    const req = {
      get: jest.fn().mockImplementation(header => {
        if (header === 'x-forwarded-for') {
          return '192.168.0.1, 10.0.0.1';
        }
        return null;
      }),
      connection: {
        remoteAddress: '::1'
      }
    };

    expect(getClientIp(req)).toBe('192.168.0.1');
  });

  test('returns last segment of remoteAddress if x-forwarded-for missing', () => {
    const req = {
      get: jest.fn().mockReturnValue(null),
      connection: {
        remoteAddress: '::ffff:127.0.0.1'
      }
    };

    expect(getClientIp(req)).toBe('127.0.0.1');
  });

  test('returns empty string if no x-forwarded-for and no remoteAddress', () => {
    const req = {
      get: jest.fn().mockReturnValue(null),
      connection: {}
    };

    expect(getClientIp(req)).toBe('');
  });

  test('handles missing connection gracefully', () => {
    const req = {
      get: jest.fn().mockReturnValue(null),
      connection: undefined
    };

    expect(getClientIp(req)).toBe('');
  });
});
