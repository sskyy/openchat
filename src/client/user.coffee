
#user main file
angular.module('openchat.service').service('$user', ( $q, $http, $window )->
  
  $user = {};
  $user.user_detect = ( platform ) ->
    q = $q.defer()
    oauth_id = null
    
    get_user_name = ( uid, access_token )->
      url = 'https://api.weibo.com/2/users/show.json'
      params = {uid, access_token}
      $http.jsonp(url,{params}).success( (user)->
        q.resolve( user )
      ).error( () ->
        q.reject()
      )
    
    get_access_token_interval = ( oauth_id ) ->
      return if !oauth_id 
      interval_limit = 50
      interval = $window.setInterval( ()->
        $window.clearInterval( interval ) if !interval_limit--
        $http.jsonp("/oauth/access_token?oauth_id=#{oauth_id }&callback=JSON_CALLBACK").success( (data)->
          console.log( data );
          $window.clearInterval( interval )
          get_user_name( data.uid, data.access_token )
        )
      , 1000)  
      
      
    $http.jsonp('/oauth/apply_oauth_id?callback=JSON_CALLBACK').success( (data) ->
      oauth_id = data.oauth_id
      console.log oauth_id
      
      url = 'https://api.weibo.com/oauth2/authorize'
      param = ['?client_id=<%= config.weibo.appkey%>',
        'redirect_uri=<%= config.host%>/oauth/callback',
        'state=weibo:'+oauth_id].join('&')
      
      window.open url+param 
      
      get_access_token_interval( oauth_id )
      
    ).error( (err)->
      console.log('apply_oauth_id err', err)
    )
    
    return q.promise;
    
  return $user;
  
)