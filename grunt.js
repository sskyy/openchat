module.exports = function(grunt) {
    var fs = require('fs');
    var spawn = require("child_process").spawn;
    var globalConfig = require("./src/config.js");
    var os = require("os");
    
    // Project configuration.
    grunt.initConfig({
        watch: {
            src : {
                files : ['src/client/*.coffee','src/client/*.html','src/config.js'],
                tasks : ['build-openchat']
            }
        },
        coffee : {
            compile:{
                files:{
                    './build/client/openchat.js':['./build/client/openchat.coffee']
                }
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-contrib-coffee");
    
    grunt.registerTask("build-openchat", function(){
        //concat coffee file
        var files = ['src/client/connect.coffee',
        'src/client/user.coffee',
        'src/client/page_feature.coffee',
        'src/client/events.coffee',
        ];
        var openchatFileContent = concat( files, coffee_template );
        fs.writeFileSync('build/client/openchat.coffee', openchatFileContent, 'utf8' );
        
        //build openchat_runner.html
        fs.writeFileSync( './build/client/openchat_runner.html',
            grunt.template.process( fs.readFileSync( './src/client/openchat_runner.tpl.html').toString(), globalConfig) )
            
        //build openchat.js
        grunt.task.run('coffee');
         
    //ÉÏ´«µ½github
    });
    
    grunt.registerTask('github-add', function(){
        var root = this;
        var done = root.async();
        //add file first
        var addRes = spawn('git',['add','-f','*']);
        addRes.on('exit', function(code){
            done();
        });
    });
    
    grunt.registerTask( 'github-commit', function(  ){
        var root = this;
        var done = root.async();
        
        grunt.task.run('github-add');
        
        var message = fs.readFileSync('./src/github.message');
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
            console.log('git commit leave with code', code);
            if(code !=0 || this.args==[]){
                done();
            }
            console.log( "aaa");
            grunt.task.run( 'github-push' );
        });
    });
    
    grunt.registerTask('github-push', function(){
        var root = this;
        var done = root.async();
        var command = ['git', ['push'] ];
        //        if( /^win/.test( os.platform() ) ){
        //            command = ['cmd', ['git', 'push']]
        //        }
        console.log( "data" );
        var result = spawn( command[0], command[1] );
        result.stdout.setEncoding('utf8');
        console.log( "data" );
        result.stdout.on('data', function(data){
            console.log('data:', data);
        })
        result.stderr.setEncoding('utf8');
        result.stderr.on('data', function(err){
            console.log('errr:', err);
        })
        result.on("exit", function( code){
            console.log("git push finished with code:", code);
            done();
        });
    })
    
    function coffee_template( coffeeContent ){
        return grunt.template.process( coffee_replace_token( coffeeContent ), globalConfig );
    }
    
    function coffee_replace_token( content ){
        return content;
    }
  
    function concat( files, walk ){
        var output = "";
        for( var i in files ){
            output += walk ? walk( fs.readFileSync( files[i], 'utf8' ) ) : fs.readFileSync( files[i], 'utf8' )
        }
        return output;
    }
  
  
    // Default task.
    grunt.registerTask('default', 'lint qunit concat min');
};
