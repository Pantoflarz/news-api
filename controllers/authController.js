const asyncHandler = require("express-async-handler");

const User = require("../models/User.js");
const Token = require('../models/Token.js');

const getLogger = require('../utils/Logger.js');
const logger = getLogger('AuthController');

class AuthController {

  constructor(bcrypt, responseJson) {
    this.bcrypt = bcrypt;
    this.responseJson = responseJson;
  }

  async register_post(req, res, next) {
    let useremail = req.body.email;
    let username = req.body.username;
    let password = await this.bcrypt.hash(req.body.password, 10);
    let registeredDate = new Date();

    try {

      const result = await User.findOne({ userEmail: useremail});

      if (result) {
        throw new Error('User already exists');
      }

      const insert = await User.create({userEmail: useremail, userName: username, password: password, registeredDate: registeredDate});
      if (insert) {
        res.status(200).send(this.responseJson("OK", "success"));
      }

    } catch (err) {
      logger.error('Failed to create user', {
        error: err.message,
        stack: err.stack
      });

      res.status(500).send(this.responseJson("error", "Something went wrong. Try again later."));
    }
  }

async login_post(req, res, next) {
    let login = req.body.login;
    let password = req.body.password;

    const result = await User.findOne(
    {
      $or: [
        {userEmail: login},
        {userName: login}
      ]
    });

    if (result != null) {
      if (await this.bcrypt.compare(password, result.password)) {
        let token = crypto.randomUUID();
        let refreshToken = crypto.randomUUID();
        let expires = new Date(Date.now() + 12 * (24 * 60 * 1000));

        try {
          const insert = await Token.insertOne({userId: result._id, scope: "basic", token: token, refreshToken: refreshToken, expires: expires });

          if (insert) {
              res.status(200).send(this.responseJson("OK", {"token": token, "refreshToken": refreshToken}));
          }
        } catch (err) {
          logger.error('Failed to create token for user', {
            error: err.message,
            stack: err.stack
          });
        }
      } else {
        res.status(403).send(this.responseJson("error", "Provided details invalid."));
      }
    } else {
      res.status(403).send(this.responseJson("error", "Provided details invalid."));
    }

  }

async refresh_key_post(req, res, next) {

    let newToken = crypto.randomUUID();
    let newRefreshToken = crypto.randomUUID();

    let expires = new Date(Date.now() + 12 * (60 * 60 * 1000)).toISOString()

    try {
      const insert = await Token.insertOne({userId: req.userId, scope: "basic", token: newToken, refreshToken: newRefreshToken, expires: expires });

      if (insert) {
          await Token.deleteOne({token: req.apiKey});
          res.status(200).send(this.responseJson("OK", {"token": newToken, "refreshToken": newRefreshToken}));
      } else {
          res.status(500).send(this.responseJson("error", "Something went wrong. Try again later."));
      }
    } catch (err) {
      logger.error('Failed to refresh token for user', {
        error: err.message,
        stack: err.stack
      });
    }

  }

async logout_post(req, res, next) {
    let token = req.normalisedApiKey;

    await Token.deleteOne({token: token});

    res.status(200).send(this.responseJson("OK", "Logged out."));

  }

}

module.exports = AuthController;
