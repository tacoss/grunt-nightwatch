module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: ['tests/**/*.js'],
        tasks: ['default']
      }
    },
    nightwatch: {
      options: {
        standalone: true,
        custom_commands_path: 'helpers',
        chrome_driver_path: __dirname + '/chromedriver',
        download: {},
        firefox: {
          desiredCapabilities: {
            browserName: 'firefox'
          }
        },
        chrome: {
          desiredCapabilities: {
            browserName: 'chrome'
          }
        }
      },
      saucelabs: {
        standalone: false
      },
      local: {
        jar_path: __dirname + '/selenium-server-standalone-2.40.0.jar'
      },
      cli: {
        standalone: false
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['nightwatch:local']);
};
