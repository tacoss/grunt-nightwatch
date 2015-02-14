# Grunt meets Nightwatch.js

[![Build Status](https://travis-ci.org/gextech/grunt-nightwatch.png?branch=master)](https://travis-ci.org/gextech/grunt-nightwatch) [![NPM version](https://badge.fury.io/js/grunt-nightwatch.png)](http://badge.fury.io/js/grunt-nightwatch)

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
$ grunt nightwatch      # target: default
$ grunt nightwatch:A    # target: A
$ grunt nightwatch:A:B  # targets: A, B
```

## Options

Currently, `grunt-nightwatch` supports:

- **globals**, **selenium**, **src_folders**, **output_folder**, **globals_path**, **custom_commands_path**, **custom_assertions_path**, **test_settings**, **launch_url**, **selenium_host**, **selenium_port**, **silent**, **output**, **disable_colors**, **screenshots**, **username**, **access_key**, **desiredCapabilities**, **exclude**, **filter**, **use_xpath**

  All of these options are fully supported and will be merged from **task** to **target** settings (including the **default** target).

- **standalone** (boolean)

  If enabled, there are two scenarios:

  - If **jar_path** option exists then use it
  - If not, it will download from **jar_url** option

- **jar_version** (string)

  Used for fixing the **jar_url** if it has the following format like: `http://selenium-release.storage.googleapis.com/{x}.{y}/selenium-server-standalone-{x}.{y}.{z}.jar`, where `x.y.z` is the custom version.

- **jar_path** (string) - see above

- **jar_url** (string)  - see above

- **config_path** (string)

  Set a custom path for JSON settings and options, it can be overriden per target.

Note that the **nighwatch.json** file settings is fully supported, but your task options will override them if needed.

Since `0.2.3` the  **settings.json** file was deprecated.

Since `0.3.0` the **settings** property was deprecated.

### Example options

```javascript
{
  standalone: true,
  config_path: '/path/to/file.json',
  jar_version: '2.44.0',
  jar_path: '/opt/selenium/server.jar',
  jar_url: 'http://domain.com/files/selenium-server-standalone-1.2.3.jar',
  globals: { foo: 'bar' },
  globals_path: 'custom_tests/globals',
  custom_commands_path: 'custom_tests/helpers',
  custom_assertions_path: 'custom_tests/asserts',
  src_folders: ['custom_tests/nightwatch'],
  output_folder: 'report',
  test_settings: {},
  selenium: {}
}
```

## CLI options

Since `0.4.0`, `grunt-nightwatch` supports:

- **`--tag`**, **`--test`**, **`--filter`**, **`--group`**, **`--skipgroup`**

  All of these are passed to the child process that runs `nightwatch` on the [background](lib/background.js).

## Targets

All options are the same as the main settings.

```javascript
nightwatch: {
  demo: { /* see above */ }
}
```

Now you can execute `grunt nightwatch:demo` to run your tests.

Note that your tests must be grouped together as follows: `tests/<group>/test.js`

