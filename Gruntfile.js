module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: ['tests/*.js'],
        tasks: ['default']
      }
    },
    nightwatch: {
      options: {
        local: {
          standalone: true,
          jar_path: '/opt/selenium/server.jar'
        },
        ci: {
          selenium_host: [process.env['SAUCE_USERNAME'], ':', process.env['SAUCE_ACCESS_KEY'], '@localhost'].join(''),
          selenium_port: 4445
        }
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['nightwatch:local']);
};
