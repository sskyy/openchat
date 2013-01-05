
#require:connect.coffee,user.coffee,page_feature.coffee

#file:events.coffee     

angular.module('openchat', ['openchat.service','openchat.user',]).controller('basic', ( $scope, $connect, $user ) ->
  $scope.current_user = {name:'jason'};
  $scope.message = {};
  socket = null;  
  
  $scope.connect = () ->
    if socket? 
      socket.socket.connect() unless socket.socket.connected;
    else
      socket = $connect.connect();
      bind_events( socket );
      
  bind_events = ( socket )->
    socket.on 'connect', ()->
      console.log 'connected'
      $user.auto_detect();
      
    $scope.socket.on "update_users", (users) -> 
      $scope.users = users ;
      $scope.$digest();
      console.log( $scope.users );
      
    $scope.socket.on 'disconnect', () ->
      $scope.recieve_message ={source:'server',message:'disconnect'};
      $scope.$digest();

    $scope.socket.on 'get_message', ( message ) ->
      $scope.recieve_message = message;
      $scope.$digest();
  
  $scope.disconnect = () ->
    socket.disconnect();
    
  $scope.is_connected = () ->
    return socket.socket.connected;
    
  $scope.send_message = () ->
    socket.emit "send_message", $scope.message ;
  
  window.onclose = () ->
    socket.disconnect();
  
  return;
)
