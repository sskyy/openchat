
#user main file

angular.module('openchat.service').service('$user', ()->

  $user = {};
  $user.user_detect = () ->
    ioOauth = io.connect('<%= config.host%>/oauth').connect()
    ioOauth.on('connection', ( socket)->
      ioOauth.emit('apply_oauth_id')
    )
    
    ioOauth.on('oauth_id', ( oauth_id )->
      url = 'https://api.weibo.com/oauth2/authorize';
      param = ['?client_id=<%= config.weibo.appkey%>',
        'redirect_uri=<%= config.host%>?oauth_id='+oauth_id].join('&')
        
        
      window.open( url+param );
    )
    
    ioOauth.on('access_token', ( access_token )->
      alert( access_token )
    )
    
  return $user;
  
)