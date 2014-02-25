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
        remote: {
          silent: true,
          selenium_host: 'localhost',
          selenium_port: 4445,
          desiredCapabilities: {
            username: process.env['SAUCE_USERNAME'],
            accessKey: process.env['SAUCE_ACCESS_KEY']
          }
        },
        download: {
          standalone: true,
          jar_path: 'selenium-server.jar'
        },
        local: {
          standalone: true,
          jar_path: '/opt/selenium/server.jar'
        }
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['nightwatch:local']);
};
