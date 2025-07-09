const { apiKeyValidator } = require('../../validators/apiKeyValidator.js');
const { validationResult } = require('express-validator');
const Token = require('../../models/Token.js');

jest.mock('../../models/Token.js');

describe('apiKeyValidator validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('passes with a valid UUIDv4 API key and matching token in DB', async () => {
    Token.findOne.mockResolvedValue({ userId: '123', scope: "basic" });

    const req = mockRequest('c9bf9e57-1685-4c89-bafb-ff5af830be8a');

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(true);
    expect(req.apiKey).toBe('c9bf9e57-1685-4c89-bafb-ff5af830be8a');
  });

  test('fails if no x-rest-api-key header is provided', async () => {
    const req = mockRequest(undefined);

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toMatch("No x-rest-api-key header found in request.");
  });

  test('fails if x-rest-api-key is not a valid UUIDv4', async () => {
    const req = mockRequest('invalid-uuid');

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe("x-rest-api-key provided is not in the expected format.");
  });

  test('fails if token is not found or expired in DB', async () => {
    Token.findOne.mockResolvedValue(null); // simulate no valid token

    const req = mockRequest('c9bf9e57-1685-4c89-bafb-ff5af830be8a');

    const result = await runValidator(apiKeyValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toMatch("Invalid/expired x-rest-api-key provided in request.");
  });
});

const mockRequest = (apiKey) => {
  return req = {
    path: '/news/dashboard',
    headers: {
      'x-rest-api-key': apiKey
    },
    get: (key) => req.headers[key.toLowerCase()],
  };
}

const runValidator = async (validatorArray, req) => {
  const res = {};
  const next = jest.fn();

  for (const validator of validatorArray) {
    await validator(req, res, next);
  }

  return validationResult(req);
};
