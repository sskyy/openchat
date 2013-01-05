/* 
 * 注册github更新的回调事件
 */
var spawn = require('child_process').spawn;
exports.listen = function( server ){
    server.handlers.POST.registerPath.call(server.handlers.POST,"/github/update", function( req, res ){
        console.log( "github update call.");
        var cmd = spawn('sudo', ['git','pull'], {'cwd':'/opt/openchat'});
        
        cmd.stdout.on("data",function(data){
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(JSON.stringify({
                message:'git pull success'
            }));
            res.end()
        });
    
        cmd.on("exit",function( code ){
            if( code ==0 ){
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write(JSON.stringify({
                    message:'git pull success'
                }));
                res.end()
            }else{
                res.writeHead(500, {
                    'Content-Type': 'text/html'
                });
                res.write(JSON.stringify({
                    message:'git pull error'
                }));
                res.end()
            }
        })
    })
    server.handlers.GET.registerPath.call(server.handlers.GET,"/github/update", function( req, res ){
        console.log( "github update call.");
        var cmd = spawn('sudo', ['git','pull'], {'cwd':'/opt/openchat'});
        
        cmd.stdout.on("data",function(data){
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(JSON.stringify({
                message:'git pull success'
            }));
            res.end()
        });
    
        cmd.on("exit",function( code ){
            if( code ==0 ){
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write(JSON.stringify({
                    message:'git pull success'
                }));
                res.end()
            }else{
                res.writeHead(500, {
                    'Content-Type': 'text/html'
                });
                res.write(JSON.stringify({
                    message:'git pull error'
                }));
                res.end()
            }
        })
    })
}


