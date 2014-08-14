# Grunt meets Nightwatch.js

Automatize your tests:

```javascript
module.exports = function(grunt) {
  grunt.initConfig({
    nightwatch: {
      options: { /* see below */ }
    }
  });

  grunt.loadNpmTasks('grunt-nightwatch');
};
```

Write some tests:

**tests/default/google-test.js**

```javascript
module.exports = {
  'Demo test Google': function(browser) {
    browser
      .url('http://www.google.com')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=text]', 'nodejs')
      .waitForElementVisible('button[name=btnG]', 1000)
      .click('button[name=btnG]').pause(1000)
      .assert.containsText('#ires', 'joyent/node')
      .end();
  }
};
```

Execute:

```bash
$ grunt nightwatch
```

## Options

Currently, `grunt-nightwatch` supports:

* **settings** (object)

  This mirrors the `settings.json` values required by Nightwatch.

* **test_settings**

  This mirrors the `test_settings` values required by Nightwatch.

  Also will be the defaults for custom targets, leaving the target options override them if needed.

* **selenium**, **src_folders**, **output_folder**, **globals_path**, **custom_commands_path**, **custom_assertions_path**

  Note that any of these will be merged from task `options`, target `options`, and target `options.settings`.

* **standalone** (boolean)

  If enabled, there are two scenarios:

  * If **jar_path** option exists then use it
  * If not, it will download from **jar_url** option

* **jar_path** (string) - see above

* **jar_url** (string)  - see above

Note that the **nighwatch.json** file is fully supported, but your task options will override them if needed.

Since `0.2.3` the  **settings.json** file was deprecated.

### Example options

```javascript
{
  standalone: true,
  jar_path: '/opt/selenium/server.jar',
  jar_url: 'http://domain.com/files/selenium-server-standalone-2.40.0.jar',
  globals_path: 'custom_tests/globals',
  custom_commands_path: 'custom_tests/helpers',
  custom_assertions_path: 'custom_tests/asserts',
  src_folders: ['custom_tests/nightwatch'],
  output_folder: 'report',
  test_settings: {},
  settings: {},
  selenium: {}
}
```

## Targets

All options are the same as the main settings.

```javascript
nightwatch: {
  options: {
    demo: { /* see above */ }
  }
}
```

Now you can execute `grunt nightwatch:demo` to run your tests.

Note that your tests must be grouped together as follows: `tests/<group>/test.js`

## Build status

[![Build Status](https://travis-ci.org/gextech/grunt-nightwatch.png?branch=master)](https://travis-ci.org/gextech/grunt-nightwatch)
