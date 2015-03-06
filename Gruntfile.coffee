module.exports = (grunt) ->
  grunt.initConfig
    nightwatch:
      options:
        src_folders: 'test/env'
        custom_commands_path: 'test/helpers'
        chrome_driver_path: __dirname + '/chromedriver'
        config_path: grunt.cli.options.settings if grunt.cli.options.settings
      chrome:
        standalone: true
        desiredCapabilities:
          browserName: 'chrome'

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-parts'
