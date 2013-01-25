
#console = { log:()-> } unless console?

window._OPENCHAT_BUILD = '1359088902000'

angular.module('openchat.service',[])
angular.module('openchat', ['openchat.service'])






### service connect. using socket.io ###

#angular.module('openchat.service',[])
#.service('$connect', () ->
#  url = '127.0.0.1/chat'
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
    url:'http://127.0.0.1:8000/chat',
    interval : 1000,
    heartbeat : null,
    connected : false,
    failures : 0,
    failuresLimit : 20,
    times : 0,
    connect : ()->
      root = this
      console.log "is connected?", root.connected
      return this if root.connected
      params = {callback:'JSON_CALLBACK',url:$window.location.href}
      $http.jsonp( "#{this.url}/connect",{params}).success(( res )->
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
      
    disconnect : ( silent )->
      root = this
      $window.clearInterval( this.heartbeat )
      root.connected = false
      $http.jsonp("#{this.url}/emit",{params:{connectId:root.connectId,'event':'disconnect'}}) unless silent
      
    emit: ( event, data)->
      return false if not this.connected 
      root = this
      params = {event, data, connectId:root.connectId,callback:'JSON_CALLBACK'}
      $http.jsonp("#{this.url}/emit",{params})
      
    on: ( event, callback, context ) ->
      root = this
      context ?= callback
      root._events[event] = [] unless event of root._events
      root._events[event].push({callback,context})
      
    _recieve: () ->
      return false if not this.connected
      this.disconnect() if this.failures > this.failuresLimit
      root = this;
      params = {callback:'JSON_CALLBACK',connectId:root.connectId, t:Date.parse(new Date())}
      $http.jsonp("#{this.url}/recieve",{params}).then(( res )->
        return root.disconnect( true ) if "error" of res.data
        root.failures = 0
        for event in res.data
          root._call_callbacks( event.event, event.data )
      ,( res )->
        if( res.status == 502 )
          console.log( 'server down')
          return root.disconnect( true );
        if( res.status == 401 )
          console.log('u have been kicked out')
          return root.disconnect( true )
          
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
  base = 'http://127.0.0.1:8000'
  $user = {};
  
  get_user_info = ( oauth_id )->
    return $http.jsonp( "#{base}/oauth/user_info?callback=JSON_CALLBACK&oauth_id=#{oauth_id}")
  
  user_login = ()->
    q = $q.defer();
    oauth_id = null
    $http.jsonp("#{base}/oauth/apply_oauth_id?callback=JSON_CALLBACK").success( (data) ->
      oauth_id = data.oauth_id
      console.log oauth_id
      
      url = 'https://api.weibo.com/oauth2/authorize'
      param = ['?client_id=3312201828',
        'redirect_uri=127.0.0.1/oauth/callback',
        'state=weibo:'+oauth_id].join('&')
      
      window.open url+param 
      
      interval_limit = 100
      interval = $window.setInterval( ()->
        if !interval_limit
          $window.clearInterval( interval ) 
          return q.reject()
        get_user_info( oauth_id ).then((user)->
          $window.clearInterval( interval ) 
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
      $user.user = user;
      q.resolve( user )
    ).error(()->
      console.log 'get_user_info failed'
      user_login().then( ( user )->
        $user.user = user
        q.resolve( user )
      )
    )
    return q.promise;
    
  $user.get_current = ()->
    console.log( "current_user", $user.user? && $user.user || null )
    return $user.user? && $user.user || null 
    
  return $user;
)




#detect page 
angular.module('openchat.service').service('$chat',()->
  $chat =
    _callback : {}
    set_connect : (@connect)-> this
    set_target : ( target )-> 
      @target = angular.copy( target );
      delete @target.messages
      @_invoke_callback 'set_target', @target
    set_message : (@message)-> console.log @target;this
    get_target : ()-> @target
    get_message : ()-> @message
    send : ( )->
      if not @connect?.connected
        return console.log( 'I have no connection to use')
      if not( @target&&@message )
        return console.log( 'target or message not set', @target, @message)
      console.log( 'sending message to:', @target )
      @connect.emit 'send_message', { target:@target, message:@message}
    on : ( event, fn, context )->
      if not event of this
        return false
      @_callback[event] ?= []
      context ?= fn
      @_callback[event].push( {fn,context} )
      this
    _invoke_callback : ( event, data )->
      console.log( 'call chat callback', event, data )
      if @_callback[event]?
        for callback in @_callback[event]
          callback.fn.call( callback.context, data )
      this
    
  return $chat
)






#file:events.coffee     
angular.module('openchat').controller('basic', ( $scope, $connect, $user ) ->
  $scope.current_user = {};
  $scope.message = {};
  $scope.recieve_messages = []
  
  _connect = () ->
    if $user.get_current()?.name?
      console.log( $user.get_current(),"already connected once, this is second")
      $connect.connect();
    else
      console.log( $scope.current_user,"this is first connect")
      $user.user_detect().then( ( user )->
        $scope.current_user = user;
        $connect.connect();
      )
  
  $scope.connect = () ->
    return if $connect.connected
    _connect()
    
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
      $scope.current_conversation = conversation
    else
      $scope.current_conversation = angular.copy $scope.conversations[user.openchatId]
    
  conversation_push = ( message, target )->
    target ?= message.source
    if not $scope.conversations[ target.openchatId]? 
      conversation_init( target )
    $scope.conversations[ target.openchatId].messages.push( message )  
    $scope.conversations[ target.openchatId].unread = true  
    $scope.current_conversation = angular.copy $scope.conversations[ target.openchatId]
    console.log $scope.current_conversation
    
  $connect.on 'connect', () ->
    $scope.current_user = $user.get_current()
    console.log( 'controller-private_chat bind events, current user', $scope.current_user );
    $chat.set_connect( $connect );
    $chat.on( "set_target", conversation_init );
    bind_events( $connect ) if $connect.times == 1
  
  bind_events = ( $connect )->
    $connect.on "update_users", (users) -> 
      $scope.users = users 
      console.log( "update_users", $scope.users );
      
    $connect.on 'disconnect', () ->
      $scope.recieve_message ={source:'server',message:'disconnect'};

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
    
  $scope.set_current_conversation = ( conversation ) ->
    $scope.current_conversation = angular.copy( conversation )
    console.log('set current conversation', conversation )
    
  $scope.object_length = ( object ) ->
    length = 0
    ++length for i of object
    console.log( "object_length", length )
    return length
  
  return;
)




#file:events.coffee     
angular.module('openchat').controller('public_chat', ( $scope, $connect, $user ) ->
  return;
)



#file:events.coffee     
angular.module('openchat').controller('user_list', ( $scope, $connect, $user, $chat ) ->
  $scope.users = [];
  $scope.userSelected = {};
      
  $connect.on 'connect', () ->
    console.log( 'controller-user_list bind events' )
    $scope.current_user = $user.get_current()
    bind_events( $connect ) if $connect.times == 1
  
  
  bind_events = ( $connect )->
    $connect.on "update_users", (users) -> 
      $scope.users = users ;
      console.log "update_users", users
      
  $scope.set_target = ( user )->
    $chat.set_target( user )
    $scope.userSelected={}
    $scope.userSelected[user.openchatId] = user
      
  return;
)








