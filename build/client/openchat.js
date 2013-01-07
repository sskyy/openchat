(function() {

  angular.module('openchat.service', []).service('$connect', function() {
    var $connect, url;
    url = 'jieq1u3u19.elb7.stacklab.org/chat';
    if (typeof io === void 0) {
      console.log("socket.io not exist");
      return {};
    }
    $connect = {};
    $connect.connect = function() {
      return io.connect(url);
    };
    return $connect;
  });

  angular.module('openchat.service').service('$user', function($q) {
    var $user;
    $user = {};
    $user.user_detect = function() {
      var ioOauth, q;
      q = $q.defer();
      console.log('jieq1u3u19.elb7.stacklab.org/oauth');
      ioOauth = io.connect('jieq1u3u19.elb7.stacklab.org/oauth');
      ioOauth.on('connect', function(socket) {
        ioOauth.emit('apply_oauth_id');
        return console.log('apply_oauth_id');
      });
      ioOauth.on('oauth_id', function(oauth_id) {
        var param, url;
        console.log(oauth_id);
        url = 'https://api.weibo.com/oauth2/authorize';
        param = ['?client_id=3312201828', 'redirect_uri=jieq1u3u19.elb7.stacklab.org/oauth/callback', 'state=' + oauth_id].join('&');
        return window.open(url + param);
      });
      ioOauth.on('access_token', function(access_token) {
        alert(access_token);
        return q.resolve(access_token);
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

  angular.module('openchat', ['openchat.service']).controller('basic', function($scope, $connect, $user) {
    var bind_events, socket;
    $scope.current_user = {
      name: 'jason'
    };
    $scope.message = {};
    socket = null;
    $scope.connect = function(){
      if (socket != null) {
        if (!socket.socket.connected) {
          return socket.socket.connect();
        }
      } else {
        socket = $connect.connect();
        return bind_events(socket);
      }
    };
    bind_events = function(socket) {
      socket.on('connect', function() {
        return console.log('connected');
      });
      $scope.socket.on("update_users", function(users) {
        $scope.users = users;
        $scope.$digest();
        return console.log($scope.users);
      });
      $scope.socket.on('disconnect', function() {
        $scope.recieve_message = {
          source: 'server',
          message: 'disconnect'
        };
        return $scope.$digest();
      });
      return $scope.socket.on('get_message', function(message) {
        $scope.recieve_message = message;
        return $scope.$digest();
      });
    };
    $scope.disconnect = function() {
      return socket.disconnect();
    };
    $scope.is_connected = function() {
      return socket.socket.connected;
    };
    $scope.send_message = function() {
      return socket.emit("send_message", $scope.message);
    };
    $scope.user_detect = function() {
      return $user.user_detect().then(function(user) {
        $scope.current_user = user;
        return $scope.$digest();
      });
    };
    window.onclose = function() {
      return socket.disconnect();
    };
  });

}).call(this);
