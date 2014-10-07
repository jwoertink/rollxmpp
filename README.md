# RollXMPP
A simple to use XMPP client for NodeJS

## Setup
be sure to `npm install`

## Useage

```javascript
var rollxmpp = require('rollxmpp');

var connection = rollxmpp.connect({jid: 'me@domain.co', password: 'password', host: 'domain.co', port: 5222});

// Instant Messaging
connection.message('friend@domain.co', 'sup?');

// Set presence
connection.setPresence('away', 'BRB! Out to lunch');
```

## Features
* Connect to XMPP server
* Disconnect from XMPP server
* Send chat message to a single user
* Set your presence
* Get Roster
* Manage subscriptions

## Testing
For now we will just proxy to the [jasmine-node](https://github.com/mhevery/jasmine-node) in the node_modules

`./bin/jasmine-node spec/`
