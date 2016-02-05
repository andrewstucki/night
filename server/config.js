var _ = require("underscore");

var environment = process.env.NODE_ENV || "development";

var config = {
  development: {
    db: "mongodb://localhost/night",
    port: 3000,
    redis: 'redis://localhost:6379',
    baseUrl: 'http://localhost:3000'
  },

  test: {
    db: "mongodb://localhost/night-test",
    port: 3000,
    redis: 'redis://localhost:6379',
    baseUrl: 'http://localhost:3000'
  },

  production: {
    db: process.env.MONGOLAB_URI || throw new Error("MongoDB required!"),
    port: process.env.PORT || throw new Error("Port required!"),
    redis: process.env.REDIS_URL || throw new Error("Redis required!"),
    mandrill_key: process.env.MANDRILL_APIKEY || throw new Error("Mandrill API key required!"),
    baseUrl: process.env.BASE_URL || throw new Error("Base URL required!")
  }
};

/* istanbul skip next */
if (!(environment in config)) throw new Error("Invalid environment specified: " + environment + "!");

module.exports = _.extend({}, config[environment], {
  environment: environment
});
