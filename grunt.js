module.exports = function(grunt) {
    var fs = require('fs');
    var spawn = require("child_process").spawn;
    var globalConfig = require("./src/grunt/config.js");
    var os = require("os");
    
    // Project configuration.
    grunt.initConfig({
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
        }
    });
    
    grunt.loadTasks('./src/grunt/tasks');
    grunt.loadNpmTasks("grunt-contrib-coffee");
    
};
