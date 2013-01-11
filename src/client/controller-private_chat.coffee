

#file:events.coffee     
angular.module('openchat').controller('private_chat', ( $scope, $connect, $user, $chat ) ->
  $scope.current_user = {};
  $scope.conversations = {}
      
  conversation_init = ( user )->
    if not $scope.conversations[ user.openchatId]? 
      $scope.conversations[user.openchatId] = angular.copy user 
      $scope.conversations[user.openchatId].messages = []
    
  conversation_push = ( message, target )->
    target ?= message.source
    if not $scope.conversations[ target.openchatId]? 
      conversation_init( target )
    $scope.conversations[ target.openchatId].messages.push( message )    
    
  $connect.on 'connect', () ->
    $scope.current_user = $user.get_current()
    console.log( 'controller-private_chat bind events, current user', $scope.current_user );
    $chat.set_connect( $connect );
    $chat.on( "set_target", conversation_init );
    bind_events( $connect ) if $connect.times == 1
  
  bind_events = ( $connect )->
    $connect.on "update_users", (users) -> 
      $scope.users = users 
      console.log( $scope.users );
      
    $connect.on 'disconnect', () ->
      $scope.recieve_message ={source:'server',message:'disconnect'};
      $scope.$digest();

    $connect.on 'get_message', ( message ) ->
      conversation_push( message ) if message ;
  
  $scope.send_message = ( message, user )->
    if not message 
      return alert('can not send empty message')
    if user
      $chat.set_target( user )
    console.log( message, user );
    $chat.set_message( message ).send();
    
    target = $chat.get_target();
    conversation_push( {source:$scope.current_user,message:message}, target )
  
  return;
)


