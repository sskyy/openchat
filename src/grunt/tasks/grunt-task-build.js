/**
 * grunt task: build-openchat;
 * used to build client/server openchat.js, openchat_runner.html
 */

module.exports = function( grunt ){
    var globalConfig = require('../config.js');
    var async = require('async');
    var coffee = require('coffee-script');
    grunt.registerTask("build-openchat", function(){
        if( grunt.utils._.indexOf( this.args, 'async') != -1 ){
            var done = this.async();
        }
        async.parallel([function( counter ){
            //generate build/openchat.js
            build_openchat_js(function(){
                counter()
            })    
        },function( counter ){
            //build openchat_runner.html
            build_openchat_runner(function(){
                counter()
            })
        }],function(){
            done&&done()
        })
    });
    
    function build_openchat_coffee( callback ){
        console.log('beging to build openchat.coffee');
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
                console.log( 'build openchat.coffee finished.')
                //replace global values
                var coffeeFile = grunt.file.read( 'build/client/openchat.coffee');
                
                var buildFns = [];
                var build = Date.parse( new Date())
                grunt.utils._.each( globalConfig,function(config, type){
                    console.log( config );
                    buildFns.push( function( counter ){
                        grunt.file.write( 'build/client/openchat-'+type+'.coffee',
                            grunt.template.process( coffeeFile, {_openchat_build:build, config:config}) )
                        console.log("finished openchat-"+type+".coffee")
                        counter();
                    })
                });
                async.parallel( buildFns, function(){
                    var httpOptions = {
                            host : globalConfig.developement.host,
                            path : '/build_spy/set_build?build='+build,
                            port : globalConfig.developement.port,
                            method : 'GET',
                            headers: {
                                'Content-Length': 0
                            }
                        }
                        console.log("sending build to",globalConfig.developement.host, build);
                    var http = require("http")
                    var req = http.request(httpOptions, function(res) {
                    });
                    req.end();
                    req.on('error', function(e) {
                        console.error(e);
                    });
                    callback&&callback( err );
                });
        });
    }
    
    //TODO :compile coffee
    function build_openchat_js( callback ){
        build_openchat_coffee(function(){
            console.log('beging to compile openchat.coffee');
            grunt.utils._.each( globalConfig,function(  config, type){
                grunt.file.write( 'build/client/openchat-'+type+'.js', 
                    coffee.compile( grunt.file.read('build/client/openchat-'+type+'.coffee')))
            })
            console.log('finished compile openchat.coffee');
            callback&&callback();
        })
    }
    
    function build_openchat_runner( callback ){
        //build openchat_runner.html
        grunt.helper('include', 
            { formats: { 
                    '.html': '<!--\\{include "(.*?)"\\}-->'
                },
                include: ['./'],
                rules: [{ src: 'src/client/openchat_runner.tpl.html', dst: 'build/client/'}] },
            function(err){
                    
                var buildFns = [];
                var runnerHtml = grunt.file.read( './build/client/openchat_runner.tpl.html')
                grunt.utils._.each( globalConfig,function(  config, type){
                    buildFns.push( function(){
                        grunt.file.write( 'build/client/openchat_runner-'+type+'.html',
                            grunt.template.process( runnerHtml, {config:config, type:type}) )
                    })
                });
                async.parallel( buildFns, function(){
                    callback&&callback( err );
                });
        });
    }
    
    grunt.registerTask("build-openchat-all", function(){
        if( grunt.utils._.indexOf( this.args, 'async') !== -1 ){
            var done = this.async();
        }
        build_openchat_js(function(){
            //连接angular.js  build好的openchat.js 编译好的initialize文件
            var buildFns = [];
            var angularMin = grunt.file.read('src/client/angular.min.js');
            var initializeJs = coffee.compile( grunt.file.read('src/client/initialize.coffee'));
            grunt.utils._.each( globalConfig,function(  config, type ){
                buildFns.push( function( counter ){
                    var content = [angularMin,
                        grunt.file.read('build/client/openchat-'+type+'.js'),
                        grunt.template.process( initializeJs, {config:config})]
                    
                    grunt.file.write( 'build/client/openchat-all-'+type+'.js', content.join(';\n') );
                    counter()
                })
            });
            async.parallel( buildFns, function(){
                done&&done();
            });
        });
    })
    
    grunt.registerTask("build-template", function(){
        grunt.file.write('build/client/openchat.tpl.html',grunt.file.read('src/client/openchat.tpl.html'))
    })
    
    
};