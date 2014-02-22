# Grunt meets Nightwatch.js

Install the dependencies:

```bash
$ npm install grunt-nightwatch --save-dev
```

Configure your tasks:

**Gruntfile.js**

```javascript
module.exports = function(grunt) {
  grunt.initConfig({
    nightwatch: { /* see below */ }
  });

  grunt.loadNpmTasks('grunt-nightwatch');
};
```

Write some tests:

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

Currently, `grunt-nightwatch` supports four settings:

**settings** (object)

This mirrors the `settings.json` values required by Nightwatch.

**standalone** (boolean)

If enabled, there are two scenarios:

* If **jar_path** option exists then use it
* If not, it will download from **jar_url** option

**jar_path** (string) - see above

**jar_url** (string)  - see above


## Targets

Setup and run an specific target:

```javascript
nightwatch: {
  demo: { /* settings */ }
}
```

Note that all options are the same as the main settings.

Now you can execute `grunt nightwatch:other` yo run your tests.

## Build status

[![Build Status](https://travis-ci.org/pateketrueke/grunt-nightwatch.png)](https://travis-ci.org/pateketrueke/grunt-nightwatch)

Actually works as NPM package (?) but I can't figure out how test this on Travis-CI or similar.

Any help?
