
#service connect. using socket.io 

angular.module('openchat.service',[])
.service('$connect', () ->
  url = '<%= config.host%>/chat'
  if( typeof( io) == undefined )
    console.log( "socket.io not exist");
    return {};
  
  $connect = {}
  $connect.connect = () ->
    return io.connect url
    
  return $connect
)


