jest.mock('../../../models/Track.js');
jest.mock('../../../utils/Logger.js');

const Track = require('../../../models/Track.js');
const getLogger = require('../../../utils/Logger.js');
const logger = getLogger('TrackController');

const TrackController = require('../../../controllers/TrackController.js');

describe('TrackController', () => {
  let mockResponseJson;
  let controller;
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponseJson = jest.fn((status, message) => ({ status, message }));
    controller = new TrackController(mockResponseJson);

    req = {
      body: {
        articleID: 'article123',
      },
      userId: 'user123',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  test('track_post sends success response when insert succeeds', async () => {
    Track.insertOne.mockResolvedValue(true);

    await controller.track_post(req, res, next);

    expect(Track.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
      article: 'article123',
      time: expect.any(Date),
    }));

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ status: 'OK', message: 'success' });
  });

  test('track_post sends error response and logs error when insert fails with rejection', async () => {
    const error = new Error('DB failure');
    Track.insertOne.mockRejectedValue(error);

    await controller.track_post(req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to track article read by user',
      expect.objectContaining({
        error: 'DB failure',
        stack: error.stack,
      })
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
  });

  test('track_post sends error response and logs error when insert resolves to falsy', async () => {
    Track.insertOne.mockResolvedValue(null);

    await controller.track_post(req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to track article read by user',
      expect.objectContaining({
        error: 'Could not insert tracked article',
      })
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
  });
});
