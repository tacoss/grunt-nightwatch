var nwrun = require('nwrun');

module.exports = function(grunt) {
  grunt.registerTask('nightwatch', 'Run your Nightwatch.js tests', function() {
    var _ = grunt.util._;

    var done = this.async();
    var options = grunt.config.get('nightwatch');

    var config = options.options || {},
        tests = _.omit(options, 'options');

    var args = Array.prototype.slice.call(arguments);

    if (args.length) {
      config.target = config.target || [];
      Array.prototype.push.apply(config.target, args);
    }

    config.argv = config.argv || grunt.cli.options;
    config.test_settings = _.merge(config.test_settings || {}, tests);

    nwrun(config, done);
  });
};
