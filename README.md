# News API

An example News API that handles basic authentication, account management, news fetching and caching as well as the ability to track what articles each user reads.

## Pre-requisites

* Node.js v22.1.0
* A News source (for testing purposes, https://newsapi.org/ is used as an example)
* A MongoDB database (for testing purposes, https://cloud.mongodb.com/ is an example of where you can set one up for free)

## Usage
See the `settings/configs/RestAPI.example.json` file for an example application config. Fill it in/amend it and rename it to RestAPI.json to use it.
See the `.env.example` file for an example secrets config. Fill it in/amend it and rename it to .env to use it.
For running tests, see the `.env.example` file for an example secrets config. Fill it in/amend it and rename it to .env.test to use it.

The app is capable of bootstrapping its own DB structure. Use the relevant env files to set RUN_BOOTSTRAP=true to enable bootstrap mode.
In production, if enabled, this will check that the collections exist; if they do not, they are created with the right structure (note that structure of the existing collection if present is not currently validated).
In test, if enabled, this will delete the collections and create them with the right structure; it is highly advised therefore that you do not set the test env to point to the same db as your production, as this will lead to data loss.

Install using `npm ci ./path/to/news-api`.

Run using `npm start`.
Run the unit tests using `npm run test:unit`.
Run the unit tests using `npm run test:e2e` - this spins up the app to run against.

## Coming Soon
* Finish all js docs.
* e2e tests for all existing endpoints.
* Make e2e tests run against a separate db, so that they don't interfere with prod data.
* Have some mechanism where the e2e tests can clean up the db after themselves after they have ran.
* Recommendation algorithm to personalise returned news for a given account.
* Code tidy-ups.
