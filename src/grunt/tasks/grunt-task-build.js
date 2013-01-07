/**
 * grunt task: build-openchat;
 * used to build client/server openchat.js, openchat_runner.html
 */

module.exports = function( grunt ){
    var globalConfig = require('../config.js');
    var fs = require('fs');
    grunt.registerTask("build-openchat", function(){
        if( in_array( 'async',this.args) ){
            var done = this.async();
        }
        
        //generate build/openchat.coffee
        grunt.helper('include', 
            { formats: { 
                    '.js': '//\\{include "(.*?)"\\}',
                    '.html': '<!--\\{include "(.*?)"\\}-->',
                    '.coffee': '#\\{include "(.*?)"\\}'
                },
                include: ['./'],
                rules: [{ src: 'src/client/openchat.coffee', dst: 'build/client/'}] },
            function(err){
                //replace global values
                fs.writeFileSync( 'build/client/openchat.coffee',
                grunt.template.process( fs.readFileSync( 'build/client/openchat.coffee').toString(), globalConfig) )
                
                done && done();
        });
        
        //build openchat_runner.html
        fs.writeFileSync( './build/client/openchat_runner.html',
        grunt.template.process( fs.readFileSync( './src/client/openchat_runner.tpl.html').toString(), globalConfig) )
            
        //build openchat.js
        grunt.task.run('coffee');
    });
    
    
    function coffee_template( coffeeContent ){
        return grunt.template.process( coffee_replace_token( coffeeContent ), globalConfig );
    }
    
    function in_array( val, arr ){
        for( var i in arr ){
            if( arr[i] == val ){
                return true
            }
        }
        return false;
    }
};