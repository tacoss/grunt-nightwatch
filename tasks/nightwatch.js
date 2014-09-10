module.exports = function(grunt) {
  grunt.registerTask('nightwatch', 'Run your Nightwatch.js tests', function() {
    var $ = require('../lib/functions')(grunt),
        _ = grunt.util._;

    var config = grunt.config.get('nightwatch');

    var defaults = {
      jar_url: 'http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar',
      jar_path: '/opt/selenium/server-standalone.2.40.0.jar',
      standalone: false,
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
        deprecated_settings_json = $.cwd('settings.json'),
        fake_opts = ['standalone', 'jar_path', 'jar_url'],
        settings_opts = ['selenium', 'src_folders', 'output_folder', 'globals_path', 'custom_commands_path', 'custom_assertions_path', 'test_settings'];

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

    _.each(group, function (name) {
      $.mergeVars(settings, _.pick(config.options || {}, settings_opts), _.pick(config.options[name] || {}, settings_opts));
      $.mergeVars(options, _.pick(config.options || {}, fake_opts), _.pick(config.options[name] || {}, fake_opts), _.pick(config[name] || {}, fake_opts));
    });

    // warn deprecated-settings
    if (_.has(settings, 'settings')) {
      $.log.error('Deprecated property "settings" will not be merged');
    }

    // create test_settings group if missing
    _.isObject(settings.test_settings) || (settings.test_settings = {});

    // load the target options with the global and target defaults
    _.each(group, function (name) {
      _.isObject(settings.test_settings[name]) || (settings.test_settings[name] = {});

      $.mergeVars(settings.test_settings[name], settings.test_settings['default'], _.omit(_.pick(settings, settings_opts), 'test_settings'));
    });

    $.verbose.ok('Task options');
    $.verbose.writeln(JSON.stringify(options));

    var runner = require('../lib/selenium')(grunt),
        doneCallback = this.async();

    runner(group, options, settings, doneCallback);
  });
};
