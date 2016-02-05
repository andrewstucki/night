var hat = require('hat');
var WebSocketServer = require('websocket').server;
var _ = require('underscore');

var config = require('./config');

var websocket;
var subscriptions = {};
var connections = {};
var socketOriginAllowed = function(origin) {
  return origin === config.baseUrl;
};

module.exports = {
  updateVenue: function(venueId, value, count) {
    if (!websocket || !subscriptions[venueId]) return;
    for (var i = 0; i < subscriptions[venueId].length; i++) {
      var id = subscriptions[venueId][i];
      connections[id].sendUTF(JSON.stringify({
        type: 'update',
        id: venueId,
        count
      }));
    }
  },

  createSocket: function(app) {
    if (!!websocket) return;

    websocket = new WebSocketServer({
      httpServer: app,
      fragmentOutgoingMessages: false,
      autoAcceptConnections: false
    });

    websocket.on('request', function(request) {
      if (!socketOriginAllowed(request.origin)) return request.reject();
      var connection = request.accept('night', request.origin);
      var id = hat();
      connections[id] = connection;
      connection.on('close', function() {
        delete connections[id]
        for (var subscription in subscriptions) {
          var index = subscriptions[subscription].indexOf(id);
          if (index > -1) subscriptions[subscription].splice(index, 1);
        }
      });

      connection.on('message', function(message) {
        if (message.type === 'utf8') {
          try {
            var command = JSON.parse(message.utf8Data);

            if (command.type === 'subscribe') {
              subscriptions[command.id] = subscriptions[command.id] || [];
              if (subscriptions[command.id].indexOf(id) === -1) subscriptions[command.id].push(id);
            }
          }
          catch(e) {
            console.log("Unable to parse JSON: " + message.utf8Data);
          }
        }
      });
    });
  }
}
