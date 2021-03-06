var https = require('https');
var _ = require('underscore')

var oauth = function( options ){
    this.setup( options );
}

oauth.prototype.setup = function( options ){
    this.options = options
}

oauth.prototype.get_access_token = function( httpsOptions, code, callback ){
    var root = this;
    httpsOptions = httpsOptions ||
        {
            host : root.options.host,
            path : [ root.options.path.access_token + '?client_id='+root.options.appkey,
            'client_secret='+root.options.appsecret,
            'grant_type=authorization_code',
            'code='+code,
            'redirect_uri='+ root.options.domain+'/oauth/callback'].join('&'),
            method : 'POST',
            headers: {
                'Content-Length': 0
            }
        }
        
    var req = https.request(httpsOptions, function(res) {
        res.on('data', function( buf) {
            var data = JSON.parse( buf.toString() );
            data.platform = root.options.platform 
            callback( data );
        });
    });
    req.end();

    req.on('error', function(e) {
        console.error(e);
    });
}

oauth.prototype.get_user_info = function( access_token, id, httpsOptions, callback){
    var root = this;
    httpsOptions = httpsOptions ||
        {
            host : root.options.host,
            path : [ root.options.path.user_info + '?access_token=' + access_token,
            'uid='+id].join('&'),
            method : 'GET',
            headers: {
                'Content-Length': 0
            }
        }
        
    var req = https.request(httpsOptions, function(res) {
        console.log("sending request for user info")
        res.on('data', function( buf) {
            var res = JSON.parse( buf.toString() );
            console.log('get_user_info_done' , res)
            callback( res );
        });
    });

    req.on('error', function(e) {
        console.error(e);
    });
    
    req.end();
}

oauth.prototype.end_session = function(user){
    var root = this;
    var httpsOptions = 
        {
            host : root.options.host,
            path : [ root.options.path.end_session + '?access_token=' + root.options.access_tokens[user.id],'forcelogin=true'].join('&'),
            method : 'GET',
            headers: {
                'Content-Length': 0
            }
        }
        
    var req = https.request(httpsOptions, function(res) {
        res.on('data', function( buf) {
            console.log('end_session done' )
        });
    });

    req.on('error', function(e) {
        console.log('end session error')
        console.error(e);
    });
    
    req.end();
}

module.exports = oauth;