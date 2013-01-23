/* using ajax
*/

/*
  Need oauth.js to generate user session first, need req.session.user.openchatId 
  to identify user.
  Need page.js to locate user page.
*/

var Page, async, chat, user_page_ref, users, _,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

Page = require('./page.js');

async = require('async');

users = {};

user_page_ref = {};

chat = {
  connect: function(req, res) {
    var root;
    root = this;
    if (!req.session.user) {
      return res.jsonp(501, {
        message: 'login first.'
      });
    }
    return Page.set_session(req, function() {
      var connectId;
      connectId = root._keep_user(req);
      root._connect_events(req);
      console.log("user " + connectId + " connected");
      return res.jsonp(200, {
        message: 'hello',
        connectId: connectId
      });
    });
  },
  _keep_user: function(req) {
    var connectId, root, _name, _ref;
    root = this;
    if ((_ref = users[_name = req.session.user.openchatId]) == null) {
      users[_name] = _.extend({
        events: []
      }, req.session.user);
    }
    connectId = (req.query.connectId != null) || root._generate_id();
    users[req.session.user.openchatId].connectId = connectId;
    users[req.session.user.openchatId].lastLogin = root._now();
    return connectId;
  },
  _connect_events: function(req) {
    var _name, _ref;
    if ((_ref = user_page_ref[_name = req.session.page.id]) == null) {
      user_page_ref[_name] = {};
    }
    user_page_ref[req.session.page.id][req.session.user.openchatId] = users[req.session.user.openchatId];
    console.log('notify_page_user', req.session.page.id, user_page_ref[req.session.page.id].length);
    return this._notify_page_user('update_users', this._output_page_users(req.session.page.id), req.session.page.id);
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
  _notify_page_user: function(event, data, pageId) {
    var openchatId, user, _ref, _results;
    _ref = user_page_ref[pageId];
    _results = [];
    for (openchatId in _ref) {
      user = _ref[openchatId];
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
          avatar: user.avatar
        });
      }
      return _results;
    })();
    return output;
  },
  _output_page_users: function(pageId) {
    var openchatId, output, user;
    output = (function() {
      var _ref, _results;
      _ref = user_page_ref[pageId];
      _results = [];
      for (openchatId in _ref) {
        user = _ref[openchatId];
        _results.push({
          name: user.name,
          openchatId: user.openchatId,
          avatar: user.avatar
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
      return this._disconnect_event(req);
    }
  },
  _disconnect_event: function(req) {
    delete users_page_ref[req.session.page.id][req.session.user.openchatId];
    return this._notify_page_user('update_users', this._output_page_users(req.session.page.id), req.session.page.id);
  },
  _generate_id: function(collection) {
    return this._now();
  },
  _now: function() {
    return Date.parse(new Date);
  },
  _callbacks: {},
  on: function(event, callback, context) {
    var _base, _ref;
    if ((_ref = (_base = this._callback)[event]) == null) {
      _base[event] = [];
    }
    if (context == null) {
      context = callback;
    }
    return this._callback[event].push({
      callback: callback,
      context: context
    });
  },
  fire: function(event, data) {
    var callback, _i, _len, _results;
    if (this._callback[event] != null) {
      _results = [];
      for (_i = 0, _len = event.length; _i < _len; _i++) {
        callback = event[_i];
        _results.push(callback.callback.call(callback.context, data));
      }
      return _results;
    }
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
