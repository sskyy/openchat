
angular.module('openchat.service').service('$notice',()->
  $notice =
    _interval : null
    _title : document.title
    _bound : false
    _new : false
    notice : ( msg ) ->
      console.log @_title, document.title
      root = this
      @_new = true
      document.title = "[#{msg}]#{@_title}" 
      if !@_bound
        angular.element( document.getElementsByTagName('body')[0]).bind('click',()->
          if root._new 
            document.title = root._title 
        );
    
  return $notice
)
