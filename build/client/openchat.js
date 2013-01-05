(function() {

  angular.module('openchat.service', []).service('$connect', function() {
    var $connect, url;
    url = 'jieq1u3u19.elb7.stacklab.org';
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

  angular.module('openchat.service').service('$user', function() {
    var $user;
    $user = {};
    $user.auto_detect = function() {
      return console.log('auto detect user');
    };
    return $user;
  });

  angular.module('openchat.service').service('$page_feature', function() {
    var $page_feature;
    $page_feature = {};
    return $page_feature;
  });

  angular.module('openchat', ['openchat.service', 'openchat.user']).controller('basic', function($scope, $connect, $user) {
    var bind_events, socket;
    $scope.current_user = {
      name: 'jason'
    };
    $scope.message = {};
    socket = null;
    $scope.connect = function() {
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
        console.log('connected');
        return $user.auto_detect();
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
    window.onclose = function() {
      return socket.disconnect();
    };
  });

}).call(this);
