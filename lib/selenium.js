module.exports = function(grunt) {
  var $ = require('./functions')(grunt),
      _ = grunt.util._;

  return function(group, options, settings, doneCallback) {
    function finishHandler(err, status) {
      if (err) {
        if (err.message) {
          $.log.error(err.message);
        } else {
          $.log.error(_.isString(err) ? err : 'There was an error while running the test.');
        }
      }

      doneCallback(err);
    }

    // nightwatch-runner
    function runTests() {
      function expandSettings() {
        var target = $.mergeVars({}, settings);

        if (options.standalone) {
          if (!target.selenium) {
            target.selenium = {};
          }

          target.selenium.cli_args = {};
          target.selenium.start_process = true;
          target.selenium.server_path = options.jar_path;

          if (options.chrome_driver_path) {
            target.selenium.cli_args['webdriver.chrome.driver'] = options.chrome_driver_path;
          }

          if (options.ie_driver_path) {
            target.selenium.cli_args['webdriver.ie.driver'] = options.ie_driver_path;
          }
        }

        return target;
      }

      var selenium = require($.nightwatchDirectory('lib/runner/selenium.js')),
          runner = $.nightwatchDirectory('lib/runner/run.js'),
          setup = expandSettings();

      var config = {
        output_folder: setup.output_folder,
        selenium: setup.selenium
      };

      var subtasks = [];

      _.each(group, function(name) {
        subtasks.push(function(next) {
          $.log.subhead('Executing "' + name + '" tests');

          $.verbose.ok('Target settings');
          $.verbose.writeln(JSON.stringify(setup.test_settings[name]));

          require(runner).run(setup.src_folders, setup.test_settings[name], config, function(err) {
            delete require.cache[runner];
            next(err);
          });
        });
      });

      function runAll(done) {
        $.runTasks(subtasks, function(err) {
          done(err);
        });
      }

      if (setup.selenium.start_process) {
        selenium.startServer(setup, function(err, child, error_out, exitcode) {
          if (err) {
            $.log.error('There was an error while starting the Selenium server:');
            $.log.writeln(error_out);

            return finishHandler(err, exitcode);
          }

          runAll(function(err) {
            selenium.stopServer();
            finishHandler(err);
          });
        });
      } else {
        runAll(finishHandler);
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

            process.nextTick(function() {
              $.verbose.ok('Saved file ' + seleniumJar);
              runTests();
            });
          });
        }
      }
    } else {
      runTests();
    }
  };
};
