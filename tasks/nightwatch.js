'use strict';

module.exports = function(grunt) {
  grunt.registerTask('nightwatch', 'Run your Nightwatch.js tests', function() {
    var $ = require('../lib/functions')(grunt),
        _ = grunt.util._;

    var config = grunt.config.get('nightwatch');

    if (!config.options) {
      config.options = {};
    }

    var defaults = {
      jar_url: 'http://selenium-release.storage.googleapis.com/{x}.{y}/selenium-server-standalone-{x}.{y}.{z}.jar',
      jar_path: null,
      jar_version: '2.44.0',
      standalone: false,
      config_path: null,
      // nightwatch-settings
      src_folders: ['tests'],
      output_folder: 'reports',
      test_settings: {
        'default': {
          silent: true,
          output: true
        }
      }
    };

    var group = (arguments.length && Array.prototype.slice.call(arguments)) || ['default'],
        settings_json = $.cwd('nightwatch.json'),
        deprecated_settings_json = $.cwd('settings.json');

    var fake_opts = [
      'standalone', 'jar_path', 'jar_url', 'jar_version',
      'chrome_driver_path',
      'ie_driver_path',
      'config_path'
    ];

    var settings_opts = [
      'globals', 'selenium', 'src_folders', 'output_folder', 'globals_path',
      'custom_commands_path', 'custom_assertions_path', 'test_settings',
      'launch_url', 'selenium_host', 'selenium_port', 'silent',
      'output', 'disable_colors', 'screenshots', 'username',
      'access_key', 'desiredCapabilities', 'exclude',
      'filter', 'use_xpath'
    ];

    var paths = [
      'path', 'globals', 'src_folders', 'output_folder', 'globals_path', 'custom_commands_path', 'custom_assertions_path'
    ];

    if ($.exists(deprecated_settings_json)) {
      $.log.error('Deprecated settings.json will not be merged (use nightwatch.json)');
    }

    // use default options first!
    var settings = $.mergeVars({}, _.pick(defaults, settings_opts)),
        options = $.mergeVars({}, _.pick(defaults, fake_opts));

    // load nightwatch.json file
    if ($.exists(settings_json)) {
      $.mergeVars(settings, $.json(settings_json));
    }

    if (!settings.selenium) {
      settings.selenium = {};
    }

    // extend settings using task and target options
    $.mergeVars(settings, _.pick(config.options || {}, settings_opts));
    $.mergeVars(options, _.pick(config.options || {}, fake_opts));

    // warn deprecated-settings
    if (_.has(settings, 'settings')) {
      $.log.error('Deprecated property "settings" will not be merged');
    }

    // load settings/options from custom .json file
    if ($.exists(options.config_path)) {
      var data = $.json(options.config_path);

      $.verbose.ok('Custom JSON-file: ' + options.config_path);

      $.mergeVars(settings, _.pick(data, settings_opts));
      $.mergeVars(options, _.pick(data, fake_opts));

      $.expandPaths(options.config_path, settings, paths);
    }

    // create test_settings group if missing
    if (!_.isObject(settings.test_settings)) {
      settings.test_settings = {};
    }

    // extend default test_settings using task/options
    $.mergeVars(
      settings.test_settings['default'],
      _.pick(config.options['default'] || {}, settings_opts),
      _.pick(config['default'] || {}, settings_opts),
      _.pick(config || {}, settings_opts)
    );

    // load the target options with the global and target defaults
    _.each(group, function (name) {
      if (!_.isObject(settings.test_settings[name])) {
        settings.test_settings[name] = {};
      }

      // override task-options (top -> bottom)
      $.mergeVars(
        options,
        _.pick(config[name] || {}, fake_opts),
        _.pick(config.options || {}, fake_opts),
        _.pick(config.options[name] || {}, fake_opts)
      );

      $.mergeVars(
        settings.test_settings[name],
        settings.test_settings['default'],
        _.pick(config[name] || {}, settings_opts),
        _.pick(config.options || {}, settings_opts),
        _.pick(config.options[name] || {}, settings_opts)
      );
    });

    $.verbose.ok('Task options');
    $.verbose.writeln(JSON.stringify(options));

    var runner = require('../lib/runner')(grunt);

    runner(group, options, settings, this.async());
  });
};
