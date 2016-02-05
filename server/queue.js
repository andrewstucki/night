var kue = require('kue');

var config = require('./config');

var queue = kue.createQueue({
  redis: config.redis
});

module.exports = queue;

kue.Job.rangeByType('clear-venues', 'delayed', 0, 10, '', function (err, jobs) {
  if (err) throw err;
  if (!jobs.length) queue.create('clear-venues').save();
});
