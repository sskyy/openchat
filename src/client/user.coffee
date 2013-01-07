
#user main file

angular.module('openchat.service').service('$user', ( $q )->

  $user = {};
  $user.user_detect = () ->
    q = $q.defer()
    ioOauth = io.connect('<%= config.host%>/oauth')
    ioOauth.on('connection', ( socket)->
      ioOauth.emit('apply_oauth_id')
      console.log('apply_oauth_id');
    )
    
    ioOauth.on('oauth_id', ( oauth_id )->
      console.log( oauth_id );
      url = 'https://api.weibo.com/oauth2/authorize';
      param = ['?client_id=<%= config.weibo.appkey%>',
        'redirect_uri=<%= config.host%>?oauth_id='+oauth_id].join('&')
      window.open( url+param );
    )
    
    ioOauth.on('access_token', ( access_token )->
      alert( access_token )
      q.resolve( access_token )
    )
    
    return q.promise;
    
  return $user;
  
  
)