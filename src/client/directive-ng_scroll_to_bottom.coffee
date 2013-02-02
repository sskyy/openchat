
angular.module('openchat.directive').directive('ngScrollToBottom',()->
  return ( $scope, ele, attr )->
    ele.bind('DOMNodeInserted',( e)->
      if( e.relatedNode == ele[0] )
        console.log( 'begin to scroll')
        window.setTimeout(()->
          ele[0].scrollTop = ele[0].scrollHeight; 
        , 200)
        
    )
)