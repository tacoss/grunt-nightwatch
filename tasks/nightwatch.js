'use strict';

var nwrun = require('nwrun');

module.exports = function(grunt) {
  grunt.registerTask('nightwatch', 'Run your Nightwatch.js tests', function() {
    var _ = grunt.util._;

    var done = this.async();
    var options = grunt.config.get('nightwatch');

    var config = options.options,
        tests = _.omit(options, 'options');

    config.test_settings = tests;

    nwrun(config, function(err) {
      done(err > 0 ? false : null);
    });
  });
};
