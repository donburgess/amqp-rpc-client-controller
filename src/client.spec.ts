import {RPC_Client} from './client';
import {Config} from './config';
import * as amqplib from 'amqplib';

describe('client', () => {
    let underTest: RPC_Client;
    const config: Config = new Config({
        username: 'testUser',
        password: 'testPassword',
        host: 'testhost.io',
        vhost: 'testVhost'
    });

    beforeEach(() => {
        underTest = new RPC_Client(config);
    });

    afterEach(() => {
        underTest = null;
    });

    describe('connect() is initiated', () => {
        const connection = jasmine.createSpyObj('Connection', ['createChannel']),
            channel = jasmine.createSpyObj('Channel', ['setMaxListeners', 'consume']);

        connection.createChannel.and.callFake((): Promise<amqplib.Channel> => {
            return new Promise<amqplib.Channel>((resolve) => {
                resolve(channel);
            });
        });
        channel.setMaxListeners.and.callFake((): any => undefined);
        channel.consume.and.callFake((): any => undefined);

        beforeEach(() => {
            spyOn(amqplib, 'connect').and.callFake((): Promise<amqplib.Connection> => {
                return new Promise<amqplib.Connection>((resolve) => {
                    resolve(connection);
                });
            });
        });

        afterEach(() => {
            connection.createChannel.calls.reset();
            channel.setMaxListeners.calls.reset();
            channel.consume.calls.reset();
        });

        it('creates consume listener on channel', (done) => {
            underTest.connect().subscribe(
                () => undefined,
                () => undefined,
                () => {
                    expect(channel.consume).toHaveBeenCalledTimes(1);
                    expect(channel.consume).toHaveBeenCalledWith(
                        'amq.rabbitmq.reply-to',
                        jasmine.any(Function),
                        jasmine.any(Object)
                    );
                    done();
                }
            );
        });
    });

    describe('rpcPush() is passed a message', () => {
        const mockMQ: { receivedMsg: Function } = {
            receivedMsg (
                queueName: string,
                msg: Buffer,
                {correlationId, replyTo} : any
            ) {
                underTest.responseEmitter.emit(correlationId, msg);
                }
        },
            connection = {},
            channel = jasmine.createSpyObj('Channel', ['sendToQueue']),
            testQueue: string = 'testQueue',
            testMsg = { any: 'testMessage' };

            channel.sendToQueue.and.callFake(mockMQ.receivedMsg);

        beforeEach(() => {
            underTest['_connection'] = <any> connection;
            underTest['_channel'] = <any> channel;
            spyOn(underTest, 'generateUuid').and.returnValue(1);
            spyOn(underTest.responseEmitter, 'once').and.callThrough();
        });

        afterEach(() => {
            channel.sendToQueue.calls.reset();
        });

        it('creates a listener for a response', (done) => {
            underTest.rpcPush(testQueue, testMsg).subscribe(
                () => undefined,
                () => undefined,
                () => {
                    expect(underTest.responseEmitter.once).toHaveBeenCalledTimes(1);
                    done();
                }
            );
        });

        it('sends the message to the rpc channel', (done) => {
            underTest.rpcPush(testQueue, testMsg).subscribe(
                () => undefined,
                () => undefined,
                () => {
                    expect(channel.sendToQueue).toHaveBeenCalledTimes(1);
                    done();
                }
            )
        });

        it('streams responses through observable', (done) => {
            underTest.rpcPush(testQueue, testMsg).subscribe(
                (msg: any) => {
                    expect(msg.any).toEqual(testMsg.any);
                    done();
                }
            );
        });

        it('throws an error if connection is not created', (done) => {
            underTest['_connection'] = undefined;

            underTest.rpcPush(testQueue, testMsg).subscribe(
                () => undefined,
                (err: Error) => {
                    expect(err.message).toBeTruthy();
                    done();
                }
            );
        });

        it('throws an error if channel is not created', (done) => {
            underTest['_channel'] = undefined;

            underTest.rpcPush(testQueue, testMsg).subscribe(
                () => undefined,
                (err: Error) => {
                    expect(err.message).toBeTruthy();
                    done();
                }
            );
        });

        it('throws an error if channel and connection is not created', (done) => {
            underTest['_connection'] = undefined;
            underTest['_channel'] = undefined;

            underTest.rpcPush(testQueue, testMsg).subscribe(
                () => undefined,
                (err: Error) => {
                    expect(err.message).toBeTruthy();
                    done();
                }
            );
        });

        it('throws an error if message is a string', (done) => {
            underTest.rpcPush(testQueue, testQueue).subscribe(
                () => undefined,
                (err: Error) => {
                    expect(err.message).toBeTruthy();
                    done();
                }
            );
        });

        it('throws an error if message is a function', (done) => {
            underTest.rpcPush(testQueue, (): any => undefined).subscribe(
                () => undefined,
                (err: Error) => {
                    expect(err.message).toBeTruthy();
                    done();
                }
            );
        });

        it('throws an error if message is a number', (done) => {
            underTest.rpcPush(testQueue, 1).subscribe(
                () => undefined,
                (err: Error) => {
                    expect(err.message).toBeTruthy();
                    done();
                }
            );
        });
    });
});