var hat = require('hat');
var WebSocketServer = require('websocket').server;
var _ = require('underscore');

var config = require('./config');

var websocket;
var connections = {};
var socketOriginAllowed = function(origin) {
  return origin === config.baseUrl;
};

module.exports = {
  updateVenue: function(venue) {
    if (!websocket) return;
    for (var key in connections) {
      connections[key].sendUTF(JSON.stringify({
        type: 'update',
        venue
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
      });
    });
  }
}
