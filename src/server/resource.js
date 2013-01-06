exports.listen = function( server ){
    server.handlers.POST.registerPath.call(server.handlers.POST,"/resource/jsonp", handler)
    server.handlers.GET.registerPath.call(server.handlers.GET,"/resource/jsonp", handler)
}

function handler( req, res ){
    if( 'resource' in req.url.query ){
        var fs = require("fs");
        var minify = require('html-minifier');
        var resourceContent = fs.readFileSync( req.url.query.resource ).toString();
        if(/\.html$/.test(req.url.query.resource)){
            resourceContent = minify.minify( resourceContent,{ collapseWhitespace: true} )
        }
        if( 'callback' in req.url.query ){
            resourceContent = req.url.query.callback + "('" + resourceContent + "')";
        }
        res.writeHead(200, {
            'Content-Type': 'text/javascript'
        });
        res.write( resourceContent );
        res.end();
    }else{
        res.end();
    }
}


