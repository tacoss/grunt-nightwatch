module.exports = function(grunt) {
  grunt.registerTask('nightwatch', 'Run your Nightwatch.js tests', function(target) {
    var $ = require('../lib/functions')(grunt),
        _ = grunt.util._;

    var options = this.options({
      jar_url: 'http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar',
      jar_path: '/opt/selenium/server-standalone.2.40.0.jar',
      standalone: false
    });

    var defaults = {
      settings: {
        src_folders: ['tests'],
        output_folder: 'reports'
      },
      test_settings: { silent: true, output: true }
    };

    var group = target || 'default',
        settings_json = $.cwd('nightwatch.json'),
        deprecated_settings_json = $.cwd('settings.json'),
        fake_opts = ['standalone', 'jar_path', 'jar_url'],
        settings_opts = ['selenium', 'src_folders', 'output_folder', 'globals_path', 'custom_commands_path', 'custom_assertions_path'];

    if ($.exists(deprecated_settings_json)) {
      $.die('Deprecated settings.json (use nightwatch.json)');
    }

    // apply the default options
    var settings = $.mergeVars({}, defaults.settings);

    // load nightwatch.json file
    if ($.exists(settings_json)) {
      $.mergeVars(settings, $.json(settings_json));
    }

    if (!settings.selenium) {
      settings.selenium = {};
    }

    // extend settings using task and target options
    $.mergeVars(settings, options.settings, (options[group] || {}).settings, _.pick(options, settings_opts));

    _.isObject(settings.test_settings) || (settings.test_settings = {});
    _.isObject(settings.test_settings[group]) || (settings.test_settings[group] = {});

    // load the target options with the global and target defaults
    $.mergeVars(settings.test_settings[group], defaults.test_settings, options.test_settings, _.pick(options[group] || {}, settings_opts));

    // override the global task options if needed
    $.mergeVars(options, _.pick(options[group] || {}, fake_opts));

    $.verbose.ok('Task options');
    $.verbose.writeln(JSON.stringify(options));

    // adding ability to run a single test via --test cli argument
    if ($.opts('test')) {
      // TODO: why?
      var file = $.opts('test'),
          source = $.exists(file) ? file : $.cwd(file);

      settings.src_folders = [source];
    }

    var runner = require('../lib/selenium')(grunt),
        doneCallback = this.async();

    runner(group, options, settings, doneCallback);
  });
};
