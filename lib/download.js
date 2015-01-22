'use strict';

// download utility
var http = require('http'),
    url = require('url'),
    fs = require('fs');

// https://github.com/dcodeIO/ClosureCompiler.js/blob/master/scripts/configure.js
module.exports = function(downloadUrl, filename, callback) {
  var URL = url.parse(downloadUrl);

  var out = fs.createWriteStream(filename, { flags: 'w', encoding: null, mode: '0666' }),
      bytes = 0,
      req;

  req = http.request({ hostname: URL.host, method: 'GET', path: URL.path, agent: false }, function(res) {
    if (res.statusCode !== 200) {
      res.setEncoding(null);
      callback(new Error('Download failed: HTTP status code ' + res.statusCode), -1);
      return;
    }

    res.on('data', function(chunk) {
      bytes += chunk.length;
      out.write(chunk);
    });

    res.on('end', function() {
      callback(null, bytes);
    });
  });

  req.on('error', function(e) {
    callback(e, -1);
  });

  req.end();
};
