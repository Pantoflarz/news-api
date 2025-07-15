const { verifyApiKey } = require('../../services/keyService.js');
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
    test('returns user info for valid key and allowed path', async () => {
      const mockToken = {
        userId: '123',
        scope: 'basic',
        token: 'c9bf9e57-1685-4c89-bafb-ff5af830be8a',
        refreshToken: undefined
      };
      Token.findOne.mockResolvedValue(mockToken);

      const { userId, normalisedApiKey, normalisedRefreshKey } = await verifyApiKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', '/path-a');

      expect(userId).toEqual(mockToken.userId);
      expect(normalisedApiKey).toEqual('c9bf9e57-1685-4c89-bafb-ff5af830be8a');
      expect(normalisedRefreshKey).toEqual(undefined);
    });

    test('throws if scope does not allow the path', async () => {
      Token.findOne.mockResolvedValue({ userId: '123', scope: 'basic' });
      await expect(verifyApiKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', '/forbidden'))
        .rejects.toThrow('Invalid/expired x-rest-api-key provided in request.');
    });

    test('throws if token not found or expired', async () => {
      Token.findOne.mockResolvedValue(null);
      await expect(verifyApiKey('c9bf9e57-1685-4c89-bafb-ff5af830be8a', '/path-a'))
        .rejects.toThrow('Invalid/expired x-rest-api-key provided in request.');
    });
  });
});
