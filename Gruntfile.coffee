module.exports = (grunt) ->
  grunt.initConfig
    nightwatch:
      options:
        standalone: grunt.cli.options.standalone is on
        src_folders: 'test/env'
        custom_commands_path: 'test/helpers'
      saucelabs:
        config_path: grunt.cli.options.settings if grunt.cli.options.settings

  grunt.loadTasks 'tasks'
