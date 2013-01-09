var https = require('https');
var _ = require('underscore');
var oauth = require('./oauth-common.js');

var options = {
    appkey:3312201828,
    appsecret:'504c80843945b0c9b3b44ec188cc1d27',
    domain:'jieq1u3u19.elb7.stacklab.org',
    path:'/oauth2/access_token',
    host:'api.weibo.com',
    idField : 'uid',
    platform : 'weibo'
}

module.exports = function(){
    return new oauth( options );
}
