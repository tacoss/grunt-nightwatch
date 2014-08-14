module.exports = {
  'Demo test Google': function(browser) {
    browser
      .url('http://www.google.com')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=text]', 'nodejs')
      .waitForElementVisible('button[name=btnG]', 1000)
      .click('button[name=btnG]').pause(1000)
      .assert.containsText('#ires', 'nodejs.org')
      .custom_cmd('nodejs')
      .end();
  }
};
