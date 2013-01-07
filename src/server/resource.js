exports.listen = function( server ){
    server.get('/resource/json', json_handler );
    server.post('/resource/json', json_handler );
    server.get('/*', resource_handler );
}

var fs = require("fs");

function json_handler( req, res ){
    if( 'resource' in req.query ){
        if( !fs.existsSync( req.query.resource)){
            res.jsonp(500,{})
        }
        
        var minify = require('html-minifier');
        var resourceContent = fs.readFileSync( req.query.resource ).toString();
        if(/\.html$/.test(req.query.resource)){
            resourceContent = minify.minify( resourceContent,{
                collapseWhitespace: true
            } )
        }
        
        res.set({
            'Content-Type': 'text/javascript'
        });
        res.jsonp( 200, resourceContent );
    }
}

function resource_handler( req, res ){
    var path = './' + req.path;
    if( fs.existsSync(  path + "/index.html" ) ){
        res.sendfile( path + '/index.html')
    }else{
        fs.exists( path, function( exists ){
            if( !exists ){
                res.end();
            }
            fs.stat( path , function( err, stat ){
                if( err ){
                    return ;
                }
                
                if( stat.isDirectory() ){
                    send_directory( req ,res)
                }else if( stat.isFile() ){
                    res.sendfile( path );
                }
            })
        })
    }
}

function send_directory( req ,res ){
    fs.readdir( './' + req.path, function(err, files) {
        if (err){
            console.log( err );
            return;
        }
        
        if (!files.length)
            return writeDirectoryIndex(req, res, []);

        var remaining = files.length;
        files.forEach(function(fileName, index) {
            fs.stat( './' +req.path + '/' + fileName, function(err, stat) {
                if (err){
                    console.log("read file error",err, remaining);
                    return;
                } 
                if ( stat.isDirectory()) {
                    files[index] = fileName + '/';
                }
                if (!(--remaining))
                    return writeDirectoryIndex( req, res, files);
            });
        });
    });
    return 
}

function writeDirectoryIndex(req, res,  files) {
    res.set({
        'Content-Type': 'text/html'
    });
    var content = '<!doctype html>\n' +
        '<title>' + escapeHtml(req.path) + '</title>\n' +
        '<style>\n' +
        '  ol { list-style-type: none; font-size: 1.2em; }\n' +
        '</style>\n' +
        '<h1>Directory: ' + escapeHtml(req.path) + '</h1>' +
        '<ol>';
        
    files.forEach(function(fileName) {
        if (fileName.charAt(0) !== '.') {
            content += '<li><a href="' + req.path + '/' +
                escapeHtml(fileName) + '">' +
                escapeHtml(fileName) + '</a></li>';
        }
    });
    content += '</ol>' ;
    res.send( content );
};




function escapeHtml(value) {
    return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
}