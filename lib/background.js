'use strict';

// I found this hack for avoiding intermediate .json files

var HACK_ID = 'FAKED_CONFIG_BECAUSE_YOLO';

var nightwatch = require('nightwatch'),
    Module = require('module');

var data = JSON.parse(process.argv[3]),
    load = Module._load;

var die = process.exit.bind(process);

Module._load = function(path) {
  if (path.indexOf(HACK_ID) > -1) {
    return data.settings;
  }

  return load.apply(null, arguments);
};

var argv = data.argv;

argv.config = HACK_ID;
argv.env = data.group.join(',');

if (argv.tag) {
  argv.tag = argv.tag.split(',');
}

try {
  nightwatch.runner(argv);
} catch (e) {
  process.stderr.write(e + '\n');
  die(1);
}
