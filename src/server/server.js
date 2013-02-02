var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    port = 80

if( process.env.NODE_SERVER_MODE == 'debug'){
    app.DEBUG_MODE = true
    port = 8000
}


server.listen(port);
app.use(express.cookieParser());
app.use(express.cookieSession({key:'connect.sess',secret:'openchat'}));



//using socket.io
//var io = require('./openchat.js').listen(server);

//using ajax
require('./openchat.js').listen( app );

require('./oauth.js').listen( app );

require('./github.js').listen( app );

require('./build_spy.js').listen( app );

//must be last. resource.js listen route /* which may overrite other 
//listener which registered after resource.js
require('./resource.js').listen( app );

