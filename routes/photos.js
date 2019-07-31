const redisClient = require('./../redis');
const request = require('request-promise');

module.exports = ({
    photoRouter
}) => {
    photoRouter.get('/', async (ctx, next) => {
        // key to store results in Redis store
        const photosRedisKey = 'user:photos';
        const photo = await redisClient.getAsync(photosRedisKey);
        
        if(photo)
            ctx.body = {source: 'cache', data: JSON.parse(photo) };
        else {
            const response = await request({
                url : `https://jsonplaceholder.typicode.com/photos`,
                method: 'GET',
                json: true
            });
            await redisClient.setAsync(photosRedisKey, JSON.stringify(response), 'EX', 3600);
            ctx.body = {source: 'api', data: response}
        }


    });
}