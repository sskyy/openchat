
#user main file
angular.module('openchat.service').service('$user', ( $q, $http, $window )->
  base = 'http://<%=config.host%>:<%=config.port%>'
  $user = {};
  
  get_user_info = ( oauth_id )->
    return $http.jsonp( "#{base}/oauth/user_info?callback=JSON_CALLBACK&oauth_id=#{oauth_id}")
  
  user_login = ()->
    q = $q.defer();
    oauth_id = null
    $http.jsonp("#{base}/oauth/apply_oauth_id?callback=JSON_CALLBACK").success( (data) ->
      oauth_id = data.oauth_id
      console.log oauth_id
      
      url = 'https://api.weibo.com/oauth2/authorize'
      param = ['?client_id=<%= config.weibo.appkey%>',
        'redirect_uri=<%= config.host%>/oauth/callback',
        'forcelogin=true',
        'state=weibo:'+oauth_id].join('&')
      
      window.open url+param, '', 'height=350,width=600'
      
      interval_limit = 100
      interval = $window.setInterval( ()->
        if !interval_limit
          $window.clearInterval( interval ) 
          return q.reject()
        get_user_info( oauth_id ).then((user)->
          $window.clearInterval( interval ) 
          q.resolve(user)
        ,()->
          interval_limit--
        )
      , 1000)  
      
    ).error( (err)->
      console.log('apply_oauth_id err', err)
      q.reject()
    )
    return q.promise
  
  $user.user_detect = ( platform ) ->
    q = $q.defer()
    get_user_info().success( (user)->
      $user.user = user;
      q.resolve( user )
    ).error(()->
      console.log 'get_user_info failed'
      user_login().then( ( res )->
        $user.user = res.data
        q.resolve( res.data )
      )
    )
    return q.promise;
    
  $user.get_current = ()->
    return $user.user? && $user.user || null 
    
  $user.logout = ()->
    $http.jsonp("#{base}/oauth/end_session?callback=JSON_CALLBACK").success( (data) ->
      $user.user = {};
    )
    
    
  return $user;
)


