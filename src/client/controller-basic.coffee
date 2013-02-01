
#file:events.coffee     
angular.module('openchat').controller('basic', ( $scope, $connect, $user ) ->
  $scope.current_user = {};
  $scope.message = {};
  $scope.recieve_messages = [];
  $scope.user_detecting = false;
  
  $scope.login = ( auto_connect= true ) -> 
    if $user.get_current()?.name?
      console.log( $user.get_current(),"already logged in, this is second")
      $connect.connect() if auto_connect 
    else
      console.log( "this is first connect")
      $scope.user_detecting = true;
      $user.user_detect().then( ( user )->
        console.log( "user detect done", user )
        $scope.current_user = user;
        $connect.connect();
        $scope.user_detecting = false;
      ,()->
        alert('login faile, please try it later')
        $scope.user_detecting = false;
      )
    
  $scope.connect = () ->
    return if $connect.connected
    $connect.connect();
  
  $scope.logout = ( auto_disconnect = true) ->
    $scope.disconnect()
    $user.logout()
   
    
  $scope.has_connected = () ->
    return $user.get_current()?.name?

      
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

