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
        custom_commands_path: 'helpers',
        download: {
          standalone: true
        }
      },
      local: {
        standalone: true,
        jar_path: __dirname + '/selenium-server-standalone-2.40.0.jar'
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['nightwatch:local']);
};
