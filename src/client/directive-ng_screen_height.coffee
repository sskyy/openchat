angular.module('openchat.directive').directive('ngScreenHeight',()->
  return ( scope, element, attrs )->
    console.log('directive ngScreenHeight begin', document.body.clientHeight);
    element.css( 'height', "#{document.body.clientHeight-67}px" );
    console.log( element );
)  
