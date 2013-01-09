(function() {

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
      url: '/chat',
      interval: 1000,
      heartbeat: null,
      connected: false,
      failures: 0,
      failuresLimit: 20,
      times: 0,
      connect: function() {
        var params, root;
        root = this;
        console.log(root.connected);
        if (root.connected) {
          return this;
        }
        params = {
          callback: 'JSON_CALLBACK'
        };
        $http.jsonp(this.url + '/connect', {
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
      disconnect: function() {
        var root;
        root = this;
        $window.clearInterval(this.heartbeat);
        return root.connected = false;
      },
      emit: function(event, data) {
        var params, root;
        root = this;
        params = {
          event: event,
          data: data,
          connectId: root.connectId,
          callback: 'JSON_CALLBACK'
        };
        return $http.jsonp(this.url + '/emit', {
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
          connectId: root.connectId
        };
        return $http.jsonp(this.url + '/recieve', {
          params: params
        }).success(function(res) {
          if ("error" in res) {
            return root.disconnect();
          }
          root.failures = 0;
          return root._call_callbacks(res.event, res.data);
        }).error(function(res) {
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
    var $user;
    $user = {};
    $user.user_detect = function(platform) {
      var get_access_token_interval, get_user_name, oauth_id, q;
      q = $q.defer();
      oauth_id = null;
      get_user_name = function(uid, access_token) {
        var params, url;
        url = 'https://api.weibo.com/2/users/show.json';
        params = {
          uid: uid,
          access_token: access_token
        };
        return $http.jsonp(url, {
          params: params
        }).success(function(user) {
          return q.resolve(user);
        }).error(function() {
          return q.reject();
        });
      };
      get_access_token_interval = function(oauth_id) {
        var interval, interval_limit;
        if (!oauth_id) {
          return;
        }
        interval_limit = 50;
        return interval = $window.setInterval(function() {
          if (!interval_limit--) {
            $window.clearInterval(interval);
          }
          return $http.jsonp("/oauth/access_token?oauth_id=" + oauth_id + "&callback=JSON_CALLBACK").success(function(data) {
            console.log(data);
            $window.clearInterval(interval);
            return get_user_name(data.uid, data.access_token);
          });
        }, 1000);
      };
      $http.jsonp('/oauth/apply_oauth_id?callback=JSON_CALLBACK').success(function(data) {
        var param, url;
        oauth_id = data.oauth_id;
        console.log(oauth_id);
        url = 'https://api.weibo.com/oauth2/authorize';
        param = ['?client_id=3312201828', 'redirect_uri=jieq1u3u19.elb7.stacklab.org/oauth/callback', 'state=weibo:' + oauth_id].join('&');
        window.open(url + param);
        return get_access_token_interval(oauth_id);
      }).error(function(err) {
        return console.log('apply_oauth_id err', err);
      });
      return q.promise;
    };
    return $user;
  });

  angular.module('openchat.service').service('$page_feature', function() {
    var $page_feature;
    $page_feature = {};
    return $page_feature;
  });

  angular.module('openchat').controller('basic', function($scope, $connect, $user) {
    var bind_events;
    $scope.current_user = {};
    $scope.message = {};
    $scope.recieve_messages = [];
    $scope.connect = function() {
      if ($connect.connected) {
        return;
      }
      console.log($connect.connected);
      $connect = $connect.connect();
      if ($connect.times === 1) {
        return bind_events($connect);
      }
    };
    bind_events = function($connect) {
      $connect.on('connect', function() {
        return console.log('connected');
      });
      $connect.on("update_users", function(users) {
        $scope.users = users;
        $scope.$digest();
        return console.log($scope.users);
      });
      $connect.on('disconnect', function() {
        $scope.recieve_message = {
          source: 'server',
          message: 'disconnect'
        };
        return $scope.$digest();
      });
      return $connect.on('get_message', function(message) {
        if (message.length) {
          $scope.recieve_messages = $scope.recieve_messages.concat(message);
        }
        return console.log(message, $scope.recieve_messages);
      });
    };
    $scope.disconnect = function() {
      return $connect.disconnect();
    };
    $scope.is_connected = function() {
      return $connect.connected;
    };
    $scope.send_message = function() {
      return $connect.emit("send_message", $scope.message);
    };
    $scope.user_detect = function() {
      return $user.user_detect().then(function(user) {
        $scope.current_user = user;
        return $scope.$digest();
      });
    };
    window.onclose = function() {
      return $connect.disconnect();
    };
  });

}).call(this);
