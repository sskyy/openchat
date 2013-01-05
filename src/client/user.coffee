
#user main file

angular.module('openchat.service').service('$user', ()->

  $user = {};
  $user.auto_detect = () ->
    console.log 'auto detect user'
  
  return $user;
  
)