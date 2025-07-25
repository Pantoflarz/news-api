const { verifyApiKey, verifyRefreshKey } = require('../../services/keyService.js');
const Token = require('../../models/Token.js');

jest.mock('../../models/Token.js');
jest.mock('../../settings/configs/ConfigLoader.js', () => ({
  get scopesConfig() {
    return {
      basic: ['/path-a']
    };
  }
}));

describe('keyServiceTest', () => {
  describe('verifyApiKey', () => {
    test('returns user info for valid api key and allowed path', async () => {
      const mockToken = {
        userId: '123',
        scope: 'basic',
        token: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
        refreshToken: undefined
      };
      Token.findOne.mockResolvedValue(mockToken);

      const { userId, normalisedApiKey, normalisedRefreshKey } = await verifyApiKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', '/path-a');

      expect(userId).toEqual(mockToken.userId);
      expect(normalisedApiKey).toEqual(mockToken.token);
      expect(normalisedRefreshKey).toEqual(undefined);
    });

    test('throws if scope does not allow the path', async () => {
      Token.findOne.mockResolvedValue({ userId: '123', scope: 'basic' });
      await expect(verifyApiKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', '/forbidden'))
        .rejects.toThrow('Invalid/expired x-rest-api-key provided in request.');
    });

    test('throws if api key not found or expired', async () => {
      Token.findOne.mockResolvedValue(null);
      await expect(verifyApiKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', '/path-a'))
        .rejects.toThrow('Invalid/expired x-rest-api-key provided in request.');
    });
  });

  describe('verifyRefreshKey', () => {
    test('returns user info for matching refresh key and allowed path', async () => {
      const mockToken = {
        userId: '123',
        scope: 'basic',
        token: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
        refreshToken: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      };
      Token.findOne.mockResolvedValue(mockToken);

      const { userId, normalisedApiKey, normalisedRefreshKey } = await verifyRefreshKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '/path-a');

      expect(userId).toEqual(mockToken.userId);
      expect(normalisedApiKey).toEqual(mockToken.token);
      expect(normalisedRefreshKey).toEqual(mockToken.refreshToken);
    });
    test('fails to return user info for non-matching refresh key', async () => {
      const mockToken = {
        userId: '123',
        scope: 'basic',
        token: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
        refreshToken: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      };
      Token.findOne.mockResolvedValue(mockToken);

      await expect(verifyRefreshKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', '3fa85f64-5717-4562-b3fc-2c963f66afa6', '/path-a'))
        .rejects.toThrow('Invalid/expired x-rest-refresh-key provided in request.');
    });
  });
});
