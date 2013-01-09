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
users = {}
chat = 
  connect : ( req, res) ->
    #emulator
    req.session.user = {id:'jason@weibo.com'}
    root = this
    if !req.session.user
      return res.jsonp(501,{message:'login first.'}) 
    users[req.session.user.id] ?= {user:req.session.user,messages:[{source:'server',message:'welcome'}],connectId:null,lastLogin:null}
    connectId = req.query.connectId? || root._generate_id()
    users[req.session.user.id].connectId = connectId
    users[req.session.user.id].lastLogin = root._now()
    return res.jsonp(200,{ message:'hello',connectId} )
    
  emit : ( req, res )->
    if not req.query.event in this 
      return res.jsonp(404, {})
    if not users[req.session.user.id].connectId == req.query.connectId
      return req.jsonp(401,{message:'you have been kicked out'}) 
    root = this
    return root[req.query.event]( req, res)
    
  send_message : ( req, res )->
    if not req.query.data.target of messages 
      ##´æµ½Êı¾İ¿â
      return
    return messages[req.query.data.target].push({source:req.session.user.id,message:req.query.data.message})
  
  recieve : ( req, res )->
    if !(users[req.session.user.id]?.connectId == parseInt( req.query.connectId) )
      console.log( users, users[req.session.user.id]?.connectId, req.query.connectId)
      return res.jsonp(200,{error:'you have been kicked out'}) 
    return res.jsonp(200,
      { event:'get_message', data:users[req.session.user.id].messages.splice(0)}
    )
    
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


