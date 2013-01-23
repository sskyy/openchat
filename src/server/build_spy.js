exports.listen = function( server ){
    var build
    server.get('/build_spy/get_build', function( req, res){
        res.jsonp( {build:build} );
    });
    
    server.get('/build_spy/set_build', function(req, res){
        console.log('set build',req.query.build );
        build = req.query.build;
        res.end()
    });
}

