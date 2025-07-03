const https = require('https');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const userAgent = require('express-useragent');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const Audit = require('./postprocessors/Audit');
const Authentication = require('./middleware/Authentication');
const { connect } = require('./libs/MongoDB');
const Logger = require('./libs/Logger');
const responseJson = require('./libs/Response');

const Article = require('./models/Article');

const auth = require('./routers/auth');
const news = require('./routers/news');
const ping = require('./routers/ping');

const logger = new Logger();

const RestAPI = JSON.parse(
  fs.readFileSync(path.join(__dirname, './settings/configs/RestAPI.json'), 'utf8')
);

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8' // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
})

let cache, web;

const downloadNews = () => {
  return new Promise((resolve, reject) => {

    const options = {
      host: RestAPI.newsapi.host,
      port: RestAPI.newsapi.port,
      path: RestAPI.newsapi.path,
      method: RestAPI.newsapi.method,
      headers: RestAPI.newsapi.headers
    };

    https.get(options, (res) => {
      let data = [];
      logger.debug('Status code...' + res.statusCode);

      res.on('data', chunk => data.push(chunk));
      res.on('end', async () => {
        try {
          const response = JSON.parse(Buffer.concat(data).toString());
          if (response.articles) {
            logger.debug('Saving articles...');
            for (const article of response.articles) {
              const result = await Article.findOne({ title: article.title });
              if (!result) {
                const newArticle = new Article({
                  source: article.source.name,
                  author: article.author,
                  title: article.title,
                  description: article.description,
                  url: article.url,
                  urlToImage: article.urlToImage,
                  publishedAt: new Date(article.publishedAt),
                  fetchedAt: new Date()
                });
                await newArticle.save();
                logger.debug('...saved article.');
              } else {
                logger.debug('Not saving article as already present.');
              }
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
};

const setup = async () => {

  await connect(RestAPI.database);
  await downloadNews();

  try {
    logger.debug('Initialising cache... ');
    cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

    const result = await Article.find({}, null, {limit:50}).sort({createdAt: "descending"});
    cache.set("news", result, 300);

    logger.debug('...cache initialisation successful.');

    cache.on("expired", async function (key, value) {
      if (key == "news") {
        await downloadNews();
        const result = await Article.find({}, null, {limit:50}).sort({createdAt: "descending"});
        cache.set("news", result);
        logger.debug('Reloaded news in cache.');
      }
    });

  } catch (err) {
    logger.error('...initialising cache failed. Error: ' + err);
    process.exit();
  }

  web = express();
  web.use(helmet());

  // Apply the rate limiting middleware to all requests.
  web.use(limiter);

  web.use(bodyParser.json());
  web.use(bodyParser.urlencoded({ extended: true }));
  web.use(userAgent.express());

  web.use(async function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-REST-APPLICATION-KEY, X-REST-CLIENT-KEY');
    res.header('Content-Type', 'application/json');

    res.locals.cache = cache;
    next();
  });

  web.use(Authentication());

  web.use('/auth', auth);
  web.use('/news', news);
  web.use('/ping', ping);

  web.use(async function (req, res, next) {
    if (!res.headersSent) {
      res.status(501).send(responseJson("error", 'Invalid request, cannot ' + req.method + " " + req.url + " as either the method is invalid or endpoint does not exist."));
    }
    next();
  });

  web.use(function (req, res, next) {
    if (!RestAPI.api.audit) return next();
    if (res.headersSent) {
      Audit(req, res);
    }
    next();
  });

  web.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send(responseJson("error", "Server error."));
    next(err);
  });

  logger.debug('...started');

  return web;
};

module.exports = setup().catch(err => {
  console.error('❌ Error during API setup:', err);
  return null;
});
