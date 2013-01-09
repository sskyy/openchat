
angular.module('openchat.service',[])
angular.module('openchat', ['openchat.service'])

### service connect. using socket.io ###

#angular.module('openchat.service',[])
#.service('$connect', () ->
#  url = 'jieq1u3u19.elb7.stacklab.org/chat'
#  if( typeof( io) == undefined )
#    console.log( "socket.io not exist");
#    return {};
#  
#  $connect = {}
#  $connect.connect = () ->
#    return io.connect url
#    
#  return $connect
#)

### service connect. using ajax ###
angular.module('openchat.service').service('$connect',( $http, $window, $q)->
  $connect = 
    _events : {},
    _connectId : null
    url:'/chat',
    interval : 1000,
    heartbeat : null,
    connected : false,
    failures : 0,
    failuresLimit : 20,
    times : 0,
    connect : ()->
      root = this
      console.log root.connected
      return this if root.connected
      params = {callback:'JSON_CALLBACK'}
      $http.jsonp( this.url+'/connect',{params}).success(( res )->
        root.heartbeat = $window.setInterval(()->
          root._recieve()
        ,root.interval)
        root.connected = true
        root.connectId = res.connectId
        if( 'connect' of root._events )
          root._call_callbacks('connect')
      )
      root.times++
      return root
      
    disconnect : ()->
      root = this
      $window.clearInterval( this.heartbeat )
      root.connected = false
      
    emit: ( event, data)->
      return false if not this.connected 
      root = this
      params = {event, data, connectId:root.connectId,callback:'JSON_CALLBACK'}
      $http.jsonp(this.url+'/emit',{params})
      
    on: ( event, callback, context ) ->
      root = this
      context ?= callback
      root._events[event] = [] unless event of root._events
      root._events[event].push({callback,context})
      
#    off: ( event )->
    
    _recieve: () ->
      return false if not this.connected
      this.disconnect() if this.failures > this.failuresLimit
      root = this;
      params = {callback:'JSON_CALLBACK',connectId:root.connectId}
      $http.jsonp(this.url+'/recieve',{params})
      .success( ( res )->
        return root.disconnect() if "error" of res
        root.failures = 0
        for event in res
          root._call_callbacks( event.event, event.data )
      ).error(( res )->
        return root.failures++;
      )
      
      
    _call_callbacks:( event, data )->
      root = this
      console.log( event, data );
      if( event of root._events)
          for eventItem in root._events[event]
            eventItem.callback.call( eventItem.context, data )
            
  return $connect;
  

)  


#user main file
angular.module('openchat.service').service('$user', ( $q, $http, $window )->
  
  $user = {};
  
  get_user_info = ()->
    return $http.jsonp("/oauth/user_info?callback=JSON_CALLBACK")
  
  user_login = ()->
    q = $q.defer();
    oauth_id = null
    $http.jsonp('/oauth/apply_oauth_id?callback=JSON_CALLBACK').success( (data) ->
      oauth_id = data.oauth_id
      console.log oauth_id
      
      url = 'https://api.weibo.com/oauth2/authorize'
      param = ['?client_id=3312201828',
        'redirect_uri=jieq1u3u19.elb7.stacklab.org/oauth/callback',
        'state=weibo:'+oauth_id].join('&')
      
      window.open url+param 
      
      interval_limit = 50
      interval = $window.setInterval( ()->
        if !interval_limit
          $window.clearInterval( interval ) 
          return q.reject()
        get_user_info().then((user)->
          q.resolve(user)
        ,()->
          interval_limit--
        )
      , 1000)  
      
    ).error( (err)->
      console.log('apply_oauth_id err', err)
      q.reject()
    )
    return q.promise
  
  $user.user_detect = ( platform ) ->
    q = $q.defer()
    get_user_info().success( (user)->
      #logged in already
      q.resolve( user )
    ).error(()->
      #need login
      user_login().then( ( user )->
        q.resolve( user )
      )
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


