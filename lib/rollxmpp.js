var Client = require('node-xmpp-client'),
    EventEmitter = require('events').EventEmitter;

module.exports = new RollXMPP();

function RollXMPP() {
  var client;
  var events = new EventEmitter(),
  var Element = require('node-xmpp-core').ltx.Element;

  this.on = function() {
    events.on.apply(events, Array.prototype.slice.call(arguments));
  };

  this.removeEvent = function() {
    events.removeListener.apply(events, Array.prototype.slice.call(arguments));
  };

  this.connect = function(config) {
    if(typeof config == 'undefined') throw new Error('Missing Connection arguments');

    client = new Client(config);

    client.on('close', _closeEvent);
    client.on('online', _onlineEvent);
    client.on('stanza', _stanzaEvent);
    client.on('error', _errorEvent);
  };

  this.disconnect = function() {
    var stanza = new Element('presence', { type: 'unavailable' });
		stanza.c('status').t('Logged out');
		client.send(stanza);

    var conn = client.connection;
		if(conn.socket.writable) {
			if (conn.streamOpened) {
				conn.socket.write('</stream:stream>');
				delete conn.streamOpened;
			} else {
				conn.socket.end();
			}
		}
  };

  this.message = function(to, message) {
    var stanza = new Element('message', { to: to, type: 'chat' });
    stanza.c('body').t(message);
    client.send(stanza);
  };

  // private
  function _onlineEvent(data) {
    client.send(new Element('presence'));
    events.emit('online', data);
    if(client.connection.socket) {
      client.connection.socket.setTimeout(0);
      client.connection.socket.setKeepAlive(true, 10000);
    }
  }

  function _closeEvent() {
    events.emit('close');
  }

  function _errorEvent(err) {
    events.emit('error', err);
  }

  function _stanzaEvent(stanza) {
    events.emit('stanza', stanza);
    if(stanza.is('message')) {
      _handleMessage(stanza);
    }
  }

  function _handleMessage(stanza) {
    if(stanza.attrs.type == 'chat') {
      var body = stanza.getChild('body');
      if(body) {
        var message = body.getText(),
            from = stanza.attrs.from,
            id = from.split('/')[0];
        events.emit('chat', id, message);
      }
    }
  }
};
