module.exports = (grunt) ->
  grunt.initConfig
    nightwatch:
      options:
        src_folders: 'test/env'
        custom_commands_path: 'test/helpers'
        chrome_driver_path: __dirname + '/chromedriver'
        config_path: __dirname + '/saucelabs.json'
      chrome:
        standalone: true
        desiredCapabilities:
          browserName: 'chrome'
      local:
        jar_path: __dirname + '/selenium-server-standalone-2.42.2.jar'

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-parts'
