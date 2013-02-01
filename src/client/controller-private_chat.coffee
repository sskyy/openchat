

#file:events.coffee     
angular.module('openchat').controller('private_chat', ( $scope, $connect, $user, $chat ) ->
  $scope.current_user = {};
  $scope.conversations = {};
  $scope.current_conversation = {};
  $scope.chat_window_status = {mode:'shortcut'}
      
  conversation_init = ( user )->
    if not $scope.conversations[ user.openchatId]? 
      conversation = angular.extend({}, angular.copy(user), {messages:[]}) 
      $scope.conversations[user.openchatId] = conversation 
    return $scope.conversations[user.openchatId]
    
  conversation_push = ( message, target )->
    target ?= message.source
    if not $scope.conversations[ target.openchatId]? 
      conversation_init( target )
    $scope.conversations[ target.openchatId].messages.push( message )  
    if( $scope.chat_window_status.mode == 'shortcut' || $scope.current_conversation.openchatId != target.openchatId )
      $scope.conversations[ target.openchatId].unread = true  
    
  set_current_conversation = ( conversation, open_window ) ->
    $scope.current_conversation = conversation
    console.log( 'set current conversation', conversation )
    if( open_window ) 
      $scope.chat_window_status.mode = 'full'
      conversation.unread = false
    
    console.log('set current conversation', conversation )
    
  in_array = ( needle, stack, id )->
    isFound = false
    for item in stack
      target = (id?&&item[id])||item
      if needle == target
        isFound = true
        break
    isFound;
    
  $connect.on 'connect', () ->
    $scope.current_user = $user.get_current()
    console.log( 'controller-private_chat bind events, current user', $scope.current_user );
    $chat.set_connect( $connect );
    $chat.on( "set_target", (user) -> 
      conversation = conversation_init( user )
      set_current_conversation( conversation, true )
    );
    bind_events( $connect ) if $connect.times == 1
  
  
  bind_events = ( $connect )->
    $connect.on "update_users", (users) -> 
      $scope.users = users 
      for openchatId,user of $scope.conversations 
        if( !in_array( openchatId, users, 'openchatId') )
          console.log( 'found user', openchatId,'disconnect' )
          user.disconnected = true
      console.log( "update_users", $scope.users );
      
    $connect.on 'disconnect', () ->
      $scope.current_user = {};
      $scope.conversations = {};
      $scope.current_conversation = {};
      $scope.chat_window_status = {mode:'shortcut'}

    $connect.on 'get_message', ( message ) ->
      conversation_push( message ) if message ;
  
  $scope.send_message = ( message, user )->
    if not message 
      return alert('can not send empty message')
      
    if user
      $chat.set_target( user )
    else
      $chat.set_target( $scope.current_conversation )
    $chat.set_message( message ).send();
    console.log('sending message', message, user )
    target = $chat.get_target();
    conversation_push( {source:$scope.current_user,message:message}, target )
    
  $scope.set_current_conversation = set_current_conversation
  
  $scope.object_length = ( object ) ->
    length = 0
    ++length for i of object
#    console.log( "object_length", length )
    return length
  
  return;
)


