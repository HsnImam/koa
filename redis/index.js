const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);
const redisClient = redis.createClient('6379', '127.0.0.1');

redisClient.on('connect', _ => console.log('connected to redis'));
redisClient.on('error', err => console.log('Something went wrong' + err));

module.exports = redisClient;