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
        download: {
          standalone: true,
          jar_path: 'selenium-server.jar'
        },
        local: {
          standalone: true,
          jar_path: '/opt/selenium/server.jar',
          custom_commands_path: 'helpers'
        }
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['nightwatch:local']);
};
