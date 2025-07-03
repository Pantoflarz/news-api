const asyncHandler = require("express-async-handler");

const User = require("../models/User.js");
const Token = require('../models/Token.js');

(async () => {
  const bcryptModule = await import('bcrypt');
  bcrypt = bcryptModule.default;

  const responseModule = await import('../libs/Response.js');
  responseJson = responseModule.default;
})();

exports.auth_register_post = asyncHandler(async (req, res, next) => {

  let useremail = req.body.email.trim();
  let username = req.body.username;
  let password = await bcrypt.hash(req.body.password, 10);
  let registeredDate = new Date();

  const result = await User.findOne({ userEmail: useremail});

  if (result == null) {
      const insert = await User.create({userEmail: useremail, userName: username, password: password, registeredDate: registeredDate})
      if (insert) {
          res.status(200).send(responseJson("OK", "success"));
      }
  }

  res.status(500).send(responseJson("error", "Something went wrong. Try again later."));

  next();
});

exports.auth_login_post = asyncHandler(async (req, res, next) => {

  let login = req.body.username.trim();
  let password = req.body.password;

  const result = await User.findOne(
  {
    $or: [
      {userEmail: login},
      {userName: login}
    ]
  });

  if (result != null) {
      if(await bcrypt.compare(password, result.password)){
          let token = crypto.randomUUID();
          let refreshToken = crypto.randomUUID();
          let expires = new Date(Date.now() + 1 * (24 * 60 * 1000));

          const insert = await Token.insertOne({userId: result._id, token: token, refreshToken: refreshToken, expires: expires })

          if (insert.acknowledged) {
              res.status(200).send(responseJson("OK", {"token": token, "refreshToken": refreshToken}));
          } else {
              res.status(500).send(responseJson("error", "Something went wrong. Try again later."));
          }
      } else {
          res.status(403).send(responseJson("error", "Provided details invalid."));
      }
  } else {
      res.status(403).send(responseJson("error", "Provided details invalid."));
  }

  next();
});

exports.auth_refresh_key_post = asyncHandler(async (req, res, next) => {

  let token = req.query.api_key;
  let refreshToken = req.query.refresh_key;

  const result = await Token.findOne(
  {
      $and: [
        {token: token},
        {refreshToken: refreshToken}
      ]
  });

  if (result != null) {
      let newToken = crypto.randomUUID();
      let newRefreshToken = crypto.randomUUID();

      let expires = new Date(Date.now() + 24 * (60 * 60 * 1000)).toISOString()

      const insert = await Token.insertOne({userId: result._id, token: newToken, refreshToken: newRefreshToken, expires: expires })

      if (insert.acknowledged) {
          res.status(200).send(responseJson("OK", {"token": token, "refreshToken": refreshToken}));
          Token.deleteOne({"token": token});
      } else {
          res.status(500).send(responseJson("error", "Something went wrong. Try again later."));
      }
  } else {
      res.status(403).send(responseJson("error", "Provided details invalid."));
  }

  next();
});

exports.auth_logout_post = asyncHandler(async (req, res, next) => {
  let token = req.query.api_key;

  const insert = await Token.deleteOne({token: token});

  res.status(200).send(responseJson("OK", "Logged out."));

  next();
});
