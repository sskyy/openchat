var https = require('https');
var _ = require('underscore');
var oauth = require('./oauth-common.js');

var options = {
    appkey:3394267529,
    appsecret:'cb346f0a0ddd6eeaf8c1b67ce69e185e',
    domain:'openchat.angularjs.cn',
    path:{
        access_token:'/oauth2/access_token',
        user_info : '/2/users/show.json',
        end_session : '/2/account/end_session.json'
    },
    host:'api.weibo.com',
    idField : 'uid',
    platform : 'weibo',
    access_tokens : {}
}

module.exports = function(){
    weiboOauth =  new oauth( options );
    weiboOauth.gen_user_session = function( user, access_token ){
        options.access_tokens[user.id] = access_token;
        return { name : user.name, id: user.id, access_token : access_token, avatar:user.profile_image_url, platform:options.platform }
    }
    return weiboOauth
}
