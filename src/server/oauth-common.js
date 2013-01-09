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
            path : [ root.options.path + '?client_id='+root.options.appkey,
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

oauth.prototype.gen_user_session = function( access_token ){
    var root =this;
    return { access_token : access_token, id : access_token[root.options.idField]+'@'+root.options.platform}
}

module.exports = oauth;