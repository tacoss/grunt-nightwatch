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
      process.exit(status || (err ? 1 : 0));
    }

    // nightwatch-runner
    function runTests() {
      function expandSettings() {
        var target = $.mergeVars({}, settings);

        if (options.standalone) {
          if (!target.selenium) {
            target.selenium = {};
          }

          target.selenium.start_process = true;
          target.selenium.server_path = options.jar_path;
        }

        //$.verbose.ok('Target settings');
        //$.verbose.writeln(JSON.stringify(target.test_settings[group]));

        return target;
      }

      var CliRunner = require($.nightwatchDirectory('bin/_clirunner.js')),
          runner = new CliRunner({});

      runner.test_settings = settings.test_settings;
      runner.output_folder = settings.output_folder;
      runner.settings = settings;
      runner.argv = {};

      if (group.length > 1) {
        runner.setupParallelMode(group);
      } else {
        runner.setTestSettings(group[0]);
      }

      runner.runTests();

      /*var runner = require($.nightwatchDirectory('lib/runner/run.js')),
          setup = expandSettings();

      var config = {
        output_folder: setup.output_folder,
        selenium: setup.selenium
      };

      if (setup.selenium.start_process) {
        var selenium = require($.nightwatchDirectory('lib/runner/selenium.js'));

        selenium.startServer(setup, function(err, child, error_out, exitcode) {
          if (err) {
            $.log.error('There was an error while starting the Selenium server:');
            $.log.writeln(error_out);

            finishHandler(err, exitcode);
          }

          $.log.ok('Executing "' + group + '" tests (standalone)');

          runner.run(setup.src_folders, setup.test_settings[group], config, function(err) {
            selenium.stopServer();
            finishHandler(err);
          });
        });
      } else {
        $.log.ok('Executing "' + group + '" tests (standard)');
        runner.run(setup.src_folders, setup.test_settings[group], config, function(err) {
          finishHandler(err);
        });
      }*/
    }

    if (options.standalone) {
      if ($.exists(options.jar_path)) {
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
