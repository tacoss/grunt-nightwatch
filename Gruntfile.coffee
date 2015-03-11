module.exports = (grunt) ->
  grunt.initConfig
    nightwatch:
      options:
        src_folders: 'test/env'
        screenshots:
          path: 'test/screenshots'
        custom_commands_path: 'test/helpers'
        chrome_driver_path: __dirname + '/chromedriver'
        config_path: grunt.cli.options.settings if grunt.cli.options.settings
      default:
        standalone: grunt.cli.options.standalone is on
        desiredCapabilities:
          browserName: if typeof grunt.cli.options.browser is 'string'
            grunt.cli.options.browser
          else
            'firefox'

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-parts'
