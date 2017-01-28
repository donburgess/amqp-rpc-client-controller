import {Observable} from 'rxjs';
import {EventEmitter} from 'events';
import {Channel, Connection, Message, connect} from 'amqplib';
import {Config} from './config';

// Constants
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export class RPC_Client {
    private _uri: string;
    private _connection: Connection;
    private _channel: Channel;
    private _responseEmitter: EventEmitter;

    constructor(configuration: Config) {
        this._uri = configuration.uri;
        this._responseEmitter = new EventEmitter();
    }

    public connect(): Observable<Channel> {
        if (!this._uri) {
            return Observable.throw(
                new Error('Uri must be defined in order to start connection')
            );
        }

        const self: RPC_Client = this;

        // Connect to RabbitMQ
        const connPromise: any = connect(this.uri)
            // Assign Connection and Create Channel
            .then((connection: Connection) => {
                self._connection = connection;
                return connection.createChannel();
            })

            // Assign Channel and create consume listener
            .then((channel: Channel) => {
                self._channel = channel;
                channel.setMaxListeners(0);

                // Action to take when message received
                self.consumeChannel.apply(self, [channel]);

                return channel;
            });

        return Observable.fromPromise(connPromise);
    }

    private consumeChannel(channel: Channel): void {
        channel.consume(
            REPLY_QUEUE,
            (msg: Message) => this.responseEmitter.emit(msg.properties.correlationId, msg.content),
            {noAck: true}
        );
    }

    public rpcPush(queueName: string, message: any): Observable<{content: any}> {
        if (!this.connection || !this.channel) {
            return Observable.throw(
                new Error('A connection is required to send messages.')
            );
        }

        if (typeof message !== 'object') {
            return Observable.throw(
                new Error('Message must be a JSON object.')
            );
        }

        const self: RPC_Client = this;

        return Observable.fromPromise<any>(
            new Promise(
                (resolve: Function) => {
                    // Generate message id
                    const correlationId: string = self.generateUuid();

                    // Create listener for response
                    self.responseEmitter.once(correlationId, resolve);

                    // Send message
                    self.sendMessageToQueue.apply(self, [queueName, message, correlationId]);
                }
            )
                .then((msg: Buffer) => JSON.parse(msg.toString()))
        );
    }

    private sendMessageToQueue(queueName: string, message: any, correlationId: string): void {
        this.channel.sendToQueue(
            queueName,
            new Buffer(JSON.stringify(message)),
            { correlationId, replyTo: REPLY_QUEUE }
        );
    }

    private generateUuid(): string {
        return Math.random().toString() +
                Math.random().toString() +
                Math.random().toString();
    }

    public get connection(): Connection {
        return this._connection;
    }

    public get channel(): Channel {
        return this._channel;
    }

    public get responseEmitter(): EventEmitter {
        return this._responseEmitter;
    }

    public get uri(): string {
        return this._uri;
    }
}