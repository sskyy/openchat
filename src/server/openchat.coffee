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
###
  Need oauth.js to generate user session first, need req.session.user.openchatId 
  to identify user.
  Need page.js to locate user page.
###
_ = require 'underscore'
Page = require './page.js'

users = {}
user_page_ref = {}
chat = 
  connect : ( req, res) ->
    root = this
    if !req.session.page
      Page.set_session( req )
      
    if !req.session.user
      return res.jsonp(501,{message:'login first.'}) 
    
    root._keep_user req
    root._connect_events req 
    console.log( req.session.user.openchatId , "logged in ")
    return res.jsonp(200,{ message:'hello',connectId} )
  
  _keep_user : ( req )->
    root = this;
    users[req.session.user.openchatId] ?= _.extend({events : []},req.session.user)
    connectId = req.query.connectId? || root._generate_id()
    users[req.session.user.openchatId].connectId = connectId
    users[req.session.user.openchatId].lastLogin = root._now()
    
  _connect_events : ( req )->
    #update user_page_ref
    user_page_ref[ req.session.page?.id ] ?= {}
    user_page_ref[ req.session.page?.id ][req.session.user.openchatId] = users[req.session.user.openchatId]
    # notify same page users
#    this._notify_all_user('update_users', this._output_all_users())
    this._notify_page_user('update_users', this._output_page_users( req.session.page.id ), req.session.page.id )
    
  _notify_all_user : ( event, data )->
    for openchatId, user of users
      user.events.push({event,data})
      
  _notify_page_user : ( event, data, pageId )->
    for openchatId, user of user_page_ref[pageId]
      user.events.push({event,data})
      
  _output_all_users:()->
    output = (for openchatId, user of users
      {name:user.name,openchatId:user.openchatId,avatar:user.avatar})
    return output
    
  _output_page_users:( pageId )->
    output = (for openchatId, user of user_page_ref[pageId]
      {name:user.name,openchatId:user.openchatId,avatar:user.avatar})
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
      ##´æµ½Êı¾İ¿â
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
      this._disconnect_event( req );
      
  _disconnect_event : (req ) ->
    #update user_page_ref
    delete users_page_ref[ req.session.page.id ][req.session.user.openchatId]
    #notify same page user
#    this._notify_all_user('update_users', this._output_all_users())
    this._notify_page_user('update_users', this._output_page_users( req.session.page.id ), req.session.page.id )
    
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


