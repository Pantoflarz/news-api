const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

const dotenvExpanded = require('dotenv-expand');
dotenvExpanded.expand(dotenv.config({ path: envFile }));

const https = require('https');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const userAgent = require('express-useragent');
const NodeCache = require('node-cache');

const Audit = require('./postprocessors/Audit.js');
const { apiKeyValidator } = require('./validators/apiKeyValidator.js');
const validateRequest = require('./middleware/validateRequest.js');
const { connect } = require('./libs/MongoDB.js');
const responseJson = require('./libs/Response.js');

const Article = require('./models/Article.js');

const auth = require('./routers/auth.js');
const news = require('./routers/news.js');
const ping = require('./routers/ping.js');
const track = require('./routers/track.js');

const getLogger = require('./utils/Logger.js');
const logger = getLogger('api.js');

const Config = require('./settings/configs/ConfigLoader.js');

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8' // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
})

let cache, web;

const downloadNews = () => {
  return new Promise((resolve, reject) => {

    const options = {
      host: process.env.NEWSAPI_HOST,
      port: process.env.NEWSAPI_PORT,
      path: process.env.NEWSAPI_PATH,
      method: process.env.NEWSAPI_METHOD,
      headers: JSON.parse(process.env.NEWSAPI_HEADERS)
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

  await connect({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
		dbCluster: process.env.DB_CLUSTER,
    dbName: process.env.DB_NAME
  });
  //await downloadNews();

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

	web.use(apiKeyValidator, validateRequest);

	// Optional audit logger (wraps routes)
	if (Config.apiConfig.audit) {
	  web.use((req, res, next) => {
	    res.on('finish', () => {
	      Audit(req, res);
	    });
	    next();
	  });
	}

	// Route handlers
	web.use(auth);
	web.use(news);
	web.use(ping);
	web.use(track);

	// 404 fallback
	web.use((req, res, next) => {
	  if (!res.headersSent) {
	    res.status(404).send(
	      responseJson("error", `Cannot ${req.method} ${req.url}.`)
	    );
	  }
	});

	// Error handler
	web.use((err, req, res, next) => {
	  logger.error(err.stack);
	  if (!res.headersSent) {
	    res.status(500).send(responseJson("error", "Server error."));
	  }
	});

  logger.debug('...started');

  return web;
};

module.exports = setup().catch(err => {
  console.error('❌ Error during API setup:', err);
  return null;
});
