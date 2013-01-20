module.exports = function(grunt) {
    var fs = require('fs');
    var spawn = require("child_process").spawn;
    var globalConfig = require("./src/grunt/config.js");
    var os = require("os");
    
    // Project configuration.
    grunt.initConfig({
        watch: {
//            src : {
//                files : ['src/client/*.coffee','src/client/*.html','src/config.js'],
//                tasks : ['build-openchat']
//            },
            github : {
                files : ['src/grunt/github.message'],
                tasks : ['github-commit:push']
            },
            all_in_one : {
                files : ['src/client/*','src/server/*','src/grunt/config.js','src/grunt/config_local.js'],
                tasks : ['build-openchat-all']
            },
            css : {
                files : ['src/client/css/openchat.less'],
                tasks : ['less']
            },
            template : {
                files : ['src/client/openchat.tpl.html'],
                tasks : ['build-template']
            }
        },
        jsdoc : {
            dist : {
                src: ['src/*.js', 'test/*.js'], 
                dest: 'doc'
            }
        },
        less: {
            development: {
//                options: {
//                    paths: ["assets/css"]
//                },
                files: {
                    "build/client/css/openchat.css": "src/client/css/openchat.less"
                }
            }
        }
    });
    
    grunt.loadTasks('./src/grunt/tasks');
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-include");
    
};
