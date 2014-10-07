var rollxmpp = require('../lib/rollxmpp');

describe('RollXMPP', function() {
  it('exports a new RollXMPP', function(done) {
    expect(typeof rollxmpp).toEqual('object');
    done();
  });

  describe('#connect', function() {
    it('takes connection parameters', function(done) {
      // expect(function() {
      //   rollxmpp.connect()
      // }).toThrowError("Missing Connection arguments");
      // done();
    });
  });
});
