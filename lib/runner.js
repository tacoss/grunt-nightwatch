'use strict';

var path = require('path'),
    child_process = require('child_process'),
    byline = require('byline');

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

    function spawnNightwatch(done) {
      var data = JSON.stringify({
        argv: argv,
        group: group,
        settings: settings
      });

      var cmd = [path.join(__dirname, 'background.js'), '--', encodeURIComponent(data)];

      $.verbose.ok('Settings for ' + group.join(', '));
      $.verbose.writeln(JSON.stringify(settings));

      if (child) {
        child.kill();
      }

      child = child_process.spawn('node', cmd);
      child.on('exit', done);
      child.stdout.pipe(process.stdout);
      byline(child.stderr).on('data', function(line) {
        var err = line.toString();
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
      if (options.standalone) {
        if (!settings.selenium) {
          settings.selenium = {};
        }

        settings.selenium.start_process = true;
        settings.selenium.server_path = settings.selenium.server_path || options.jar_path;
      }

      spawnNightwatch(finishHandler);
    }

    if (options.standalone) {
      if (options.jar_path && $.exists(options.jar_path)) {
        $.verbose.ok('Using Selenium from ' + options.jar_path);
        runTests();
      } else {
        var v = (options.jar_version || '').split('.'),
            url = options.jar_url.replace(/\{x\}/g, v[0]).replace(/\{y\}/g, v[1]).replace(/\{z\}/g, v[2]),
            jar = options.jar_path || $.tmpfile(url);

        if (!$.opts('force') && $.exists(jar)) {
          $.verbose.ok('Using already downloaded Selenium from ' + jar);
          options.jar_path = jar;
          runTests();
        } else {
          $.log.warn('Selenium is missing and now is downloading. If it fails, run this task with --force again.');
          $.verbose.ok('Downloading Selenium from ' + url + ' to ' + jar);
          $.log.write('Please wait ... ');

          $.downloadHelper(url, jar, function() {
            $.log.writeln('DONE');

            options.jar_path = jar;

            runTests();
          });
        }
      }
    } else {
      runTests();
    }
  };
};
