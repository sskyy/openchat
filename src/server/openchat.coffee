#openchat events

### using socket.io 

io = require 'socket.io'

data = 
  users : {}
  connections : {}
  
single_socket_event = ( socket, data, io ) ->
  socket.on 'set_current_user', ( user ) ->
    socket.set 'user', user;
    if user.name of data.connections
      console.log 'kick out previous user', user.name;
#      data.connections[user.name].emit('user_conflict');
      data.connections[user.name].disconnect();
      data.connections[user.name] = null;
    data.users[user.name] = user;
    data.connections[user.name] = socket;
    
    io.of('/chat').emit "update_users", data.users;
    
  socket.on 'disconnect',  () -> 
    socket.get('user', ( err, user ) ->
      if user && user.name of data.connections
        if data.connections[user.name] == socket
          delete data.connections[user.name]
        if( (user.name of data.users) && !(user.name of data.connections) )
          delete data.users[user.name];

        io.of('/chat').emit 'update_users', data.users;  
    );
    
  socket.on 'send_message', ( message ) ->
    if message.target of data.connections
      socket.get('user', (err, user)->
        data.connections[message.target].emit( 'get_message', {source:user.name, message:message.message})
      )
    
    
exports.listen = ( server ) ->
  reIO = io.listen(server)
  reIO.of('/chat').on( 'connection', ( socket ) -> 
    single_socket_event( socket, data, io )
  )
  return reIO
  
###
          
### using ajax ###
_ = require 'underscore'
users = {}
chat = 
  connect : ( req, res) ->
    #emulator
#    req.session.user = {id:'jason@weibo.com'}
    root = this
    if !req.session.user
      return res.jsonp(501,{message:'login first.'}) 
      
    users[req.session.user.openchatId] ?= _.extend({
      events : 
        [{event:'get_message', data:{source:{platform:'openchat',name:'server'},message:'welcome'}}]
      connectId:null
      lastLogin:null
    },req.session.user)
      
    connectId = req.query.connectId? || root._generate_id()
    users[req.session.user.openchatId].connectId = connectId
    users[req.session.user.openchatId].lastLogin = root._now()
    console.log( req.session.user.openchatId , "logged in ")
    root._connect_events( req.session.user.openchatId )
    return res.jsonp(200,{ message:'hello',connectId} )
  
  _connect_events : ( connectUser )->
    this._notify_all_user('update_users', this._output_all_users())
    
  _notify_all_user : ( event, data )->
    for openchatId, user of users
      user.events.push({event,data})
      
  _output_all_users:()->
    output = (for openchatId, user of users
      {name:user.name,openchatId:user.openchatId})
    return output
    
  emit : ( req, res )->
    if not req.query.event in this 
      return res.jsonp(404, {})
    if( !users[req.session.user.openchatId]? or not (users[req.session.user.openchatId].connectId == parseInt(req.query.connectId)) )
      return res.jsonp(401,{message:'u have been kicked out.'})
    root = this
    return root[req.query.event]( req, res)
    
  send_message : ( req, res )->
    data = JSON.parse( req.query.data );
    console.log( "sending message to ", data.target.openchatId, data );
    if !(data.target.openchatId of users ) or !( users[data.target.openchatId].connectId )
      ##�浽���ݿ�
      return console.log( data.target.openchatId, ' not online, message saved to database. users:' )
      
    event = {event:'get_message', data:{source:req.session.user,message:data.message}}
    return users[data.target.openchatId].events.push( event )
  
  recieve : ( req, res )->
    if !(users[req.session.user.openchatId]?.connectId == parseInt( req.query.connectId) )
      console.log( users, users[req.session.user.openchatId]?.connectId, req.query.connectId)
      return res.jsonp(200,{error:'you have been kicked out'}) 
      
    events = users[req.session.user.openchatId].events.splice(0)
    return res.jsonp(200, events)
    
  disconnect : ( req, res)->
    if( parseInt(req.query.connectId) == users[ req.session.user.openchatId ].connectId )
      console.log( req.session.user.openchatId ," logged out")
      delete users[ req.session.user.openchatId ]
      this._notify_all_user('update_users', this._output_all_users())
  
  _generate_id : ( collection ) ->
    return this._now()
    
  _now : ()->
    return Date.parse( new Date)


exports.listen = ( server ) ->
  console.log("a")
  server.get('/chat/:event', ( req, res)->
    if( not req.params.event in chat  )
      return res.send( 404,{})
    
    return chat[req.route.params.event]( req, res )
  )


