var _ = require("underscore");

var environment = process.env.NODE_ENV || "development";

var config = {
  development: {
    db: "mongodb://localhost/night",
    port: 3000,
    redis: 'redis://localhost:6379',
    mandrill_key: process.env.MANDRILL_APIKEY,
    baseUrl: 'http://localhost:3000',
    yelp: {
      consumerKey: process.env.YELP_CONSUMER_KEY,
      consumerSecret: process.env.YELP_CONSUMER_SECRET,
      token: process.env.YELP_TOKEN,
      tokenSecret: process.env.YELP_TOKEN_SECRET
    }
  },

  test: {
    db: "mongodb://localhost/night-test",
    port: 3000,
    redis: 'redis://localhost:6379',
    mandrill_key: process.env.MANDRILL_APIKEY,
    baseUrl: 'http://localhost:3000',
    yelp: {
      consumerKey: process.env.YELP_CONSUMER_KEY,
      consumerSecret: process.env.YELP_CONSUMER_SECRET,
      token: process.env.YELP_TOKEN,
      tokenSecret: process.env.YELP_TOKEN_SECRET
    }
  },

  production: {
    db: process.env.MONGOLAB_URI,
    port: process.env.PORT,
    redis: process.env.REDIS_URL,
    mandrill_key: process.env.MANDRILL_APIKEY,
    baseUrl: process.env.BASE_URL,
    yelp: {
      consumerKey: process.env.YELP_CONSUMER_KEY,
      consumerSecret: process.env.YELP_CONSUMER_SECRET,
      token: process.env.YELP_TOKEN,
      tokenSecret: process.env.YELP_TOKEN_SECRET
    }
  }
};

/* istanbul skip next */
if (!(environment in config)) throw new Error("Invalid environment specified: " + environment + "!");

module.exports = _.extend({}, config[environment], {
  environment: environment
});
