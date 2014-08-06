module.exports.getTitle = function(callback) {
  var browser = this;

  browser.execute(function() {
    return document.title;
  }, [callback], function(result) {
    callback(result.value);
  });

  return this;
};
