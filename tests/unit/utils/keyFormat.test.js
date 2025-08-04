const { isKeyInValidFormat } = require('../../../utils/keyFormat.js');

describe('isKeyInValidFormat', () => {
  test('returns true for valid UUIDv4 string', () => {
    const validUUID = 'c9bf9e57-1685-4c89-bafb-ff5af830be8a';
    expect(isKeyInValidFormat(validUUID)).toBe(true);
  });

  test('returns false for a valid UUID string that is not in v4 format', () => {
    const validUUIDv5 = '21f7f8de-8051-5b89-8680-0195ef798b6a';
    expect(isKeyInValidFormat(validUUIDv5)).toBe(false);
  });

  test('returns false for invalid UUID string', () => {
    expect(isKeyInValidFormat('not-a-uuid')).toBe(false);
    expect(isKeyInValidFormat('')).toBe(false);
    expect(isKeyInValidFormat(null)).toBe(false);
    expect(isKeyInValidFormat(undefined)).toBe(false);
  });
});
