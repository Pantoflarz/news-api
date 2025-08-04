const { apiKeyValidator } = require('../../../validators/apiKeyValidator.js');
const { validationResult } = require('express-validator');

jest.mock('../../../services/keyService.js', () => ({
  verifyApiKey: jest.fn()
}));

jest.mock('../../../settings/configs/ConfigLoader.js', () => ({
  apiConfig: {
    endpointsExemptFromApiKey: ['/health', '/public']
  }
}));

const { verifyApiKey } = require('../../../services/keyService.js');

describe('apiKeyValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('skips validation if path is exempt', async () => {
    const req = mockRequest('/health', null);

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(true);
    expect(verifyApiKey).not.toHaveBeenCalled();
  });

  test('fails if x-rest-api-key is missing and path is not exempt', async () => {
    const req = mockRequest('/secure', null);

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('No x-rest-api-key header found in request.');
  });

  test('passes and sets req.userId and req.normalisedApiKey on success', async () => {
    const mockApiKey = 'c9bf9e57-1685-4c89-bafb-ff5af830be8a';

    verifyApiKey.mockResolvedValue({
      userId: 'mockUserId',
      normalisedApiKey: mockApiKey
    });

    const req = mockRequest('/secure', mockApiKey);

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(true);
    expect(verifyApiKey).toHaveBeenCalledWith(mockApiKey, '/secure');
    expect(req.userId).toBe('mockUserId');
    expect(req.normalisedApiKey).toBe(mockApiKey);
  });

  test('fails if verifyApiKey throws an error', async () => {
    const mockApiKey = 'c9bf9e57-1685-4c89-bafb-ff5af830be8a';

    verifyApiKey.mockImplementation(() => {
      throw new Error('API key invalid');
    });

    const req = mockRequest('/secure', mockApiKey);

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('API key invalid');
  });
});

const mockRequest = (path, apiKey) => {
  const req = {
    path,
    headers: {
      'x-rest-api-key': apiKey
    },
    get: function (key) {
      return this.headers[key.toLowerCase()];
    }
  };
  return req;
};

const runValidator = async (validators, req) => {
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
};
