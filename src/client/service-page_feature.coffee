
#detect page 
angular.module('openchat.service').service('$page_feature',( $http )->
  $page_feature = 
    get_current : () ->
      $http.jsonp("http://<%=config.host%>:<%=port%>/page/get_current?callback=JSON_CALLBACK")
    
  return $page_feature;
)

