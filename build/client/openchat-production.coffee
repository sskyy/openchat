
#console = { log:()-> } unless console?

window._OPENCHAT_BUILD = '1359808966000'

angular.module('openchat.service',[])
angular.module('openchat.directive',[])
angular.module('openchat', ['openchat.service','openchat.directive'])

### service connect. using socket.io ###

#angular.module('openchat.service',[])
#.service('$connect', () ->
#  url = '42.96.146.173/chat'
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
    _connectId : null,
    url:'http://42.96.146.173:80/chat',
    interval : 1000,
    heartbeat : null,
    connected : false,
    failures : 0,
    failuresLimit : 20,
    times : 0,
    connect : ()->
      root = this
      console.log "connect check, is connected?", root.connected
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
      root._call_callbacks('disconnect')
      $http.jsonp("#{this.url}/emit",{params:{connectId:root.connectId,'event':'disconnect',callback:'JSON_CALLBACK'}}) unless silent
      
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
  base = 'http://42.96.146.173:80'
  $user = {};
  oauthWindow = null;
  
  get_user_info = ( oauth_id )->
    return $http.jsonp( "#{base}/oauth/user_info?callback=JSON_CALLBACK&oauth_id=#{oauth_id}")
  
  user_login = ()->
    q = $q.defer();
    oauth_id = null
    $http.jsonp("#{base}/oauth/apply_oauth_id?callback=JSON_CALLBACK").success( (data) ->
      oauth_id = data.oauth_id
      console.log oauth_id
      
      url = 'https://api.weibo.com/oauth2/authorize'
      param = ['?client_id=3394267529',
        'redirect_uri=42.96.146.173/oauth/callback',
        'forcelogin=true',
        'state=weibo:'+oauth_id].join('&')
      
      oauthWindow = window.open url+param, '', 'height=350,width=600'
      
      interval_limit = 100
      interval = $window.setInterval( ()->
        if !interval_limit
          $window.clearInterval( interval ) 
          oauthWindow.close() if oauthWindow
          return q.reject()
        get_user_info( oauth_id ).then((user)->
          $window.clearInterval( interval ) 
          oauthWindow.close() if oauthWindow
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
      user_login().then( ( res )->
        $user.user = res.data
        q.resolve( res.data )
      )
    )
    return q.promise;
    
  $user.get_current = ()->
    return $user.user? && $user.user || null 
    
  $user.logout = ()->
    $http.jsonp("#{base}/oauth/end_session?callback=JSON_CALLBACK").success( (data) ->
      $user.user = {};
    )
    
    
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





angular.module('openchat.service').service('$notice',()->
  $notice =
    _interval : null
    _title : document.title
    _bound : false
    _new : false
    notice : ( msg ) ->
      console.log @_title, document.title
      root = this
      @_new = true
      document.title = "[#{msg}]#{@_title}" 
      if !@_bound
        angular.element( document.getElementsByTagName('body')[0]).bind('click',()->
          if root._new 
            document.title = root._title 
        );
    
  return $notice
)


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




#file:events.coffee     
angular.module('openchat').controller('private_chat', ( $scope, $connect, $user, $chat, $notice ) ->
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
      $notice.notice('new msg');
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








angular.module('openchat.directive').directive('ngScreenHeight',()->
  return ( scope, element, attrs )->
    console.log('directive ngScreenHeight begin',document.documentElement.clientHeight );
    element.css( 'height', "#{document.documentElement.clientHeight-67}px" );
)  


angular.module('openchat.directive').directive('ngScrollToBottom',()->
  return ( $scope, ele, attr )->
    ele.bind('DOMNodeInserted',( e)->
      if( e.relatedNode == ele[0] )
        console.log( 'begin to scroll')
        window.setTimeout(()->
          ele[0].scrollTop = ele[0].scrollHeight; 
        , 200)
        
    )
)

