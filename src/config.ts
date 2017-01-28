export class Config {
    private _username: string;
    private _password: string;
    private _host: string;
    private _port: number;
    private _vhost: string;

    constructor({
        username,
        password,
        host,
        port,
        vhost
    }: any) {
        this._username = username || null;
        this._password = password || null;
        this._host = host || null;
        this._port = port || 5672;
        this._vhost = vhost || null;
    }

    public set username(input: string) {
        if (typeof input !== 'string') {
            throw new Error('username should be a string value');
        }

        this._username = input || null;
    }

    public set password(input: string) {
        if (typeof input !== 'string') {
            throw new Error('password should be a string value');
        }

        this._password = input || null;
    }

    public set host(input: string) {
        if (typeof input !== 'string') {
            throw new Error('host should be a string value');
        }

        this._host = input || null;
    }

    public set port(input: number) {
        if (typeof input !== 'string') {
            throw new Error('port should be a number value');
        }

        this._port = typeof(input) === 'number' ? input : 5672;
    }

    public set vhost(input: string) {
        if (typeof input !== 'string') {
            throw new Error('vhost should be a string value');
        }

        this._vhost = input || null;
    }

    public get uri(): string {
        if (this._username && this._password && this._vhost && this._host) {
            return `amqp://${this._username}:${this._password}@${this._host}:${this._port}/${this._vhost}`;
        } else if (this._username && this._password && this._host) {
            return `amqp://${this._username}:${this._password}@${this._host}:${this._port}`;
        } else if (this._host && this._vhost) {
            return `amqp://${this._host}:${this._port}/${this._vhost}`;
        } else if (this._host) {
            return `amqp://${this._host}:${this._port}`;
        } else {
            return null;
        }
    }
}
