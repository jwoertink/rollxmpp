var Client = require('node-xmpp-client'),
    Element = Client.Stanza.Element,
    EventEmitter = require('events').EventEmitter;

module.exports = new RollXMPP();

function RollXMPP() {
  var client,
      events = new EventEmitter(),
      STATUSES = {
        AWAY: "away",
        DND: "dnd",
        XA: "xa",
        ONLINE: "chat",
        OFFLINE: "offline"
      };

  this.on = function() {
    events.on.apply(events, Array.prototype.slice.call(arguments));
  };

  this.removeEvent = function() {
    events.removeListener.apply(events, Array.prototype.slice.call(arguments));
  };

  this.emit = function() {
    events.emit.apply(events, Array.prototype.slice.call(arguments));
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

  this.setPresence = function(show, status) {
    var stanza = new Element('presence');
    stanza.c('show').t(show);
    if(status !== null) {
      stanza.c('status').t(status);
    }
    client.send(stanza);
  };

  this.getRoster = function() {
    var stanza = new Element('iq', { id: 'get-roster', type: 'get' });
    stanza.c('query', { xmlns: 'jabber:iq:roster' });
    client.send(stanza);
  };

  this.addContact = function(jid) {
    var stanza = new Element('iq', { id: 'add-contact', type: 'set' });
    stanza.c('query', { xmlns: 'jabber:iq:roster' }).c('item', { jid: jid});
    client.send(stanza);
  };

  // Get vCard of friend
  this.getVCard = function(to) {
    var stanza = new Element('iq', { id: 'get-vcard-buddy', type: 'get', to: to});
    stanza.c('vCard', { xmlns: 'vcard-temp'});
    client.send(stanza);
  };

  // Get your vCard
  this.getMyVCard = function() {
    var stanza = new Element('iq', { id: 'get-vcard-self', type: 'get'});
    stanza.c('vCard', { xmlns: 'vcard-temp'});
    client.send(stanza);
  };

  this.subscribe = function(to) {
    var stanza = new Element('presence', { to: to, type: 'subscribe' });
    client.send(stanza);
  };

  this.unsubscribe = function(to) {
    var stanza = new Element('presence', { to: to, type: 'unsubscribe' });
    client.send(stanza);
  };

  this.acceptSubscription = function(to) {
    var stanza = new Element('presence', { to: to, type: 'subscribed' });
    client.send(stanza);
  };

  this.acceptUnsubscription = function(to) {
    var stanza = new Element('presence', { to: to, type: 'unsubscribed' });
    client.send(stanza);
  };

  // private
  function _onlineEvent(data) {
    events.emit('online', data);
    client.send(new Element('presence'));
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
    } else if(stanza.is('presence')) {
      var from = stanza.attrs.from;
      if(from) {
        var type = stanza.attrs.type;

        if(type == 'subscribe' || type == 'unsubscribe') {
          events.emit(type, from);
        } else {

        }
      }
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
