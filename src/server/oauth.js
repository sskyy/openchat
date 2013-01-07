var oauthClient = {
    APPKEY:3312201828,
    APPSECRET:'504c80843945b0c9b3b44ec188cc1d27',
    DOMAIN:'jieq1u3u19.elb7.stacklab.org'
}
var connections = {};
var https = require('https');


exports.listen = function( io, server ){
    listen_socket( io );
    listen_server( server, io );
}

function listen_socket( io ){
    io.of('/oauth').on( 'connection', function( socket ) {
        console.log("on connection" );
        socket.on('apply_oauth_id', function(){
            var id = generate_id();
            while( id in connections ){
                id = generate_id();
            }
            connections[id] = id;
            socket.join( id );
            socket.emit('oauth_id', id );
        });
    }) 
}

function listen_server( server, io ){
    
    server.get('/oauth/callback', function(req, res){
        console.log( "oauth/callback", req.query.code, req.query.state );
        if( !( "code" in req.query ) || !('state' in req.query) ){
            res.end()
            return;
        }
        get_access_token( req.query.code, function( access_token ){
            io.of("/oauth").in( req.query.state ).emit( 'access_token',access_token );
            delete connections[req.query.state];
//            connections[req.query.state].emit('access_token', access_token );
//            connections[req.query.state].disconnect();
//            delete connections[oauth_id];
            res.end();
            return;
        });
    })
    
}

function get_access_token( code, callback ){
    var options = {
        host : "api.weibo.com",
        path : ['/oauth2/access_token?client_id='+oauthClient.APPKEY,
        'client_secret='+oauthClient.APPSECRET,
        'grant_type=authorization_code',
        'code='+code,
        'redirect_uri='+ oauthClient.DOMAIN+'/oauth/callback'].join('&'),
        method : 'POST',
        headers: {
            'Content-Length': 0
        }
    }
    
    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);

        res.on('data', function(d) {
            callback( d.toString() );
        });
    });
    req.end();

    req.on('error', function(e) {
        console.error(e);
    });
    
}

function generate_id(){
    return Date.parse(new Date());
}