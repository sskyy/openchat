
#user main file
angular.module('openchat.service').service('$user', ( $q, $http, $window )->
  
  $user = {};
  
  get_user_info = ()->
    return $http.jsonp("/oauth/user_info?callback=JSON_CALLBACK")
  
  user_login = ()->
    q = $q.defer();
    oauth_id = null
    $http.jsonp('/oauth/apply_oauth_id?callback=JSON_CALLBACK').success( (data) ->
      oauth_id = data.oauth_id
      console.log oauth_id
      
      url = 'https://api.weibo.com/oauth2/authorize'
      param = ['?client_id=<%= config.weibo.appkey%>',
        'redirect_uri=<%= config.host%>/oauth/callback',
        'state=weibo:'+oauth_id].join('&')
      
      window.open url+param 
      
      interval_limit = 50
      interval = $window.setInterval( ()->
        if !interval_limit
          $window.clearInterval( interval ) 
          return q.reject()
        get_user_info().then((user)->
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
      user_login().then( ( user )->
        $user.user = user
        q.resolve( user )
      )
    )
    return q.promise;
    
  $user.get_current = ()->
    console.log( "current_user", $user.user? && $user.user || null )
    return $user.user? && $user.user || null 
    
  return $user;
)
