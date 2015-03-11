'use strict';

var slice = Array.prototype.slice;

var path = require('path'),
    fs = require('fs');

module.exports = function(grunt) {
  var _ = grunt.util._;

  function parseCliOptions() {
    return _.omit(grunt.cli.options, ['tasks', 'npm']);
  }

  function replaceEnv(value) {
    if (typeof value === 'string') {
      return value.replace(/\$\{(\w+)\}/g, function(match, key) {
        return process.env[key] || match;
      });
    }

    return value;
  }

  function mergeVars(target) {
    var args = slice.call(arguments, 1);

    if (!target) {
      target = {};
    }

    _.each(args, function(source) {
      _.each(source, function(value, key) {
        if (!_.isArray(value) && _.isObject(value)) {
          target[key] = mergeVars(target[key], value);
        } else {
          target[key] = replaceEnv(typeof value === 'undefined' ? target[key] : value);
        }
      });
    });

    return target;
  }

  function resolvePath(file, dir) {
    return path.join(path.relative(process.cwd(), path.dirname(file)), dir);
  }

  function expandPaths(from_file, target, paths) {
    _.each(target, function(item, key) {
      if (_.isObject(item)) {
        expandPaths(from_file, item, paths);
      } else if (paths.indexOf(key) > -1) {
        target[key] = _.isArray(item) ? _.map(item, function(folder) {
            return resolvePath(from_file, folder);
          }) : resolvePath(from_file, item);
      }
    });
  }

  return {
    log: grunt.log,
    fatal: grunt.fatal,
    verbose: grunt.verbose,

    cwd: function(path) {
      return process.cwd() + '/' + path;
    },

    json: function(file) {
      return grunt.file.readJSON(file);
    },

    exists: function(file) {
      return fs.existsSync(file);
    },

    tmpfile: function(file) {
      return path.resolve(__dirname, '..', path.basename(file));
    },

    opts: function(name) {
      var opts = parseCliOptions();

      return name ? opts[name] : opts;
    },

    mergeVars: mergeVars,
    replaceEnv: replaceEnv,
    expandPaths: expandPaths,

    downloadHelper: require('./download'),

    nightwatchDirectory: function(file) {
      var nw_dir = path.resolve(require.resolve('nightwatch') + '/../..');

      if (file) {
        return nw_dir + '/' + file;
      }

      return nw_dir;
    }
  };
};
