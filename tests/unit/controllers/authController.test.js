jest.mock('../../../utils/Logger.js', () => require('@mocks/mockLogger'));

const getLogger = require('../../../utils/Logger.js');
const mockLogger = getLogger();

const AuthController = require('../../../controllers/authController.js');

const User = require('../../../models/User.js');
jest.mock('../../../models/User.js');

describe('constructor tests', () => {
  const mockBcrypt = {
    hash: jest.fn()
  };
  const mockResponseJson = jest.fn();

  test('should construct successfully with valid dependencies', () => {
    const instance = new AuthController(mockBcrypt, mockResponseJson);
    expect(instance).toBeInstanceOf(AuthController);
    expect(instance.bcrypt).toBe(mockBcrypt);
    expect(instance.responseJson).toBe(mockResponseJson);
  });

  test('should throw if bcrypt is missing or invalid', () => {
    expect(() => {
      new AuthController({}, mockResponseJson); // no .hash function
    }).toThrow(TypeError);

    expect(() => {
      new AuthController(null, mockResponseJson);
    }).toThrow(TypeError);
  });

  test('should throw if responseJson is not a function', () => {
    expect(() => {
      new AuthController(mockBcrypt, null);
    }).toThrow(TypeError);

    expect(() => {
      new AuthController(mockBcrypt, {});
    }).toThrow(TypeError);
  });
});

describe('register_post tests', () => {
  let mockLogger;
  let controller;
  let mockBcrypt;
  let mockResponseJson;
  let req;
  let res;
  let next;

  beforeEach(() => {
    mockLogger = logger();
    mockBcrypt = { hash: jest.fn() };
    mockResponseJson = jest.fn((status, message) => ({ status, message }));
    controller = new AuthController(mockBcrypt, mockResponseJson);

    req = {
      body: {
        email: 'test@example.com',
        username: 'testuser',
        password: 'plaintext'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    next = jest.fn();
  });

  test('successfully registers a new user', async () => {
    mockBcrypt.hash.mockResolvedValue('hashedpass');
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(true);

    await controller.register_post(req, res, next);

    expect(mockBcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
    expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      userEmail: 'test@example.com',
      userName: 'testuser',
      password: 'hashedpass'
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ status: 'OK', message: 'success' });
  });

  test('returns 500 if user already exists', async () => {
    mockBcrypt.hash.mockResolvedValue('hashedpass');
    User.findOne.mockResolvedValue({}); // user already exists

    await controller.register_post(req, res, next);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to create user',
      expect.objectContaining({
        error: 'User already exists',
        stack: expect.any(String)
      })
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
  });

  test('returns 500 on unexpected error', async () => {
    mockBcrypt.hash.mockResolvedValue('hashedpass');
    User.findOne.mockRejectedValue(new Error('DB failure'));

    await controller.register_post(req, res, next);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to create user',
      expect.objectContaining({
        error: 'DB failure',
        stack: expect.any(String)
      })
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
  });
});
