/* 
 * 注册github更新的回调事件
 */
var spawn = require('child_process').spawn;
exports.listen = function( server ){
    server.get('/github/update', handler );
    server.post('/github/update', handler );
}

function handler( req, res ){
    console.log( "github update call.");
    var cmd = spawn('sudo', ['git','pull'], {
        'cwd':'/home/ubuntu/openchat'
    });
        
    cmd.stdout.setEncoding("utf8");
    cmd.stdout.on("data",function(data){
        console.log( "data:", data)
    });
    cmd.stdout.setEncoding("utf8");
    cmd.stderr.on("data",function(err){
        console.log( "err:", err); 
    });
    
    cmd.on("exit",function( code ){
        if( code ==0 ){
            console.log( "git pull success");
            res.set({
                'Content-Type': 'text/html'
            });
            res.send(JSON.stringify({
                message:'git pull success'
            }));
        }else{
            console.log( "git pull failed");
            res.set({
                'Content-Type': 'text/html'
            });
            res.send(JSON.stringify({
                message:'git pull error'
            }));
        }
    })
}


