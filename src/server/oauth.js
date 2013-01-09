var https = require('https');
var _ = require('underscore');

var access_tokens = {};
var supported_platform = ['weibo'];

exports.listen = function( server ){
    listen_server( server );
}

function listen_server( server, io ){
    server.get('/oauth/apply_oauth_id', function( req, res ){
        var id = generate_id();
        res.jsonp({
            oauth_id:id
        })
    })
    
    server.get('/oauth/callback', function(req, res){
        if( !( "code" in req.query ) || !('state' in req.query) ){
            return res.send(501,{
                message:"no code or oauth_id"
            })
        }
        var state = req.query.state.split(":");
        var oauth_id = state[1];
        var platformName = state[0]
        
        if( _.indexOf( supported_platform, platformName) == -1 ){
            return res.send(501,{
                message:'platform ' + platformName + ' not supported'
                });
        }
        
        var platform = require('./oauth-'+platformName + '.js')();
        platform.get_access_token(null, req.query.code,  function( access_token ){
            console.log( access_token );
            //todo : set user session
            req.session.user = platform.gen_user_session( access_token );
            return access_tokens[oauth_id] = access_token
        });
        
        res.sendfile('./src/server/oauth_login.html');
    })
    
    server.get('/oauth/access_token', function(req, res){
        if( req.query.oauth_id in access_tokens ){
            res.jsonp( access_tokens[req.query.oauth_id] )
            return delete access_tokens[req.query.oauth_id]
        }
        console.log( access_tokens );
        
        return res.send(404,{ message:'access_token not get yet'});
    })
    
}


function generate_id(){
    var id = Date.parse( new Date())
    while( id in access_tokens ){
        id = Date.parse( new Date())
    }
    return id;
}

