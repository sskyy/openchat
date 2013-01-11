
#file:events.coffee     
angular.module('openchat').controller('basic', ( $scope, $connect, $user ) ->
  $scope.current_user = {};
  $scope.message = {};
  $scope.recieve_messages = []
  
  $scope.connect = () ->
    return if $connect.connected
    if $user.get_current()?.name?
      console.log( $user.get_current(),"already connected once, this is second")
      $connect = $connect.connect();
    else
      console.log( $scope.current_user,"this is first connect")
      $user.user_detect().then( (user)->
        $scope.current_user = user;
        $connect = $connect.connect();
      )
      
  $scope.disconnect = () ->
    $connect.disconnect();
    
  $scope.is_connected = () ->
    return $connect.connected;
    
  $scope.user_detect = () ->
    $user.user_detect().then( (user)->
      $scope.current_user = user;
    );
  
  window.onclose = () ->
    $connect.disconnect();
  
  return;
)

