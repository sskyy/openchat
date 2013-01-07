
var https = require('https');

var options = {
    host : "api.weibo.com",
    method : "POST",
    path :  '/oauth2/access_token?code=ffa67239dac0fdef5d0af81de011840f&client_id=3312201828&client_secret=504c80843945b0c9b3b44ec188cc1d27&grant_type=authorization_code&redirect_uri=http://jieq1u3u19.elb7.stacklab.org'
}

https.request(options,function(res){
    res.on('data',function(data){
        console.log('data:', data);
    })
    res.on('error',function(error){
        console.log('error:', error);
    })
})