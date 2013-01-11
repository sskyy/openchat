
#file:events.coffee     
angular.module('openchat').controller('user_list', ( $scope, $connect, $user, $chat ) ->
  $scope.users = [];
  $scope.userSelected = {};
      
  $connect.on 'connect', () ->
    console.log( 'controller-user_list bind events' )
    $scope.current_user = $user.get_current()
    console.log( $connect.times )
    bind_events( $connect ) if $connect.times == 1
  
  
  bind_events = ( $connect )->
    $connect.on "update_users", (users) -> 
      $scope.users = users ;
      console.log( $scope.users );
      
  $scope.set_target = ( user )->
    $chat.set_target( user )
    $scope.userSelected={}
    $scope.userSelected[user.openchatId] = user
      
  return;
)







