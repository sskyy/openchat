var https = require('https');
var _ = require('underscore');

var users = {};
var supported_platform = ['weibo'];

exports.listen = function( server ){
    listen_server( server );
}

function listen_server( server, io ){
    server.get('/oauth/apply_oauth_id', function( req, res ){
        var id = generate_id();
        console.log( 'replying oauth_id', id)
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
        var state = req.query.state.split(":")
        var oauth_id = state[1];
        var platform = state[0]
        
        if( _.indexOf( supported_platform, platform) == -1 ){
            return res.send(501,{
                message:'platform ' + platform + ' not supported'
                });
        }
        
        var platformIns = require('./oauth-'+platform + '.js')();
        console.log('begin to get access_token for',oauth_id)
        platformIns.get_access_token(null, req.query.code,  function( access_token_pack ){
            platformIns.get_user_info( access_token_pack.access_token
                ,access_token_pack[platformIns.options.idField]
                ,null
                ,function( user ){
                    console.log("get user done, begin to gen session");
                    users[oauth_id] = platformIns.gen_user_session( user, access_token_pack.access_token )
                    users[oauth_id].openchatId = users[oauth_id].id + '@' + platform
            })
        });
        
        res.sendfile('./src/server/oauth_login.html');
    })
    
    server.get('/oauth/user_info', function(req, res){
        if( server.DEBUG_MODE && !req.session.user ){
            console.log('DEBUG_MODE generate randome_user')
            req.session.user = generate_randome_user()
        }
        
        if( 'user' in req.session && 'openchatId' in req.session.user ){
            return res.jsonp( req.session.user )
        }
        
        if( req.query.oauth_id in users ){
            console.log( users[req.query.oauth_id] );
            req.session.user = users[req.query.oauth_id];
            res.jsonp( users[req.query.oauth_id] )
            return delete users[req.query.oauth_id];
        }
        
        return res.send(404,{ message:'user info not get yet'});
    })
    
}


function generate_id(){
    var id = Date.parse( new Date())
    while( id in users ){
        id = Date.parse( new Date())
    }
    return id;
}

function generate_randome_user(){
    var id = parseInt( Math.random()*10 + 1)
    var name = 'oc'+ id
    var platform = 'weibo'
    return {
        name : name,
        id : id,
        openchatId : id + '@' + platform,
        platform : platform,
        avatar : 'http://tp4.sinaimg.cn/1991303247/50/5605406617/1'
    }
}

