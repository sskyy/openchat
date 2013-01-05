module.exports = function(grunt) {
    var fs = require('fs');
    var spawn = require("child_process").spawn;
    var globalConfig = require("./src/config.js");
    var path = require('path');
    
    // Project configuration.
    grunt.initConfig({
        meta: {
            version: '0.1.0',
            banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://PROJECT_WEBSITE/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'YOUR_NAME; Licensed MIT */'
        },
        lint: {
            files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
        },
        qunit: {
            files: ['test/**/*.html']
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/FILE_NAME.min.js'
            }
        },
        watch: {
            src : {
                files : ['src/client/*.coffee','src/client/*.html'],
                tasks : ['build-openchat']
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {}
        },
        uglify: {}
    });
    
    grunt.registerTask("build-openchat", function(){
        //concat coffee file
        var files = ['src/client/connect.coffee',
            'src/client/user.coffee',
            'src/client/page_feature.coffee',
            'src/client/events.coffee',
        ];
        var openchatFileContent = concat( files, coffee_template );
//        var openchatFileContent = concat( files);
        fs.writeFileSync('src/client/openchat.coffee', openchatFileContent, 'utf8' );
        
        //build openchat.js!
        console.log( path.dirname('./'));
        spawn("coffee",['-c','./src/client/openchat.coffee']);
        
        //build openchat_runner.html
        fs.writeFileSync( './src/client/openchat_runner.html',
            grunt.template.process( fs.readFileSync( './src/client/openchat_runner.tpl.html'), globalConfig) )
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
