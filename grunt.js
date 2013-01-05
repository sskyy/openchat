module.exports = function(grunt) {
    var fs = require('fs');
    var spawn = require("child_process").spawn;
    var globalConfig = require("./src/config.js");
    
    // Project configuration.
    grunt.initConfig({
        watch: {
            src : {
                files : ['src/client/*.coffee','src/client/*.html','src/config.js'],
                tasks : ['build-openchat', 'coffee']
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
    });
    
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
