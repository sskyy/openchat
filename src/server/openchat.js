/* using socket.io 

io = require 'socket.io'

data = 
  users : {}
  connections : {}
  
single_socket_event = ( socket, data, io ) ->
  socket.on 'set_current_user', ( user ) ->
    socket.set 'user', user;
    if user.name of data.connections
      console.log 'kick out previous user', user.name;
#      data.connections[user.name].emit('user_conflict');
      data.connections[user.name].disconnect();
      data.connections[user.name] = null;
    data.users[user.name] = user;
    data.connections[user.name] = socket;
    
    io.of('/chat').emit "update_users", data.users;
    
  socket.on 'disconnect',  () -> 
    socket.get('user', ( err, user ) ->
      if user && user.name of data.connections
        if data.connections[user.name] == socket
          delete data.connections[user.name]
        if( (user.name of data.users) && !(user.name of data.connections) )
          delete data.users[user.name];

        io.of('/chat').emit 'update_users', data.users;  
    );
    
  socket.on 'send_message', ( message ) ->
    if message.target of data.connections
      socket.get('user', (err, user)->
        data.connections[message.target].emit( 'get_message', {source:user.name, message:message.message})
      )
    
    
exports.listen = ( server ) ->
  reIO = io.listen(server)
  reIO.of('/chat').on( 'connection', ( socket ) -> 
    single_socket_event( socket, data, io )
  )
  return reIO
*/

/* using ajax
*/

var chat, users, _,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

users = {};

chat = {
  connect: function(req, res) {
    var connectId, root, _name, _ref;
    root = this;
    if (!req.session.user) {
      return res.jsonp(501, {
        message: 'login first.'
      });
    }
    if ((_ref = users[_name = req.session.user.openchatId]) == null) {
      users[_name] = _.extend({
        events: [
          {
            event: 'get_message',
            data: {
              source: {
                platform: 'openchat',
                name: 'server'
              },
              message: 'welcome'
            }
          }
        ],
        connectId: null,
        lastLogin: null
      }, req.session.user);
    }
    connectId = (req.query.connectId != null) || root._generate_id();
    users[req.session.user.openchatId].connectId = connectId;
    users[req.session.user.openchatId].lastLogin = root._now();
    console.log(req.session.user.openchatId, "logged in ");
    root._connect_events(req.session.user.openchatId);
    return res.jsonp(200, {
      message: 'hello',
      connectId: connectId
    });
  },
  _connect_events: function(connectUser) {
    return this._notify_all_user('update_users', this._output_all_users());
  },
  _notify_all_user: function(event, data) {
    var openchatId, user, _results;
    _results = [];
    for (openchatId in users) {
      user = users[openchatId];
      _results.push(user.events.push({
        event: event,
        data: data
      }));
    }
    return _results;
  },
  _output_all_users: function() {
    var openchatId, output, user;
    output = (function() {
      var _results;
      _results = [];
      for (openchatId in users) {
        user = users[openchatId];
        _results.push({
          name: user.name,
          openchatId: user.openchatId,
          avatar:user.avatar
        });
      }
      return _results;
    })();
    return output;
  },
  emit: function(req, res) {
    var root, _ref;
    if (_ref = !req.query.event, __indexOf.call(this, _ref) >= 0) {
      return res.jsonp(404, {});
    }
    if (!(users[req.session.user.openchatId] != null) || !(users[req.session.user.openchatId].connectId === parseInt(req.query.connectId))) {
      return res.jsonp(401, {
        message: 'u have been kicked out.'
      });
    }
    root = this;
    return root[req.query.event](req, res);
  },
  send_message: function(req, res) {
    var data, event;
    data = JSON.parse(req.query.data);
    console.log("sending message to ", data.target.openchatId, data);
    if (!(data.target.openchatId in users) || !users[data.target.openchatId].connectId) {
      return console.log(data.target.openchatId, ' not online, message saved to database. users:');
    }
    event = {
      event: 'get_message',
      data: {
        source: req.session.user,
        message: data.message
      }
    };
    return users[data.target.openchatId].events.push(event);
  },
  recieve: function(req, res) {
    var events, _ref, _ref1;
    if (!(((_ref = users[req.session.user.openchatId]) != null ? _ref.connectId : void 0) === parseInt(req.query.connectId))) {
      console.log(users, (_ref1 = users[req.session.user.openchatId]) != null ? _ref1.connectId : void 0, req.query.connectId);
      return res.jsonp(200, {
        error: 'you have been kicked out'
      });
    }
    events = users[req.session.user.openchatId].events.splice(0);
    return res.jsonp(200, events);
  },
  disconnect: function(req, res) {
    if (parseInt(req.query.connectId) === users[req.session.user.openchatId].connectId) {
      console.log(req.session.user.openchatId, " logged out");
      delete users[req.session.user.openchatId];
      return this._notify_all_user('update_users', this._output_all_users());
    }
  },
  _generate_id: function(collection) {
    return this._now();
  },
  _now: function() {
    return Date.parse(new Date);
  }
};

exports.listen = function(server) {
  console.log("a");
  return server.get('/chat/:event', function(req, res) {
    var _ref;
    if ((_ref = !req.params.event, __indexOf.call(chat, _ref) >= 0)) {
      return res.send(404, {});
    }
    return chat[req.route.params.event](req, res);
  });
};
