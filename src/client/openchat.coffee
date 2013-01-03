#在线聊天主文件

  
    
angular.module('openchat', []).controller('basic', ( $scope ) ->
#  $scope.current_user = {name:'jason'+Math.random(10)};
  $scope.current_user = {name:'jason'};
  $scope.message = {};
    
  
  
  $scope.connect = () ->
    if $scope.socket? 
      $scope.socket.socket.connect() unless $scope.socket.socket.connected;
    else
      url = "http://localhost:8000"
      $scope.socket = io.connect url;
      console.log('begin connect', io)
      $scope.socket.on 'connect', ()-> 
        console.log $scope.socket;
        $scope.socket.emit "set_current_user", $scope.current_user ;

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
    $scope.socket.disconnect();
    
  $scope.send_message = () ->
    console.log( $scope.message );
    $scope.socket.emit "send_message", $scope.message ;
  
  window.onclose = () ->
    $scope.socket.disconnect();
    delete $scope.socket;
    
  
#  $scope.connect();
  return;
)
