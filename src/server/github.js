/* 
 * 注册github更新的回调事件
 */
var spawn = require('child_process').spawn;
exports.bind = function( server ){
    server.handlers.POST.registerPath("github/update", function( req, res ){
        console.log( "github update call.");
        var cmd = spawn('cmd', ['/opt/openchat','sudo git pull']);
        cmd.stderr.on("data", function( data  ){
            console.log( "github pull err", data );
        })
    })
}


