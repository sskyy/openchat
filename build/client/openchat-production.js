(function() {

  window._OPENCHAT_BUILD = '1358657924000';

  angular.module('openchat.service', []);

  angular.module('openchat', ['openchat.service']);

  /* service connect. using socket.io
  */


  /* service connect. using ajax
  */


  angular.module('openchat.service').service('$connect', function($http, $window, $q) {
    var $connect;
    $connect = {
      _events: {},
      _connectId: null,
      url: 'http://jieq1u3u19.elb7.stacklab.org:80/chat',
      interval: 1000,
      heartbeat: null,
      connected: false,
      failures: 0,
      failuresLimit: 20,
      times: 0,
      connect: function() {
        var params, root;
        root = this;
        console.log("is connected?", root.connected);
        if (root.connected) {
          return this;
        }
        params = {
          callback: 'JSON_CALLBACK'
        };
        $http.jsonp("" + this.url + "/connect", {
          params: params
        }).success(function(res) {
          root.heartbeat = $window.setInterval(function() {
            return root._recieve();
          }, root.interval);
          root.connected = true;
          root.connectId = res.connectId;
          if ('connect' in root._events) {
            return root._call_callbacks('connect');
          }
        });
        root.times++;
        return root;
      },
      disconnect: function(silent) {
        var root;
        root = this;
        $window.clearInterval(this.heartbeat);
        root.connected = false;
        if (!silent) {
          return $http.jsonp("" + this.url + "/emit", {
            params: {
              connectId: root.connectId,
              'event': 'disconnect'
            }
          });
        }
      },
      emit: function(event, data) {
        var params, root;
        if (!this.connected) {
          return false;
        }
        root = this;
        params = {
          event: event,
          data: data,
          connectId: root.connectId,
          callback: 'JSON_CALLBACK'
        };
        return $http.jsonp("" + this.url + "/emit", {
          params: params
        });
      },
      on: function(event, callback, context) {
        var root;
        root = this;
        if (context == null) {
          context = callback;
        }
        if (!(event in root._events)) {
          root._events[event] = [];
        }
        return root._events[event].push({
          callback: callback,
          context: context
        });
      },
      _recieve: function() {
        var params, root;
        if (!this.connected) {
          return false;
        }
        if (this.failures > this.failuresLimit) {
          this.disconnect();
        }
        root = this;
        params = {
          callback: 'JSON_CALLBACK',
          connectId: root.connectId,
          t: Date.parse(new Date())
        };
        return $http.jsonp("" + this.url + "/recieve", {
          params: params
        }).then(function(res) {
          var event, _i, _len, _ref, _results;
          if ("error" in res.data) {
            return root.disconnect(true);
          }
          root.failures = 0;
          _ref = res.data;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            event = _ref[_i];
            _results.push(root._call_callbacks(event.event, event.data));
          }
          return _results;
        }, function(res) {
          if (res.status === 502) {
            console.log('server down');
            return root.disconnect(true);
          }
          if (res.status === 401) {
            console.log('u have been kicked out');
            return root.disconnect(true);
          }
          return root.failures++;
        });
      },
      _call_callbacks: function(event, data) {
        var eventItem, root, _i, _len, _ref, _results;
        root = this;
        console.log(event, data);
        if (event in root._events) {
          _ref = root._events[event];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            eventItem = _ref[_i];
            _results.push(eventItem.callback.call(eventItem.context, data));
          }
          return _results;
        }
      }
    };
    return $connect;
  });

  angular.module('openchat.service').service('$user', function($q, $http, $window) {
    var $user, base, get_user_info, user_login;
    base = 'http://jieq1u3u19.elb7.stacklab.org:80';
    $user = {};
    get_user_info = function(oauth_id) {
      return $http.jsonp("" + base + "/oauth/user_info?callback=JSON_CALLBACK&oauth_id=" + oauth_id);
    };
    user_login = function() {
      var oauth_id, q;
      q = $q.defer();
      oauth_id = null;
      $http.jsonp("" + base + "/oauth/apply_oauth_id?callback=JSON_CALLBACK").success(function(data) {
        var interval, interval_limit, param, url;
        oauth_id = data.oauth_id;
        console.log(oauth_id);
        url = 'https://api.weibo.com/oauth2/authorize';
        param = ['?client_id=3312201828', 'redirect_uri=jieq1u3u19.elb7.stacklab.org/oauth/callback', 'state=weibo:' + oauth_id].join('&');
        window.open(url + param);
        interval_limit = 100;
        return interval = $window.setInterval(function() {
          if (!interval_limit) {
            $window.clearInterval(interval);
            return q.reject();
          }
          return get_user_info(oauth_id).then(function(user) {
            $window.clearInterval(interval);
            return q.resolve(user);
          }, function() {
            return interval_limit--;
          });
        }, 1000);
      }).error(function(err) {
        console.log('apply_oauth_id err', err);
        return q.reject();
      });
      return q.promise;
    };
    $user.user_detect = function(platform) {
      var q;
      q = $q.defer();
      get_user_info().success(function(user) {
        $user.user = user;
        return q.resolve(user);
      }).error(function() {
        console.log('get_user_info failed');
        return user_login().then(function(user) {
          $user.user = user;
          return q.resolve(user);
        });
      });
      return q.promise;
    };
    $user.get_current = function() {
      console.log("current_user", ($user.user != null) && $user.user || null);
      return ($user.user != null) && $user.user || null;
    };
    return $user;
  });

  angular.module('openchat.service').service('$chat', function() {
    var $chat;
    $chat = {
      _callback: {},
      set_connect: function(connect) {
        this.connect = connect;
        return this;
      },
      set_target: function(target) {
        this.target = angular.copy(target);
        delete this.target.messages;
        return this._invoke_callback('set_target', this.target);
      },
      set_message: function(message) {
        this.message = message;
        console.log(this.target);
        return this;
      },
      get_target: function() {
        return this.target;
      },
      get_message: function() {
        return this.message;
      },
      send: function() {
        var _ref;
        if (!((_ref = this.connect) != null ? _ref.connected : void 0)) {
          return console.log('I have no connection to use');
        }
        if (!(this.target && this.message)) {
          return console.log('target or message not set', this.target, this.message);
        }
        console.log('sending message to:', this.target);
        return this.connect.emit('send_message', {
          target: this.target,
          message: this.message
        });
      },
      on: function(event, fn, context) {
        var _base, _ref;
        if (!event in this) {
          return false;
        }
        if ((_ref = (_base = this._callback)[event]) == null) {
          _base[event] = [];
        }
        if (context == null) {
          context = fn;
        }
        this._callback[event].push({
          fn: fn,
          context: context
        });
        return this;
      },
      _invoke_callback: function(event, data) {
        var callback, _i, _len, _ref;
        console.log('call chat callback', event, data);
        if (this._callback[event] != null) {
          _ref = this._callback[event];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            callback = _ref[_i];
            callback.fn.call(callback.context, data);
          }
        }
        return this;
      }
    };
    return $chat;
  });

  angular.module('openchat.service').service('$page_feature', function() {
    var $page_feature;
    $page_feature = {};
    return $page_feature;
  });

  angular.module('openchat').controller('basic', function($scope, $connect, $user, $page_feature) {
    $scope.current_user = {};
    $scope.message = {};
    $scope.recieve_messages = [];
    $scope.connect = function() {
      var _ref;
      if ($connect.connected) {
        return;
      }
      if (((_ref = $user.get_current()) != null ? _ref.name : void 0) != null) {
        console.log($user.get_current(), "already connected once, this is second");
        return $connect.connect();
      } else {
        console.log($scope.current_user, "this is first connect");
        return $user.user_detect().then(function(user) {
          $scope.current_user = user;
          return $connect.connect();
        });
      }
    };
    $scope.disconnect = function() {
      return $connect.disconnect();
    };
    $scope.is_connected = function() {
      return $connect.connected;
    };
    $scope.user_detect = function() {
      return $user.user_detect().then(function(user) {
        return $scope.current_user = user;
      });
    };
    window.onclose = function() {
      return $connect.disconnect();
    };
  });

  angular.module('openchat').controller('private_chat', function($scope, $connect, $user, $chat) {
    var bind_events, conversation_init, conversation_push;
    $scope.current_user = {};
    $scope.conversations = {};
    $scope.current_conversation = {};
    $scope.chat_window_status = {
      mode: 'full'
    };
    conversation_init = function(user) {
      var conversation;
      if (!($scope.conversations[user.openchatId] != null)) {
        conversation = angular.extend({}, angular.copy(user), {
          messages: []
        });
        $scope.conversations[user.openchatId] = conversation;
        return $scope.current_conversation = conversation;
      } else {
        return $scope.current_conversation = angular.copy($scope.conversations[user.openchatId]);
      }
    };
    conversation_push = function(message, target) {
      if (target == null) {
        target = message.source;
      }
      if (!($scope.conversations[target.openchatId] != null)) {
        conversation_init(target);
      }
      $scope.conversations[target.openchatId].messages.push(message);
      $scope.current_conversation = angular.copy($scope.conversations[target.openchatId]);
      return console.log($scope.current_conversation);
    };
    $connect.on('connect', function() {
      $scope.current_user = $user.get_current();
      console.log('controller-private_chat bind events, current user', $scope.current_user);
      $chat.set_connect($connect);
      $chat.on("set_target", conversation_init);
      if ($connect.times === 1) {
        return bind_events($connect);
      }
    });
    bind_events = function($connect) {
      $connect.on("update_users", function(users) {
        $scope.users = users;
        return console.log("update_users", $scope.users);
      });
      $connect.on('disconnect', function() {
        return $scope.recieve_message = {
          source: 'server',
          message: 'disconnect'
        };
      });
      return $connect.on('get_message', function(message) {
        if (message) {
          return conversation_push(message);
        }
      });
    };
    $scope.send_message = function(message, user) {
      var target;
      if (!message) {
        return alert('can not send empty message');
      }
      if (user) {
        $chat.set_target(user);
      } else {
        $chat.set_target($scope.current_conversation);
      }
      $chat.set_message(message).send();
      console.log('sending message', message, user);
      target = $chat.get_target();
      return conversation_push({
        source: $scope.current_user,
        message: message
      }, target);
    };
    $scope.set_current_conversation = function(conversation) {
      $scope.current_conversation = angular.copy(conversation);
      return console.log('set current conversation', conversation);
    };
    $scope.object_length = function(object) {
      var i, length;
      length = 0;
      for (i in object) {
        ++length;
      }
      console.log("object_length", length);
      return length;
    };
  });

  angular.module('openchat').controller('public_chat', function($scope, $connect, $user) {});

  angular.module('openchat').controller('user_list', function($scope, $connect, $user, $chat) {
    var bind_events;
    $scope.users = [];
    $scope.userSelected = {};
    $connect.on('connect', function() {
      console.log('controller-user_list bind events');
      $scope.current_user = $user.get_current();
      if ($connect.times === 1) {
        return bind_events($connect);
      }
    });
    bind_events = function($connect) {
      return $connect.on("update_users", function(users) {
        $scope.users = users;
        return console.log("update_users", users);
      });
    };
    $scope.set_target = function(user) {
      $chat.set_target(user);
      $scope.userSelected = {};
      return $scope.userSelected[user.openchatId] = user;
    };
  });

}).call(this);
