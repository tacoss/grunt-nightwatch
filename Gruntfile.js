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
        standalone: true,
        download: {
          jar_path: 'selenium-server.jar'
        },
        local: {
          jar_path: '/opt/selenium/server.jar'
        }
      }
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['nightwatch:download']);
};
