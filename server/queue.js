var kue = require('kue');
var config = require('./config')

module.exports = kue.createQueue({
  redis: config.redis
});
