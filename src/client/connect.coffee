
#service connect. using socket.io  test for watch

angular.module('openchat.service',[])
.service('$connect', () ->
  url = '<%= config.host%>'
  if( typeof( io) == undefined )
    console.log( "socket.io not exist");
    return {};
  
  $connect = {}
  $connect.connect = () ->
    return io.connect url
    
  return $connect
)


