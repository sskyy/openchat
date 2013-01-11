/**
 * grunt task: build-openchat;
 * used to build client/server openchat.js, openchat_runner.html
 */

module.exports = function( grunt ){
    var globalConfig = require('../config.js');
    var globalConfigLocal = require('../config_local.js');
    var fs = require('fs');
    grunt.registerTask("build-openchat", function(){
        if( in_array( 'async',this.args) ){
            var done = this.async();
            var asyncTasks = ['openchat.coffee','openchat_runner.html'];
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
                var coffeeFile = fs.readFileSync( 'build/client/openchat.coffee').toString();
                fs.writeFileSync( 'build/client/openchat.coffee',
                grunt.template.process( coffeeFile, globalConfig) )
                
                fs.writeFileSync( 'build/client/openchat_local.coffee',
                grunt.template.process( coffeeFile, globalConfigLocal ) )
                if( done ){
                    asyncTasks.splice(0,1)
                    asyncTasks.length == 0 &&done()
                }
        });
        
        //build openchat_runner.html
        grunt.helper('include', 
            { formats: { 
                    '.html': '<!--\\{include "(.*?)"\\}-->'
                },
                include: ['./'],
                rules: [{ src: 'src/client/openchat_runner.tpl.html', dst: 'build/client/'}] },
            function(err){
                //replace global values
                fs.writeFileSync( './build/client/openchat_runner.html',
                    grunt.template.process( fs.readFileSync( './build/client/openchat_runner.tpl.html').toString(), globalConfig) )

                //build openchat_runner_local.html
                fs.writeFileSync( './build/client/openchat_runner_local.html',
                    grunt.template.process( fs.readFileSync( './build/client/openchat_runner.tpl.html').toString(), globalConfigLocal) )
                if( done ){
                    asyncTasks.splice(0,1)
                    asyncTasks.length == 0 &&done() 
                }
        });
    });
    
    grunt.registerTask("build-openchat-all", function(){
        if( in_array( 'async',this.args) ){
            var done = this.async();
        }
        
        //generate build/openchat.coffee
        grunt.helper('include', 
            { formats: { 
                    '.js': '//\\{include "(.*?)"\\}'
                },
                include: ['./','build/client/'],
                rules: [{ src: 'src/client/openchat-all.js', dst: 'build/client/'}] },
            function(err){
                done && done();
        });
    })
    
    function in_array( val, arr ){
        for( var i in arr ){
            if( arr[i] == val ){
                return true
            }
        }
        return false;
    }
    
};