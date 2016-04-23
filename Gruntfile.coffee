module.exports = (grunt) ->
  settings =
    nightwatch:
      options:
        standalone: grunt.cli.options.standalone is on
        src_folders: 'test/env'
        custom_commands_path: 'test/helpers'
      saucelabs:
        config_path: grunt.cli.options.settings if grunt.cli.options.settings

  if grunt.cli.options.chrome
    settings.nightwatch.options.selenium =
      cli_args:
        'webdriver.chrome.driver': require('chromedriver').path

    settings.nightwatch['default'] =
      desiredCapabilities:
        browserName: 'chrome'

  grunt.initConfig settings
  grunt.loadTasks 'tasks'
