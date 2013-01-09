
#file:events.coffee     
angular.module('openchat').controller('basic', ( $scope, $connect, $user ) ->
  $scope.current_user = {};
  $scope.message = {};
  $scope.recieve_messages = []
  
  
  $scope.connect = () ->
    return if $connect.connected
    if $scope.current_user.name?
      console.log( $scope.current_user,"bbb")
      $connect = $connect.connect();
      bind_events( $connect ) if $connect.times == 1;
    else
      console.log( $scope.current_user,"aaa")
      $user.user_detect().then( (user)->
        $scope.current_user = user;
        $connect = $connect.connect();
        bind_events( $connect ) if $connect.times == 1;
      )
      
  bind_events = ( $connect )->
    $connect.on 'connect', ()->
      console.log 'connected'
      
    $connect.on "update_users", (users) -> 
      $scope.users = users ;
      console.log( $scope.users );
      
    $connect.on 'disconnect', () ->
      $scope.recieve_message ={source:'server',message:'disconnect'};
      $scope.$digest();

    $connect.on 'get_message', ( message ) ->
      $scope.recieve_messages = $scope.recieve_messages.concat( [message] ) if message
  
  $scope.disconnect = () ->
    $connect.disconnect();
    
  $scope.is_connected = () ->
    return $connect.connected;
    
  $scope.send_message = () ->
    $connect.emit "send_message", $scope.message ;
    
  $scope.user_detect = () ->
    $user.user_detect().then( (user)->
      $scope.current_user = user;
    );
  
  window.onclose = () ->
    $connect.disconnect();
  
  return;
)

