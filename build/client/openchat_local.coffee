

#service connect. using socket.io 

angular.module('openchat.service',[])
.service('$connect', () ->
  url = '127.0.0.1/chat'
  if( typeof( io) == undefined )
    console.log( "socket.io not exist");
    return {};
  
  $connect = {}
  $connect.connect = () ->
    return io.connect url
    
  return $connect
)




#user main file

angular.module('openchat.service').service('$user', ( $q )->

  $user = {};
  $user.user_detect = () ->
    q = $q.defer()
    console.log( '127.0.0.1/oauth')
    ioOauth = io.connect('127.0.0.1/oauth')
    ioOauth.on('connect', ( socket)->
      ioOauth.emit('apply_oauth_id')
      console.log('apply_oauth_id');
    )
    
    ioOauth.on('oauth_id', ( oauth_id )->
      console.log( oauth_id );
      url = 'https://api.weibo.com/oauth2/authorize';
      param = ['?client_id=3312201828',
        'redirect_uri=127.0.0.1/oauth/callback',
        'state='+oauth_id].join('&')
      window.open( url+param );
    )
    
    ioOauth.on('access_token', ( access_token )->
      console.log( access_token );
      alert( access_token )
      q.resolve( access_token )
    )
    
    return q.promise;
    
  return $user;
  
  
)

#detect page 
angular.module('openchat.service').service('$page_feature',()->
  $page_feature = {};
  return $page_feature;
)


#file:events.coffee     

angular.module('openchat', ['openchat.service']).controller('basic', ( $scope, $connect, $user ) ->
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
    
  $scope.user_detect = () ->
    $user.user_detect().then( (user)->
      $scope.current_user = user;
      $scope.$digest();
    );
  
  window.onclose = () ->
    socket.disconnect();
  
  return;
)

