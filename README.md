# RollXMPP
A simple to use XMPP client for NodeJS

## Setup
be sure to `npm install`

## Usage

```javascript
var rollxmpp = require('rollxmpp');

var connection = rollxmpp.connect({jid: 'me@domain.co', password: 'password', host: 'domain.co', port: 5222});

// Instant Messaging
connection.message('friend@domain.co', 'sup?');

// Set presence
connection.setPresence('away', 'BRB! Out to lunch');

// Add a buddy
connection.addContact('buddy@domain.co');

// Request Friend's vCard
connection.getVCard('friend@domain.co')
// this is currently an ugly implementation
// but this just sends the request. You have
// to listen for the response
connection.on('stanza', function(stanza) {
  if(stanza.name == 'iq' && stanza.attrs.type == 'result' && stanza.attrs.id == 'roster_0') {
    var friends = stanza.children[0].children;
    // iterate over friends and parse it for their info. I'll probably make this cleaner later
  }
});
```

## Features
* Connect to XMPP server
* Disconnect from XMPP server
* Send chat message to a single user
* Set your presence
* Get Roster
* Add friend to roster
* get a friend's vCard
* Manage subscriptions

## Testing
For now we will just proxy to the [jasmine-node](https://github.com/mhevery/jasmine-node) in the node_modules

`./bin/jasmine-node spec/`
