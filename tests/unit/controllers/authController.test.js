jest.mock('../../../utils/Logger.js');
jest.mock('../../../models/User.js');
jest.mock('../../../models/Token.js');
jest.mock('crypto');

const getLogger = require('../../../utils/Logger.js');
const mockLoggerInstance = getLogger.mockLoggerInstance;

const User = require('../../../models/User.js');
const Token = require('../../../models/Token.js');

const crypto = require('crypto');

const AuthController = require('../../../controllers/authController.js');

describe('AuthController', () => {
  let controller;
  let mockBcrypt;
  let mockResponseJson;
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    crypto.randomUUID.mockReturnValue('mocked-uuid');

    // mock bcrypt dependency
    mockBcrypt = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    // mock responseJson function passed to controller
    mockResponseJson = jest.fn((status, message) => ({ status, message }));

    controller = new AuthController(mockBcrypt, mockResponseJson);

    // mock Express res object with chainable status/send
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();

    // default req reset to empty object, set per test
    req = {};
  });

  describe('constructor', () => {
    it('constructs successfully with valid dependencies', () => {
      expect(controller).toBeInstanceOf(AuthController);
      expect(controller.bcrypt).toBe(mockBcrypt);
      expect(controller.responseJson).toBe(mockResponseJson);
    });

    it('throws TypeError if bcrypt is missing or invalid', () => {
      expect(() => new AuthController({}, mockResponseJson)).toThrow(TypeError);
      expect(() => new AuthController(null, mockResponseJson)).toThrow(TypeError);
    });

    it('throws TypeError if responseJson is not a function', () => {
      expect(() => new AuthController(mockBcrypt, null)).toThrow(TypeError);
      expect(() => new AuthController(mockBcrypt, {})).toThrow(TypeError);
    });
  });

  describe('register_post', () => {
    beforeEach(() => {
      req.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'plaintext',
      };
    });

    it('registers new user successfully', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedpass');
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(true);

      await controller.register_post(req, res, next);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
      expect(User.findOne).toHaveBeenCalledWith({ userEmail: 'test@example.com' });
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        userEmail: 'test@example.com',
        userName: 'testuser',
        password: 'hashedpass',
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ status: 'OK', message: 'success' });
    });

    it('returns 500 if user already exists', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedpass');
      User.findOne.mockResolvedValue({}); // simulate existing user

      await controller.register_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create user',
        expect.objectContaining({
          error: 'User already exists',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
    });

    it('handles falsy insert return value from User.create', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedpass');
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(null); // simulate falsy insert

      await controller.register_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create user',
        expect.objectContaining({
          error: 'Failed to insert new user',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
    });

    it('returns 500 on unexpected error', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedpass');
      User.findOne.mockRejectedValue(new Error('DB failure'));

      await controller.register_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create user',
        expect.objectContaining({
          error: 'DB failure',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
    });
  });

  describe('login_post', () => {
    beforeEach(() => {
      req.body = {
        login: 'testuser',
        password: 'plaintext',
      };
    });

    it('logs in successfully with valid credentials', async () => {
      User.findOne.mockResolvedValue({
        _id: 'userId123',
        password: 'hashedpass',
      });
      mockBcrypt.compare.mockResolvedValue(true);
      Token.create.mockResolvedValue(true);

      await controller.login_post(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { userEmail: 'testuser' },
          { userName: 'testuser' },
        ],
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith('plaintext', 'hashedpass');
      expect(Token.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'userId123',
        scope: 'basic',
        token: 'mocked-uuid',
        refreshToken: 'mocked-uuid',
        expires: expect.any(Date),
      }));

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
    });

    it('returns 403 if password mismatch', async () => {
      User.findOne.mockResolvedValue({
        _id: 'userId123',
        password: 'hashedpass',
      });
      mockBcrypt.compare.mockResolvedValue(false);

      await controller.login_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create token for user',
        expect.objectContaining({
          error: 'Password does not match account',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Provided details invalid.' });
    });

    it('returns 403 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await controller.login_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create token for user',
        expect.objectContaining({
          error: 'Account does not exist',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Provided details invalid.' });
    });

    it('handles falsy insert return value from Token.create', async () => {
      User.findOne.mockResolvedValue({
        _id: 'userId123',
        password: 'hashedpass',
      });
      mockBcrypt.compare.mockResolvedValue(true);
      Token.create.mockResolvedValue(null); // simulate DB failure / falsy insert

      await controller.login_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create token for user',
        expect.objectContaining({
          error: 'Failed to login user',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Provided details invalid.' });
    });

    it('returns 403 on unexpected error', async () => {
      User.findOne.mockRejectedValue(new Error('DB failure'));

      await controller.login_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create token for user',
        expect.objectContaining({
          error: 'DB failure',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Provided details invalid.' });
    });
  });

  describe('refresh_key_post', () => {
    beforeEach(() => {
      req.userId = 'mockUserId';
      req.apiKey = 'mockApiKey';
    });

    it('refreshes token successfully', async () => {
      Token.create.mockResolvedValue(true);
      Token.deleteOne.mockResolvedValue(true);

      await controller.refresh_key_post(req, res, next);

      expect(Token.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'mockUserId',
        scope: 'basic',
        token: 'mocked-uuid',
        refreshToken: 'mocked-uuid',
        expires: expect.any(Date),
      }));

      expect(Token.deleteOne).toHaveBeenCalledWith({ token: 'mockApiKey' });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
    });

    it('returns 500 on error', async () => {
      Token.create.mockRejectedValue(new Error('DB failure'));

      await controller.refresh_key_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to refresh token for user',
        expect.objectContaining({
          error: 'DB failure',
          stack: expect.any(String),
        })
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
    });
  });

  describe('logout_post', () => {
    beforeEach(() => {
      req.normalisedApiKey = 'mockApiKey';
    });

    it('logs out successfully when token deleted', async () => {
      Token.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await controller.logout_post(req, res, next);

      expect(Token.deleteOne).toHaveBeenCalledWith({ token: 'mockApiKey' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ status: 'OK', message: 'Logged out.' });
    });

    it('returns 500 if Token.deleteOne throws', async () => {
      Token.deleteOne.mockRejectedValue(new Error('DB failure'));

      await controller.logout_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to delete token on logout',
        expect.objectContaining({
          error: 'DB failure',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong. Try again later.' });
    });
  });
});
