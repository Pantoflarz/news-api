# News API

An example News API that handles basic authentication, account management, news fetching and caching as well as the ability to track what articles each user reads.

## Pre-requisites

* Node.js v22.1.0
* A News source (for testing purposes, https://newsapi.org/ is used as an example)
* A MongoDB database (for testing purposes, https://cloud.mongodb.com/ is an example of where you can set one up for free)

## Usage
See the `RestAPI.example.json` file for an example config. Fill it in and rename it to RestAPI.json to use it.

Install using `npm ci ./path/to/news-api`.

Run using `npm start`.
Run the tests using `npm test`.

## Coming Soon
* Update logging to handle all errors (including from try catch blocks).
* Tests for all existing endpoints.
* Improve validation of inputs.
* Support for multiple news sources.
* Recommendation algorithm to personalise returned news for a given account.
* Code tidy-ups (split into MVC, tidy up promises and logging).
