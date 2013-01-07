var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app)

server.listen(8000);




var io = require('./openchat.js').listen(server);
require('./oauth.js').listen( io, app );

require('./github.js').listen( app );
//must be last
require('./resource.js').listen( app );

