
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
        root._call_callbacks( res.event, res.data )
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
