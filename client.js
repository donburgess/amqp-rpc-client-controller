'use strict';
const Rx = require('rx');
const EventEmitter = require('events');

/**
 *  Connection Dependencies
 */
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

module.exports = class RPC_Client {
    /**
     * Takes a config object and creates objects that a connection and channel will be stored in
     */
    constructor(configuration){
        this.uri = configuration.getUri();
        this.connection = null;
        this.channel = null;
    }

    setUri(configuration) {
        this.uri = configuration.getUri();
    }

    connect() {
        if(this.uri === 0) {
            return Rx.Observable.throw(new Error('Uri must be defined in order to start connection'));
        }
        
        const _self = this;

        const connPromise = require('amqplib').connect(this.uri)
        .then((connection)=>{
            _self.connection = connection;
            return _self.connection.createChannel();
        })
        .then((channel)=>{
            _self.channel = channel;

            _self.channel.responseEmitter = new EventEmitter();
            _self.channel.setMaxListeners(0);
            
            _self.channel.consume(
                REPLY_QUEUE,
                (msg)=> channel.responseEmitter.emit(msg.properties.correlationId, msg.content),
                {noAck: true}
            );

            return _self.channel;
        })

        return Rx.Observable.fromPromise(connPromise);
    }

    rpcPush(queueName, message) {
       
        const _self = this

        const sendRPC = new Promise((resolve)=> {
            const correlationId = this.generateUuid();
             _self.channel.responseEmitter.once(correlationId, resolve);
            _self.channel.sendToQueue(queueName, new Buffer(JSON.stringify(message)), {correlationId, replyTo: REPLY_QUEUE});
        });
        
        return Rx.Observable.fromPromise(sendRPC);

    }

    generateUuid() {
        return Math.random().toString() +
                Math.random().toString() +
                Math.random().toString();
    }

    getConnection() {
        return this.connection;
    }

    getChannel() {
        return this.channel;
    }
}