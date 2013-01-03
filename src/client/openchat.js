
angular.module('openchat', []).controller('basic', function($scope) {
  $scope.current_user = {
    name: 'jason'
  };
  $scope.message = {};
  $scope.connect = function() {
    var url;
    if ($scope.socket != null) {
      if (!$scope.socket.socket.connected) {
        return $scope.socket.socket.connect();
      }
    } else {
      url = "http://localhost:8000";
      $scope.socket = io.connect(url);
      console.log('begin connect', io);
      $scope.socket.on('connect', function() {
        console.log($scope.socket);
        return $scope.socket.emit("set_current_user", $scope.current_user);
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
    }
  };
  $scope.disconnect = function() {
    return $scope.socket.disconnect();
  };
  $scope.send_message = function() {
    console.log($scope.message);
    return $scope.socket.emit("send_message", $scope.message);
  };
  window.onclose = function() {
    $scope.socket.disconnect();
    return delete $scope.socket;
  };
});
