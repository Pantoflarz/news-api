const mongoose = require('mongoose');

const getLogger = require('../utils/Logger.js');
const logger = getLogger('bootstrap/db.js');

async function bootstrapDb({ dropIfExists = false } = {}) {
  if (process.env.RUN_BOOTSTRAP === 'true') {
    logger.info('💽🆕 Bootstrap database setup starting...');

    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

    const conn = mongoose.createConnection(uri);

    try {
      await conn.asPromise(); // wait until connection is established
      const db = conn.db;

      if (dropIfExists) {
        logger.info(`Dropping existing database "${process.env.DB_NAME}" for fresh run...`);
        await db.dropDatabase();
      }

      logger.info(`Bootstrapping MongoDB collections for DB "${process.env.DB_NAME}"...`);

      const collections = [
        {
          name: "articles",
          schema: {
            source: { bsonType: "string" },
            author: { bsonType: "string" },
            title: { bsonType: "string" },
            description: { bsonType: "string" },
            url: { bsonType: "string" },
            urlToImage: { bsonType: "string" },
            publishedAt: { bsonType: "date" },
            fetchedAt: { bsonType: "date" }
          }
        },
        {
          name: "tokens",
          schema: {
            userId: { bsonType: "string" },
            scope: { bsonType: "string" },
            token: { bsonType: "string" },
            refreshToken: { bsonType: "string" },
            expires: { bsonType: "date" }
          }
        },
        {
          name: "track",
          schema: {
            userId: { bsonType: "string" },
            article: { bsonType: "string" },
            time: { bsonType: "date" }
          }
        },
        {
          name: "users",
          schema: {
            userEmail: { bsonType: "string" },
            userName: { bsonType: "string" },
            password: { bsonType: "string" },
            registeredDate: { bsonType: "date" }
          }
        }
      ];

      for (const { name, schema } of collections) {
        const exists = await db.listCollections({ name }).hasNext();
        if (!exists) {
          await db.createCollection(name, { validator: { $jsonSchema: { bsonType: "object", properties: schema } } });
          logger.info(`Created collection: ${name}`);
        } else {
          logger.info(`Not creating collection: ${name} as it already exists.`);
        }
      }

      logger.info("MongoDB bootstrap complete ✅");

    } finally {
      await conn.close();
    }
  }
}

module.exports = bootstrapDb;
