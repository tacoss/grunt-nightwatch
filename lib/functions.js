module.exports = function(grunt) {
  var slice = Array.prototype.slice,
      path = require('path'),
      fs = require('fs'),
      _ = grunt.util._;

  function parseCliOptions() {
    return _.omit(grunt.cli.options, ['tasks', 'npm']);
  }

  function replaceEnv(value) {
    if ('string' === typeof value) {
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
          target[key] = replaceEnv('undefined' === typeof value ? target[key] : value);
        }
      });
    });

    return target;
  }

  function runTasks(subtasks, callback) {
    function next() {
      var task = subtasks.shift();

      if (!task) {
        return callback();
      }

      task(function (err) {
        if (err) {
          return callback(err);
        }

        next();
      });
    }

    next();
  }

  return {
    log: grunt.log,
    verbose: grunt.verbose,

    cwd: function(path) {
      return process.cwd() + '/' + path;
    },

    die: function(msg) {
      grunt.fatal(msg);
    },

    json: function(file) {
      return grunt.file.readJSON(file);
    },

    exists: function(file) {
      return fs.existsSync(file);
    },

    tmpfile: function(file) {
      return path.resolve(__dirname + '/..') + '/' + path.basename(file);
    },

    opts: function(name) {
      return parseCliOptions()[name];
    },

    runTasks: runTasks,
    mergeVars: mergeVars,
    replaceEnv: replaceEnv,

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
