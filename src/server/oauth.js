var oauthClient = {APPKEY:3312201828,APPSECRET:'504c80843945b0c9b3b44ec188cc1d27',DOMAIN:'jieq1u3u19.elb7.stacklab.org'}

var connections = {};
var https = require('https');


exports.listen = function( io, server ){
    listen_socket( io );
    listen_server( server );
}

function listen_socket( io ){
    io.of('/oauth').on( 'connection', function( socket ) {
        console.log("on connection" );
        socket.on('apply_oauth_id', function(){
            var id = generate_id();
            while( id in connections ){
                id = generate_id();
            }
            connections[id] = socket;
            socket.emit('oauth_id', id );
            console.log( 'oauth_id', id );
        });
    }) 
}

function listen_server( server ){
    server.post('/oauth/callback', function(req, res){
        console.log( "oauth/callback", req.query.code, req.query.oauth_id );
        if( !( "code" in req.query ) || !('state' in req.query) ){
            res.end()
        }
        get_access_token( req.query.code, req.query.state, function( access_token ){
            connections[req.query.state].emit('access_token', access_token );
            connections[req.query.state].disconnect();
            delete connections[oauth_id];
        });
    });
    
}

function get_access_token( code, callback ){
    var options = {
        host : "https://api.weibo.com/oauth2/access_token",
        path : ['?client_id='+oauthClient.APPKEY,
            'clinet_secret='+oauthClient.APPSECRET,
            'grant_type=authorization_code',
            'code='+code,
            'redirect_uri'+ oauthClient.DOMAIN].join('&'),
        method : 'POST'
    }
    
    https.request( options, function( res ){
        callback( res );
    })
}

function generate_id(){
    return Date.parse(new Date());
}