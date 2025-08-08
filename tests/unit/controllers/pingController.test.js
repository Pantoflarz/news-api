const PingController = require('../../../controllers/PingController');

describe('PingController', () => {
  let mockResponseJson;
  let controller;
  let req;
  let res;
  let next;

  beforeEach(() => {
    mockResponseJson = jest.fn((status) => ({ status }));
    controller = new PingController(mockResponseJson);

    req = {};
    res = {
      send: jest.fn(),
    };
    next = jest.fn();
  });

  test('ping_get sends pong response', () => {
    controller.ping_get(req, res, next);

    expect(mockResponseJson).toHaveBeenCalledWith('pong');
    expect(res.send).toHaveBeenCalledWith({ status: 'pong' });
  });
});
