'use strict';
module.exports = class Config {
    constructor(server){
        this.username = server ? server.username || null : null;
        this.password = server ? server.password || null : null;
        this.host = server ? server.host || null : null;
        this.port = server ? server.port || 5672 : 5672;
        this.vhost = server ? server.vhost || null : null;
    }

    setUsername(input) {
        this.username = input || null;
    }

    setPassword(input) {
        this.password = input || null;
    }

    setHost(input) {
        this.host = input || null;
    }
    
    setPort(input) {
        this.port = input || 5672;
    }

    setVhost(input) {
        this.vhost = input || null;
    }

    getUri() {
        if (this.username && this.password && this.vhost && this.host) {
            return 'amqp://' +
            this.username +
            ':' +
            this.password +
            '@' +
            this.host +
            ':' +
            this.port +
            '/' +
            this.vhost;
        }
        else if (this.username && this.password && this.host) {
            return 'amqp://' +
            this.username +
            ':' +
            this.password +
            '@' +
            this.host +
            ':' +
            this.port
        }
        else if (this.host) {
            return 'amqp://' +
            this.host +
            ':' +
            this.port
        }
        else {
            return null;
        }
    }
}