"use strict";

var async = require('async'),
    fs = require('fs'),
    grunt = require('grunt'),
    path = require('path');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['include'] = {
    setUp: function(done) {
        // setup here
        done();
    },
    'helper': function(test) {
        var test1 = function (done) {
            var pathDir = path.join(path.dirname(__filename), 'test1'),
                pathResult = path.join(pathDir, 'result.test'),
                pathMain = path.join(pathDir, 'main.test'),
                pathOutDir = path.join(pathDir, 'out'),
                pathOut = path.join(pathOutDir, 'main.test');
            fs.readFile(
                pathResult, 'utf8',
                function (err, result) {
                    if (err) {
                        grunt.warn('Could not read "test1/result.test"');
                        done();
                        return;
                    }

                    grunt.helper(
                        'include',
                        { formats: { '.test': '//\\{include "(.*?)"\\}' },
                          include: ['./'],
                          rules: [{ src: pathMain, dst: pathOutDir }] },
                        function (err) {
                            if (err) {
                                grunt.warn(require('util').inspect(err));
                                done();
                                return;
                            }

                            fs.readFile(pathOut, 'utf8', function (err, out) {
                                if (err) {
                                    grunt.warn('Could not read test1/out/main.test');
                                    done();
                                    return;
                                }

                                test.equal(result, out);
                                done();
                            });
                        }
                    );
                }
            );
        };

        test.expect(1);
        // tests here
        //test.equal(grunt.helper('include'), 'include!!!', 'should return the correct value.');

        var isDone = false,
            queue = async.queue(function (task, done) {
            task(done);
        });
        queue.concurrency = 1;
        queue.drain = function () {
            isDone = true;
            test.done();
        };
        queue.push([
            test1
        ]);

        var wait;
        wait = function () {
            if (!isDone) {
                process.nextTick(wait);
            }
        };
        process.nextTick(wait);
    }
};
