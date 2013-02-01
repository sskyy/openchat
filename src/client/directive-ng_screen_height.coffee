angular.module('openchat.directive').directive('ngScreenHeight',()->
  return ( scope, element, attrs )->
    console.log('directive ngScreenHeight begin',document.body.offsetHeight);
    element.css( 'height', "#{document.body.offsetHeight-67}px" );
)  
