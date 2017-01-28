import {Config} from './config';

describe('config', () => {
    let underTest: Config;

    beforeEach(() => {
        underTest = new Config({});
    });

    afterEach(() => {
        underTest = null;
    });

    describe('getUri', () => {
        const username = 'username',
                password = 'password',
                port = 5672,
                vhost = 'vhost',
                host = 'host';

        it('returns a uri -- when configured with username/password and vhost', () => {
            underTest.username = username;
            underTest.password = password;
            underTest.host = host;
            underTest.vhost = vhost;

            const expected = `amqp://${username}:${password}@${host}:${port}/${vhost}`;
            const result = underTest.uri;

            expect(result).toEqual(expected);
        });

        it('returns a uri -- when configured with username/password and no vhost', () => {
            underTest.username = username;
            underTest.password = password;
            underTest.host = host;

            const expected = `amqp://${username}:${password}@${host}:${port}`;
            const result = underTest.uri;

            expect(result).toEqual(expected);
        });

        it('returns a uri -- when configured without username/password and vhost', () => {
            underTest.vhost = vhost;
            underTest.host = host;

            const expected = `amqp://${host}:${port}/${vhost}`;
            const result = underTest.uri;

            expect(result).toEqual(expected);
        });

        it('returns a uri -- when configured without username/password and no vhost', () => {
            underTest.host = host;

            const expected = `amqp://${host}:${port}`;
            const result = underTest.uri;

            expect(result).toEqual(expected);
        });
    });
});
