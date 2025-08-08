const NewsController = require('../../../controllers/newsController.js');

describe('NewsController', () => {
  let mockResponseJson;
  let controller;
  let req;
  let res;
  let next;

  beforeEach(() => {
    mockResponseJson = jest.fn((status, data) => ({ status, data }));

    controller = new NewsController(mockResponseJson);

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      locals: {
        cache: {
          get: jest.fn(),
        },
      },
    };

    next = jest.fn();
  });

  describe('dashboard_get', () => {
    it('should return status 200 with cached news data', async () => {
      const fakeNews = [{ title: 'Breaking news' }];
      res.locals.cache.get.mockReturnValue(fakeNews);

      await controller.dashboard_get(req, res, next);

      expect(res.locals.cache.get).toHaveBeenCalledWith('news');
      expect(mockResponseJson).toHaveBeenCalledWith('OK', fakeNews);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ status: 'OK', data: fakeNews });
    });

    it('should return 404 with error message if no cached news', async () => {
      res.locals.cache.get.mockReturnValue(undefined);

      await controller.dashboard_get(req, res, next);

      expect(res.locals.cache.get).toHaveBeenCalledWith('news');
      expect(mockResponseJson).toHaveBeenCalledWith('error', 'News not found');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', data: 'News not found' });
    });

  });
});
