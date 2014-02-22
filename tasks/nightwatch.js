module.exports = function(grunt) {
  grunt.registerTask('nightwatch', 'Run your Nightwatch.js tests', function(target) {
    var path = require('path'),
        fs = require('fs');

    var options = this.options({
      jar_url: 'http://selenium.googlecode.com/files/selenium-server-standalone-2.39.0.jar',
      jar_path: '/opt/selenium/server-standalone.2.39.0.jar',
      standalone: false,
      settings: {
        src_folders: ['tests'],
        output_folder: 'reports',
        selenium: { log_path: 'logs' },
        test_settings: {}
      }
    });

    var group = target || 'default';

    options.settings.test_settings[group] = options[group] || {};

    grunt.util._.extend(options, options.settings.test_settings[group]);

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

    // nightwatch-runner
    function runTests(params) {
      function expandSettings(options) {
        var defaults = grunt.util._.extend({}, options.settings);

        if (options.standalone) {
          defaults.selenium.start_process = true;
          defaults.selenium.server_path = options.jar_path;
        }

        return defaults;
      }

      // https://github.com/beatfactor/nightwatch/blob/master/bin/runner.js
      var nw_dir = path.dirname(__dirname) + '/node_modules/nightwatch',
          runner = require(nw_dir + '/runner/run.js'),
          settings = expandSettings(params);

      var config = {
        output_folder: settings.output_folder,
        selenium: settings.selenium
      };

      grunt.log.ok('Executing "' + group + '" tests');

      if (settings.selenium.start_process) {
        var selenium = require(nw_dir + '/runner/selenium.js');

        selenium.startServer(settings, settings.test_settings, function(error, child, error_out, exitcode) {
          if (error) {
            grunt.log.writeln('FAIL');
            grunt.log.error('There was an error while starting the Selenium server:');
            grunt.log.writeln(error_out);
            process.exit(exitcode);
          }

          runner.run(settings.src_folders, settings.test_settings, config, function(err) {
            if (err) {
              grunt.log.writeln('FAIL');
              grunt.log.error('There was an error while running the test.');
            }
            selenium.stopServer();
          });
        });
      } else {
        runner.run(settings.src_folders, settings.test_settings, config);
      }
    }

    this.async();

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
