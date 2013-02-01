angular.module('openchat.directive').directive('ngScreenHeight',()->
  return ( scope, element, attrs )->
    console.log('directive ngScreenHeight begin',document.documentElement.clientHeight );
    element.css( 'height', "#{document.documentElement.clientHeight-67}px" );
)  
