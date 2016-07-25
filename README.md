# amqp-rpc-client-controller
A client controller for sending asynchronous RPC requests over AMQP and RabbitMQ.

This client makes use of RxJs Observables for connection and response events.

# Connecting Without Subscriptions
```
// Require Client Module
var RPC = require('rpc-client');

// Configure Client to Connect to RabbitMQ Server

var config = RPC.Config({
    username: 'user',
    password: 'password',
    host: 'example.com',
    vhost: 'vhost'
});

// Start Client
var client = RPC.Client(config);

// Attempt to connect to server
client.connect();
```

# Connecting With a Subscription
```
// Require Client Module
var RPC = require('rpc-client');

// Configure Client to Connect to RabbitMQ Server
var config = RPC.Config({
    username: 'user',
    password: 'password',
    host: 'example.com',
    vhost: 'vhost'
});

// Start Client
var client = RPC.Client(config);

// Attempt to connect to server
client.connect().subscribe(
    (channel) => { ... }, // Actions after connection is made
    (err) => { ... } // Handle Error
)
```

# Sending a RPC Example
```
// Constant for the name of queue the RPC server is a member of
var QUEUENAME = 'api_queue';

// example object RPC server may be looking for
var message = {join: 'NewUsers'} 

// Send RPC to server and wait for a response to handle
client.rpcPush(QUEUENAME, message).subscribe(
    (res) => { console.log(res) },
    (err) => { console.error(err) }
);
```
