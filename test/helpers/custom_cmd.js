/* global document */

module.exports.command = function(value) {
  var self  = this;

  function myCommand() {
    return document.title;
  }

  this.execute(myCommand, [], function(result) {
    self.assert.ok(result.value.indexOf(value) > -1, 'page title contains "' + value + '"');
  });

  return this;
};
