jest.mock('../../../utils/Logger.js');
jest.mock('../../../models/User.js');

const getLogger = require('../../../utils/Logger.js');
const mockLoggerInstance = getLogger();

const AuthController = require('../../../controllers/authController.js');
const User = require('../../../models/User.js');

describe('AuthController', () => {
  let controller;
  let mockBcrypt;
  let mockResponseJson;
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    mockBcrypt = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockResponseJson = jest.fn((status, message) => ({ status, message }));

    controller = new AuthController(mockBcrypt, mockResponseJson);

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  describe('constructor', () => {
    it('should construct successfully with valid dependencies', () => {
      expect(controller).toBeInstanceOf(AuthController);
      expect(controller.bcrypt).toBe(mockBcrypt);
      expect(controller.responseJson).toBe(mockResponseJson);
    });

    it('should throw if bcrypt is missing or invalid', () => {
      expect(() => new AuthController({}, mockResponseJson)).toThrow(TypeError);
      expect(() => new AuthController(null, mockResponseJson)).toThrow(TypeError);
    });

    it('should throw if responseJson is not a function', () => {
      expect(() => new AuthController(mockBcrypt, null)).toThrow(TypeError);
      expect(() => new AuthController(mockBcrypt, {})).toThrow(TypeError);
    });
  });

  describe('register_post', () => {
    beforeEach(()=> {

      req = {
        body: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'plaintext'
        },
      };

    });

    it('should successfully register a new user', async () => {
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

    it('should respond with 500 if user already exists', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedpass');
      User.findOne.mockResolvedValue({}); // user exists

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

    it('should respond with 500 on unexpected error', async () => {
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
    beforeEach(()=> {

      req = {
        body: {
          login: 'testuser',
          password: 'plaintext'
        },
      };

    });

    it('should login successfully with valid credentials', async () => {
      User.findOne.mockResolvedValue({
        _id: 'userId123',
        password: 'hashedpass',
      });
      mockBcrypt.compare.mockResolvedValue(true);

      // Mock Token.insertOne for token creation
      const mockInsertOne = jest.fn().mockResolvedValue(true);
      const Token = require('../../../models/Token.js');
      Token.insertOne = mockInsertOne;

      await controller.login_post(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { userEmail: 'testuser' },
          { userName: 'testuser' },
        ],
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith('plaintext', 'hashedpass');
      expect(mockInsertOne).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
    });

    it('should respond with 403 if password does not match', async () => {
      User.findOne.mockResolvedValue({
        _id: 'userId123',
        password: 'hashedpass',
      });
      mockBcrypt.compare.mockResolvedValue(false);

      await controller.login_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create token for user',
        expect.objectContaining({
          error: 'Password does not match account.',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Provided details invalid.' });
    });

    it('should respond with 403 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await controller.login_post(req, res, next);

      expect(mockLoggerInstance.error).toHaveBeenCalledWith(
        'Failed to create token for user',
        expect.objectContaining({
          error: 'Account does not exist.',
          stack: expect.any(String),
        })
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ status: 'error', message: 'Provided details invalid.' });
    });

    it('should respond with 403 on unexpected error', async () => {
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

    beforeEach(()=> {

      // Add the required props userId etc just for these tests
      req = {
        body: {
          login: 'testuser',
          password: 'plaintext'
        },
        userId: 'mockUserId',
        apiKey: 'mockApiKey',
        normalisedApiKey: 'mockApiKey'
      };

    });

    it('should refresh token successfully', async () => {
      const Token = require('../../../models/Token.js');
      Token.insertOne = jest.fn().mockResolvedValue(true);
      Token.deleteOne = jest.fn().mockResolvedValue(true);

      await controller.refresh_key_post(req, res, next);

      expect(Token.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'mockUserId',
        scope: 'basic',
        token: expect.any(String),
        refreshToken: expect.any(String),
        expires: expect.any(String),
      }));

      expect(Token.deleteOne).toHaveBeenCalledWith({ token: 'mockApiKey' });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
    });

    it('should respond with 500 on error', async () => {
      const Token = require('../../../models/Token.js');
      Token.insertOne = jest.fn().mockRejectedValue(new Error('DB failure'));

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

    it('should log out successfully', async () => {
      const Token = require('../../../models/Token.js');
      Token.deleteOne = jest.fn().mockResolvedValue(true);

      await controller.logout_post(req, res, next);

      expect(Token.deleteOne).toHaveBeenCalledWith({ token: 'mockApiKey' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
    });
  });
});
