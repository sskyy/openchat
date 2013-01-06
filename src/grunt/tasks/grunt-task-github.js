module.exports = function( grunt ){
    var spawn = require('child_process').spawn;
    var fs = require('fs');
    grunt.registerTask( 'github-commit', function(){
        if( in_array("async", this.args) ){
            //run from command
            var done = this.async();
        }
        commit_pre().done(function(){
            var message = fs.readFileSync('./src/grunt/github.message');
            var command = ['git', ['commit', '-a', '-m', message] ];
        
            var result = spawn( command[0], command[1] );
            result.stdout.setEncoding('utf8');
            result.stdout.on("data", function(data){
                console.log( "commit data", data); 
            });
            result.stderr.setEncoding('utf8');
            result.stderr.on("data", function(err){
                console.log("commit err", err); 
            });
            result.on('exit', function(code){
                if( in_array("push", this.args ) ){
                    commit_after().done();
                }
            });
        });
    });
    
    function commit_pre(){
        var promise = defer();
        //add file first
        var addRes = spawn('git',['add','-f','*']);
        addRes.on('exit', function(code){
            promise.resolve();
        });
        return promise;
    }
    
    function commit_after(){
        console.log( "aa");
        var promise = defer();
        var command = ['git', ['push'] ];
        var result = spawn( command[0], command[1] );
        result.stdout.setEncoding('utf8');
        result.stdout.on('data', function(data){
            console.log('data:', data);
        })
        result.stderr.setEncoding('utf8');
        result.stderr.on('data', function(err){
            console.log('err:', err);
        })
        result.on("exit", function( code){
            console.log("git push finished with code:", code);
        });
        return promise;
    }
    
    function defer(){
        return {
            _data :null,
            _callback : {
                done:null
            },
            resolve : function( data ){
                this._data = data;
                if( this._callback.done ){
                    this._callback.done( data );
                }
            },
            done : function( callback ){
                this._callback.done = callback;
                if( this._data ){
                    callback( this._data );
                }
            }
        }
    }
    
    function in_array( val, arr ){
        for( var i in arr ){
            if( arr[i] == val )
                return true;
        }
        return false;
    }
    
    
}