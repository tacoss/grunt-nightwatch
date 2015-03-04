module.exports = (grunt) ->
  grunt.initConfig
    nightwatch:
      options:
        standalone: true
        src_folders: 'test/env'
        custom_commands_path: 'test/helpers'
        chrome_driver_path: __dirname + '/chromedriver'
        config_path: __dirname + '/saucelabs.json'
        firefox:
          desiredCapabilities:
            browserName: 'firefox'
        chrome:
          desiredCapabilities:
            browserName: 'chrome'
      saucelabs:
        standalone: false
      local:
        jar_path: __dirname + '/selenium-server-standalone-2.42.2.jar'
      cli:
        standalone: false

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-parts'
