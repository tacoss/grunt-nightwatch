'use strict';

var path = require('path'),
    child_process = require('child_process');

module.exports = function(grunt) {
  var $ = require('./functions')(grunt),
      _ = grunt.util._;

  var argv = _.pick($.opts(), 'tag', 'test', 'filter', 'verbose', 'group', 'skipgroup');

  return function(group, options, settings, doneCallback) {
    var child;

    process.on('SIGINT', function() {
      if (child) {
        child.kill();
      }
    });

    var data = JSON.stringify({
      argv: argv,
      group: group,
      settings: settings
    });

    function spawnNightwatch(done) {
      var cmd = ['node', path.join(__dirname, 'background.js'), '--', "'" + data + "'"];

      if (child) {
        child.kill();
      }

      child = child_process.exec(cmd.join(' '), function() {
        // do nothing
      });

      child.on('exit', done);
      child.stdout.pipe(process.stdout);
      child.stderr.on('data', function(err) {
        if (err.indexOf('Error:') > -1) {
          err = err.match(/Error:\s*(.*?)\n/)[1];
        }

        done(err);
      });
    }

    function finishHandler(err) {
      if (err && typeof err !== 'number') {
        $.log.error(err);
      }

      doneCallback(!err);
    }

    // nightwatch-runner
    function runTests() {
      var selenium = require($.nightwatchDirectory('lib/runner/selenium.js'));

      var setup = $.mergeVars({}, settings);

      if (options.standalone) {
        if (!setup.selenium) {
          setup.selenium = {};
        }

        setup.selenium.cli_args = {};
        setup.selenium.start_process = true;
        setup.selenium.server_path = options.jar_path;

        if (options.chrome_driver_path) {
          setup.selenium.cli_args['webdriver.chrome.driver'] = options.chrome_driver_path;
        }

        if (options.ie_driver_path) {
          setup.selenium.cli_args['webdriver.ie.driver'] = options.ie_driver_path;
        }
      }

      if (setup.selenium.start_process) {
        selenium.startServer(setup, function(err, child, error_out, exitcode) {
          if (err) {
            $.log.error('There was an error while starting the Selenium server:');
            $.log.writeln(error_out);

            return finishHandler(err, exitcode);
          }

          spawnNightwatch(function(err) {
            selenium.stopServer();
            finishHandler(err);
          });
        });
      } else {
        spawnNightwatch(finishHandler);
      }
    }

    if (options.standalone) {
      if (options.jar_path) {
        $.verbose.ok('Using Selenium from ' + options.jar_path);
        runTests();
      } else {
        var seleniumJar = $.tmpfile(options.jar_url);

        if (!$.opts('force') && $.exists(seleniumJar)) {
          $.verbose.ok('Using already downloaded Selenium from ' + seleniumJar);
          options.jar_path = seleniumJar;
          runTests();
        } else {
          $.log.warn('Selenium is missing and now is downloading. If it fails, run this task with --force again.');
          $.verbose.ok('Downloading Selenium from ' + options.jar_url);
          $.log.write('Please wait ... ');

          $.downloadHelper(options.jar_url, seleniumJar, function() {
            $.log.writeln('DONE');

            options.jar_path = seleniumJar;

            $.verbose.ok('Saved file ' + seleniumJar);
            runTests();
          });
        }
      }
    } else {
      runTests();
    }
  };
};
