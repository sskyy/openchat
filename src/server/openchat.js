var data, io, single_socket_event;

io = require('socket.io');

data = {
  users: {},
  connections: {}
};

single_socket_event = function(socket, data, io) {
  socket.on('set_current_user', function(user) {
    socket.set('user', user);
    if (user.name in data.connections) {
      console.log('kick out previous user', user.name);
      data.connections[user.name].disconnect();
      data.connections[user.name] = null;
    }
    data.users[user.name] = user;
    data.connections[user.name] = socket;
    return io.sockets.emit("update_users", data.users);
  });
  socket.on('disconnect', function() {
    return socket.get('user', function(err, user) {
      if (user && user.name in data.connections) {
        if (data.connections[user.name] === socket) {
          delete data.connections[user.name];
        }
        if ((user.name in data.users) && !(user.name in data.connections)) {
          delete data.users[user.name];
        }
        return io.sockets.emit('update_users', data.users);
      }
    });
  });
  return socket.on('send_message', function(message) {
    if (message.target in data.connections) {
      return socket.get('user', function(err, user) {
        return data.connections[message.target].emit('get_message', {
          source: user.name,
          message: message.message
        });
      });
    }
  });
};

exports.listen = function(server) {
  return io.listen(server).sockets.on('connection', function(socket) {
    return single_socket_event(socket, data, io);
  });
};
