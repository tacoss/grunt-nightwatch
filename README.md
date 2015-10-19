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

Currently, `grunt-nightwatch` supports the same options as [nwrun](https://github.com/gextech/nwrun) can handle.

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

### Gruntfile.js
```javascript
module.exports = function(grunt) {
  grunt.initConfig({
    nightwatch: {
      options: {
        // task options
        standalone: true,

        // download settings
        jar_version: '2.44.0',
        jar_path: '/opt/selenium/server.jar',
        jar_url: 'http://domain.com/files/selenium-server-standalone-1.2.3.jar',

        // nightwatch settings
        globals: { foo: 'bar' },
        globals_path: 'custom_tests/globals',
        custom_commands_path: 'custom_tests/helpers',
        custom_assertions_path: 'custom_tests/asserts',
        src_folders: ['custom_tests/nightwatch'],
        output_folder: 'report',
        test_settings: {},
        selenium: {}
      },
      custom: {
        // custom target + overrides
        config_path: '/path/to/file.json',
        src_folders: ['other_tests/nightwatch']
      }
    }
  });
};
```

## CLI options

Since `0.5.0`, `grunt-nightwatch` will pass `grunt.cli.options` as the `argv` option to `nwrun`.

This means you can use `grunt nightwatch:A:B --group foo --tag bar` directly on the CLI.

### Know issues

When running in parallel Nightwatch will copy the `process.argv` and it may produce bugs if you expect a single boolean argument like `grunt nightwatch:A:B --standalone`.

It will spawn `grunt nightwatch --standalone --env A` and the argv will be erroneously parsed as `--standalone=--env`.

## Targets

All options are the same as the main settings.

```javascript
nightwatch: {
  demo: { /* see above */ }
}
```

Now you can execute `grunt nightwatch:demo` to run your tests.

Note that your tests must be grouped together as follows: `tests/<group>/test.js`
