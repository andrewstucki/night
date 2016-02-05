var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var promise = require('promise');
var hat = require('hat');
var _ = require('underscore');
var md5 = require('md5');

var config = require("./config");
var errors = require("./errors");
var queue = require("./queue");
var socket = require("./socket");

// initialize mongo
mongoose.Promise = promise;
mongoose.connect(config.db);

// Users
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false,
    require: true
  },
  confirmationToken: String,
  sessionToken: String,
  gravatarUrl: String
});


var userValidators = {
  email: function(email) {
    return {
      valid: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email),
      message: "Invalid email address."
    }
  },
  username: function(username) {
    return {
      valid: /^[A-Za-z0-9]{5,15}$/.test(username),
      message: "Username must be between 5 and 15 characters and may only contain lower case letters, upper case letters, and numbers."
    }
  },
  password: function(password) {
    return {
      valid: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password),
      message: "Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one number."
    }
  },
  confirmation: function(confirmation, password) {
    return {
     valid: confirmation !== '' && password === confirmation,
     message: "Confirmation must not be empty and must match password."
    }
  }
};

var userValidation = function(fields) {
  var usernameValidation;
  var emailValidation;
  var passwordValidation;
  var confirmationValidation;

  if (fields.username) usernameValidation = userValidators.username(fields.username);
  if (fields.email) emailValidation = userValidators.email(fields.email);
  if (fields.password) passwordValidation = userValidators.password(fields.password);
  if (fields.confirmation && fields.password) confirmationValidation = userValidators.confirmation(fields.password, fields.confirmation);

  var errors = []
  if (usernameValidation && !usernameValidation.valid) errors.push(usernameValidation.message);
  if (emailValidation && !emailValidation.valid) errors.push(emailValidation.message);
  if (passwordValidation && !passwordValidation.valid) errors.push(passwordValidation.message);
  if (confirmationValidation && !confirmationValidation.valid) errors.push(confirmationValidation.message);

  return errors;
};

userSchema.statics.signup = function(username, name, email, password, confirmation, skipEmail) {
  var schema = this;
  return new promise(function(resolve, reject) {
    var validationErrors = userValidation({username, email, password, confirmation});
    if (validationErrors.length !== 0) return reject(new errors.ModelInvalid(validationErrors.join("; ")));
    var params = {
      username: username,
      email: email,
      password: password,
      confirmed: !!skipEmail
    };
    if (name) params.name = name;
    var user = new schema(params);
    user.save().then(function(user) {
      socket.addRecord(user.renderJson(), 'users');
      if (!skipEmail) return user.sendConfirmation().then(resolve.bind(this, user)).catch(reject);
      return resolve(user);
    }).catch(function(err) {
      if (err.code === 11000) {
        if (/email/.test(err.errmsg)) return reject(new errors.ModelInvalid('Email address already taken!'));
        if (/username/.test(err.errmsg)) return reject(new errors.ModelInvalid('Username already taken!'));
      }
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.statics.confirm = function(token) {
  var schema = this;
  return new promise(function(resolve, reject) {
    schema.findOne({
      confirmationToken: token,
      confirmed: false
    }).then(function(user) {
      if (!user) return reject(new errors.NotFound("Token not found"));
      user.confirmed = true;
      user.confirmationToken = undefined;
      return user.save().then(resolve).catch(function(err){
        if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid User"));
        return reject(new errors.DatabaseFailure(err.toString()));
      });
    }).then(function(user) {
      resolve(user);
    });
  });
};

userSchema.statics.login = function(email, password) {
  var schema = this;
  return new promise(function(resolve, reject) {
    schema.findOne({
      email: email
    }).then(function(user) {
      if (!user) return reject(new errors.NotFound("Unable to find user with matching email address"));
      bcrypt.compare(password, user.password, function(err, match) {
        if (err) return reject(new Error("Bcrypt error: " + err.toString()));
        if (!match) return reject(new errors.ModelInvalid("Password Mismatch"));
        user.sessionToken = hat();
        user.save().then(resolve).catch(function(err) {
          if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid User"));
          reject(new errors.DatabaseFailure(err.toString()));
        });
      });
    }).catch(function(err) {
      reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.logout = function() {
  this.sessionToken = undefined;
  return this.save();
};

userSchema.methods.sendConfirmation = function() {
  var user = this;
  return new promise(function(resolve, reject) {
    if (user.confirmed) return reject(new errors.ModelInvalid("User email already confirmed"));
    var job = queue.create('email', {
      user_id: user._id
    }).save(function(err) {
      if (err) return(reject(err));
      return resolve()
    })

    job.on('complete', function(result) {
      console.log('Sent confirmation email to: ' + user.email);
    }).on('failed attempt', function(errorMessage, doneAttempts) {
      console.log('Confirmation attempt ' + doneAttempts + 'for ' + user.email + ', email send failed: ' + errorMessage);
    }).on('failed', function(errorMessage) {
      console.log('Confirmation job permanently failed for ' + user.email + ': ' + errorMessage);
    });
  });
};

userSchema.methods.attend = function(id) {
};

userSchema.methods.removeAttend = function(id) {
};

userSchema.methods.renderToken = function() {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    gravatarUrl: this.gravatarUrl,
    email: this.email,
    token: this.sessionToken
  };
};

userSchema.methods.renderJson = function() {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    gravatarUrl: this.gravatarUrl
  };
};

var User = mongoose.model('User', userSchema);

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.confirmed && !user.confirmationToken)
    user.confirmationToken = hat();
  if (!user.gravatarUrl)
    user.gravatarUrl = "https://gravatar.com/avatar/" + md5(user.email.trim().toLowerCase());
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Venues

var venueValidators = {};

var venueValidation = function(fields) { return [] };
var venueSchema = new mongoose.Schema({
  attendees: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
  name: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  image: {
    type: String
  }
  snippet: {
    type: String
  }
});

venueSchema.methods.renderJson = function() {
  var venue = this;
  var payload = {
    id: venue._id,
    name: venue.name,
    url: venue.url,
    image: venue.image,
    snipped: venue.snippet,
    attendees: venue.attendees.map(function(attendee) { return attendee.username; })
  };
  return payload;
};

var Venue = mongoose.model('Venue', venueSchema);

module.exports = {
  User,
  Venue
};
