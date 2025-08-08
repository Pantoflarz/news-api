const responseJson = require('../../../libs/Response.js'); // adjust path as needed

describe('responseJson', () => {
  test('returns an object with status and response properties', () => {
    const status = 200;
    const response = { message: 'OK' };

    const result = responseJson(status, response);

    expect(result).toEqual({
      status: 200,
      response: { message: 'OK' }
    });
  });

  test('works with different status and response types', () => {
    expect(responseJson(404, 'Not found')).toEqual({
      status: 404,
      response: 'Not found'
    });

    expect(responseJson(500, null)).toEqual({
      status: 500,
      response: null
    });
  });
});
