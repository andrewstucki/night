require('dotenv').load();

var server = require('http').createServer();
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var path = require('path');

var models = require('./models');
var config = require('./config');
var middleware = require('./middleware');
var errors = require('./errors');
var socket = require('./socket');

var app = express();
var jsonParser = bodyParser.json();

var queue = require('./queue');
var email = require('./workers/email');

queue.process('email', email);

app.use(express.static('public'));
app.get(/^\/(login|signup|resend).*/, function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../public/index.html'));
});

var router  = express.Router();
app.use('/api/v1', router);

// application core

var unauthorized = function(res, message) {
  return res.status(401).json({
    error: message || /* istanbul ignore next */ "Unauthorized"
  });
};

var notFound = function(res, message) {
  return res.status(404).json({
    error: message || /* istanbul ignore next */ "Not Found"
  });
};

var invalid = function(res, message) {
  return res.status(422).json({
    error: message || /* istanbul ignore next */ "Invalid"
  });
};

var internalError = function(res) {
  return res.status(500).json({
    error: "Something went wrong"
  });
}

var handleError = function(res, err) {
  /* istanbul ignore if */
  if (config.environment !== "test") {
    if (typeof err === "string") {
      console.log(err);
    } else {
      console.log(err.toString());
    }
  }
  if (err instanceof errors.NotFound) return notFound(res, err.toString());
  if (err instanceof errors.ModelInvalid) return invalid(res, err.toString());
  if (err instanceof errors.Unauthorized) return unauthorized(res, err.toString());
  return internalError(res);
};

// user creation and authentication
router.post("/session", jsonParser, function(req, res) {
  if (!req.body) return unauthorized(res);
  models.User.login(req.body.email, req.body.password).then(function(user) {
    return res.status(201).json(user.renderToken());
  }).catch(handleError.bind(this, res));
});

router.delete("/session", middleware.authenticate(), function(req, res) {
  req.user.logout().then(function(user) {
    return res.status(202).send({});
  }).catch(handleError.bind(this, res));
});

router.get("/profile", middleware.authenticate(), function(req, res) {
  return res.status(200).json(req.user.renderToken());
});

router.get("/users", function(req, res) {
  models.User.find({}).then(function(users) {
    return res.status(200).json(_.map(users, function(user) {
      return user.renderJson();
    }));
  }).catch(handleError.bind(this, res));
});

router.get("/users/:id", function(req, res) {
  models.User.findById(req.params.id).then(function(user) {
    if (!user) return notFound(res);
    return res.status(200).json(user.renderJson());
  }).catch(handleError.bind(this, res));
});

router.get("/confirm/:token", function(req, res) {
  models.User.confirm(req.params.token).then(function(user) {
    return res.redirect('/login?confirmed=true');
  }).catch(handleError.bind(this, res));
});

router.post("/confirm/resend", middleware.authenticate(false), function(req, res) {
  req.user.sendConfirmation().then(function() {
    return res.status(201).json({
      message: "Confirmation message sent to: " + req.user.email
    });
  }).catch(handleError.bind(this, res));
});

router.post("/signup", jsonParser, function(req, res) {
  if (!req.body) return invalid(res);
  models.User.signup(req.body.username, req.body.name, req.body.email, req.body.password, req.body.confirmation).then(function(user) {
    return res.status(201).json({
      message: "Confirmation message sent to: " + user.email
    });
  }).catch(handleError.bind(this, res));
});

// venues
router.get('/find/:location', function(req, res) {
  models.Venue.forLocation(req.params.location).then(function(venues) {
    return res.status(200).json(_.map(venues, function(venue) {
      return venue.renderJson();
    }));
  }).catch(handleError.bind(this, res));
});

router.post('/venues/:id', middleware.authenticate(true), function(req, res) {
  req.user.attend(req.params.id).then(function() {
    return res.status(201).json({});
  }).catch(handleError.bind(this, res));
});

router.delete('/venues/:id', middleware.authenticate(true), function(req, res) {
  req.user.removeAttend(req.params.id).then(function() {
    return res.status(202).json({});
  }).catch(handleError.bind(this, res));
});

server.on('request', app);
module.exports = server.listen(config.port, function() {
  /* istanbul ignore if */
  if (config.environment !== 'test') console.log('Night app listening on port ' + config.port + '!');
});

socket.createSocket(server);
