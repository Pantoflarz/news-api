const { refreshKeyValidator } = require('../../../validators/refreshKeyValidator.js');
const { validationResult } = require('express-validator');

jest.mock('../../../services/keyService.js', () => ({
  verifyRefreshKey: jest.fn()
}));

const { verifyRefreshKey } = require('../../../services/keyService.js');

describe('refreshKeyValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('passes with valid refresh key and matching token', async () => {
    verifyRefreshKey.mockResolvedValue({
      userId: '123',
      normalisedApiKey: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
      normalisedRefreshKey: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    });

    const req = mockRequest('c9bf9e57-1685-4c89-bafb-ff5af830be8a', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');

    const result = await runValidator(refreshKeyValidator, req);

    expect(result.isEmpty()).toBe(true);
    expect(verifyRefreshKey).toHaveBeenCalledWith('c9bf9e57-1685-4c89-bafb-ff5af830be8a', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '/auth/refresh_key');
    expect(req.userId).toBe('123');
    expect(req.normalisedApiKey).toBe('c9bf9e57-1685-4c89-bafb-ff5af830be8a');
    expect(req.normalisedRefreshKey).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');
  });

  test('fails if no x-rest-api-refresh-key header is provided', async () => {
    const req = mockRequest('c9bf9e57-1685-4c89-bafb-ff5af830be8a', null);

    const result = await runValidator(refreshKeyValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toMatch('No x-rest-api-refresh-key header found in request.');
  });

  test('fails if refresh key provided does not match the stored refresh key', async () => {
    // Instead of resolving a mismatched key, reject to simulate verifyRefreshKey throwing on mismatch
    verifyRefreshKey.mockRejectedValue(new Error('Invalid/expired x-rest-api-refresh-key provided in request.'));

    const req = mockRequest('c9bf9e57-1685-4c89-bafb-ff5af830be8a', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');

    const result = await runValidator(refreshKeyValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toMatch('Invalid/expired x-rest-api-refresh-key provided in request.');
  });
});

const mockRequest = (apiKey, refreshKey) => {
  const req = {
    path: '/auth/refresh_key',
    normalisedApiKey: apiKey,
    headers: {
      'x-rest-api-key': apiKey,
      'x-rest-api-refresh-key': refreshKey
    },
    get: (key) => req.headers[key.toLowerCase()]
  };
  return req;
};

const runValidator = async (validators, req) => {
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
};
