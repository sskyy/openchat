/* 
 * 注册github更新的回调事件
 */
var spawn = require('child_process').spawn;
exports.listen = function( server ){
    server.handlers.POST.registerPath.call(server.handlers.POST,"/github/update", handler)
    server.handlers.GET.registerPath.call(server.handlers.GET,"/github/update", handler)
}

function handler( req, res ){
    console.log( "github update call.");
    var cmd = spawn('sudo', ['git','pull'], {
        'cwd':'/home/ubuntu/openchat'
    });
        
    cmd.stdout.setEncoding("ASCII");
    cmd.stdout.on("data",function(data){
        console.log( "data:", data)
    });
    cmd.stdout.setEncoding("ASCII");
    cmd.stderr.on("data",function(err){
        console.log( "err:", err); 
    });
    
    cmd.on("exit",function( code ){
        if( code ==0 ){
            console.log( "git pull success");
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(JSON.stringify({
                message:'git pull success'
            }));
            res.end()
        }else{
            console.log( "git pull failed");
            res.writeHead(500, {
                'Content-Type': 'text/html'
            });
            res.write(JSON.stringify({
                message:'git pull error'
            }));
            res.end()
        }
    })
}


