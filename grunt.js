module.exports = function(grunt) {
    var fs = require('fs');
    var spawn = require("child_process").spawn;
    var globalConfig = require("./src/grunt/config.js");
    var os = require("os");
    
    // Project configuration.
    grunt.initConfig({
//        concat:{
//            openchat :{
//                src : ['src/client/connect.coffee',
//                'src/client/user.coffee',
//                'src/client/page_feature.coffee',
//                'src/client/events.coffee',
//                ],
//                dest : 'build/client/openchat.coffee'
//            }
//        },
        watch: {
            src : {
                files : ['src/client/*.coffee','src/client/*.html','src/config.js'],
                tasks : ['build-openchat']
            },
            github : {
                files : ['src/grunt/github.message'],
                tasks : ['github-commit:push']
            }
        },
        coffee : {
            compile:{
                files:{
                    './build/client/openchat.js':['./build/client/openchat.coffee']
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['src/*.js', 'test/*.js'], 
                dest: 'doc'
            }
        }
    });
    
    grunt.loadTasks('./src/grunt/tasks');
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-include");
    
};
