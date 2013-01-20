var https = require('https');
var _ = require('underscore');
var oauth = require('./oauth-common.js');

var options = {
    appkey:3312201828,
    appsecret:'504c80843945b0c9b3b44ec188cc1d27',
    domain:'jieq1u3u19.elb7.stacklab.org',
    path:{
        access_token:'/oauth2/access_token',
        user_info : '/2/users/show.json'
    },
    host:'api.weibo.com',
    idField : 'uid',
    platform : 'weibo'
}

module.exports = function(){
    weiboOauth =  new oauth( options );
    weiboOauth.gen_user_session = function( user, access_token ){
        return { name : user.name, id: user.id, access_token : access_token, avatar:user.profile_image_url }
    }
    return weiboOauth
}
