
### service connect. using socket.io ###

#angular.module('openchat.service',[])
#.service('$connect', () ->
#  url = '<%= config.host%>/chat'
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
    url:'http://<%=config.host%>:<%=config.port%>/chat',
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

