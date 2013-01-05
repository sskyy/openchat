#openchat ·þÎñÆ÷¶ËÂß¼­
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
    
    io.sockets.emit "update_users", data.users;
    
  socket.on 'disconnect',  () -> 
    socket.get('user', ( err, user ) ->
      if user && user.name of data.connections
        if data.connections[user.name] == socket
          delete data.connections[user.name]
        if( (user.name of data.users) && !(user.name of data.connections) )
          delete data.users[user.name];

        io.sockets.emit 'update_users', data.users;  
    );
    
  socket.on 'send_message', ( message ) ->
    if message.target of data.connections
      socket.get('user', (err, user)->
        data.connections[message.target].emit( 'get_message', {source:user.name, message:message.message})
      )
    
    
exports.listen = ( server ) ->
  io.listen( server ).sockets.on( 'connection', ( socket ) -> 
    single_socket_event( socket, data, io )
  )

          
      
