module.exports = function(grunt) {
  grunt.registerTask('nightwatch', 'Run your Nightwatch.js tests', function(target) {
    var doneCallback = this.async();

    var slice = Array.prototype.slice,
        path = require('path'),
        fs = require('fs'),
        _ = grunt.util._;

    function replaceEnv(value) {
      if ('string' === typeof value) {
        return value.replace(/\$\{(\w+)\}/g, function(match, key) {
          return process.env[key] || match;
        });
      }

      return value;
    }

    function parseCliOptions() {
      return _.omit(grunt.cli.options, ['tasks', 'npm']);
    }

    function mergeVars(target) {
      var args = slice.call(arguments, 1);

      if (!target) {
        target = {};
      }

      _.each(args, function(source) {
        _.each(source, function(value, key) {
          if (!_.isArray(value) && _.isObject(value)) {
            target[key] = mergeVars(target[key], value);
          } else {
            target[key] = replaceEnv('undefined' === typeof value ? target[key] : value);
          }
        });
      });

      return target;
    }

    var options = this.options({
      jar_url: 'http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar',
      jar_path: '/opt/selenium/server-standalone.2.40.0.jar',
      standalone: false
    });

    var defaults = {
      settings: {
        src_folders: ['tests'],
        output_folder: 'reports',
      },
      selenium: { log_path: '' },
      test_settings: { silent: true },
      desiredCapabilities: {},
      screenshots: {}
    };

    var group = target || 'default',
        settings_json = process.cwd() + '/nightwatch.json',
        deprecated_settings_json = process.cwd() + '/settings.json',
        fake_opts = ['standalone', 'jar_path', 'jar_url'];

    // apply the default options
    var settings = mergeVars({}, defaults.settings);

    // extend selenium options before anything!
    mergeVars(settings, _.pick(defaults, 'selenium'));

    // load nightwatch.json file
    if (fs.existsSync(settings_json)) {
      mergeVars(settings, grunt.file.readJSON(settings_json));
    } else if (fs.existsSync(deprecated_settings_json)) {
      mergeVars(settings, grunt.file.readJSON(deprecated_settings_json));
    }

    // extend settings using task and target options
    mergeVars(settings, options.settings, (options[group] || {}).settings);

    if ('object' !== typeof settings.test_settings) {
      settings.test_settings = {};
    }

    if ('object' !== typeof settings.test_settings[group]) {
      settings.test_settings[group] = {};
    }

    // extend active target with global defaults
    mergeVars(settings.test_settings[group],
      _.pick(defaults, 'screenshots', 'desiredCapabilities'),
      _.pick(settings, 'custom_commands_path', 'custom_assertions_path'));

    // load the target options with the global and target defaults
    mergeVars(settings.test_settings[group],
      defaults.test_settings,
      options.test_settings,
      _.omit(options[group] || {}, fake_opts));

    // override the global task options if needed
    mergeVars(options, _.pick(options[group] || {}, fake_opts));

    // override some global options if needed
    mergeVars(settings,
      _.pick(settings.test_settings[group], ['src_folders', 'output_folder']))

    grunt.verbose.ok('Task options');
    grunt.verbose.writeln(JSON.stringify(options));

    // download utility
    var http = require('http'),
        url = require('url');

    // https://github.com/dcodeIO/ClosureCompiler.js/blob/master/scripts/configure.js
    function download(downloadUrl, filename, callback, ondata) {
      var URL = url.parse(downloadUrl);

      var out = fs.createWriteStream(filename, { flags: 'w', encoding: null, mode: 0666 }),
          bytes = 0, total = -1,
          req;

      req = http.request({ hostname: URL.host, method: 'GET', path: URL.path, agent: false }, function(res) {
        if (res.headers['content-length']) {
          total = parseInt(res.headers['content-length'], 10);
        }

        if (res.statusCode != 200) {
          res.setEncoding(null);
          callback(new Error('Download failed: HTTP status code ' + res.statusCode), -1);
          return;
        }

        res.on('data', function(chunk) {
          bytes += chunk.length;
          out.write(chunk);
        });

        res.on('end', function() {
          callback(null, bytes);
        });
      });

      req.on('error', function(e) {
        callback(e, -1);
      });

      req.end();
    }

    function errorHandler(err) {
      if (err) {
        grunt.log.writeln('FAIL');

        if (err.message) {
          grunt.log.error(err.message);
        } else {
          grunt.log.error('There was an error while running the test.');
        }

        doneCallback(false);
      }
    }

    // nightwatch-runner
    function runTests(params) {
      function expandSettings(options) {
        var target = mergeVars({}, settings);

        if (options.standalone) {
          if (!target.selenium) {
            target.selenium = {};
          }

          target.selenium.start_process = true;
          target.selenium.server_path = options.jar_path;
        }

        grunt.verbose.ok('Target settings');
        grunt.verbose.writeln(JSON.stringify(target.test_settings[group]));

        return target;
      }

      // https://github.com/beatfactor/nightwatch/blob/master/bin/runner.js
      var nw_dir = path.dirname(__dirname) + '/node_modules/nightwatch',
          runner = require(nw_dir + '/lib/runner/run.js'),
          setup = expandSettings(params);

      var config = {
        output_folder: setup.output_folder,
        selenium: setup.selenium
      };

      grunt.log.ok('Executing "' + group + '" tests');

      var cliOpts = parseCliOptions();

      // adding ability to run a single test via --test cli argument
      if (cliOpts.test) {
        var testsource = (cliOpts.test.indexOf(process.cwd()) === -1) ? path.join(process.cwd(), cliOpts.test) : cliOpts.test;
        fs.statSync(testsource);
        setup.src_folders = testsource;
      }

      if (setup.selenium.start_process) {
        var selenium = require(nw_dir + '/lib/runner/selenium.js');

        selenium.startServer(setup, setup.test_settings[group], function(error, child, error_out, exitcode) {
          if (error) {
            grunt.log.writeln('FAIL');
            grunt.log.error('There was an error while starting the Selenium server:');
            grunt.log.writeln(error_out);
            process.exit(exitcode);
          }

          runner.run(setup.src_folders, setup.test_settings[group], config, function(err) {
            selenium.stopServer();
            errorHandler(err);
          });
        });
      } else {
        runner.run(setup.src_folders, setup.test_settings[group], config, function(err) {
          errorHandler(err);
        });
      }
    }

    // if enabled, there are two scenarios:
    // - jar_path exists, then use it
    // - jar_path doesn't exists, then download jar_url

    if (options.standalone) {
      if (fs.existsSync(options.jar_path)) {
        grunt.verbose.ok('Using Selenium from ' + options.jar_path);
        runTests(options);
      } else {
        var seleniumJar = path.dirname(__dirname) + '/' + path.basename(options.jar_url);

        if (!grunt.cli.options.force && fs.existsSync(seleniumJar)) {
          grunt.verbose.ok('Using already downloaded Selenium from ' + seleniumJar);
          options.jar_path = seleniumJar;
          runTests(options);
        } else {
          grunt.log.warn('Selenium is missing and now is downloading. If it fails, run this task with --force again.');
          grunt.verbose.ok('Downloading Selenium from ' + options.jar_url);
          grunt.log.write('Please wait ... ');

          download(options.jar_url, seleniumJar, function() {
            grunt.log.writeln('DONE');
            options.jar_path = seleniumJar;

            process.nextTick(function() {
              grunt.verbose.ok('Saved file ' + seleniumJar);
              runTests(options);
            });
          });
        }
      }
    } else {
      runTests(options);
    }

  });
};
