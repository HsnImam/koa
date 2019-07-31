const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const redis = require('redis');
const redisClient = require('./redis');

redisClient.set('key', 'value', redis.print);
redisClient.get('key', (err, res) => {
    if (err) console.log(err);
    console.log(res);
})

const app = new Koa();
const router = new Router();
const systemRouter = new Router({
    prefix: '/systems'
});
const dogRouter = new Router({
    prefix: '/dogs'
});
const photoRouter = new Router({
    prefix: '/photos'
})

// require our external routes and pass in the router
require('./routes/basic')({
    router
});
require('./routes/dogs')({
    dogRouter
});
require('./routes/system')({
    systemRouter
});
require('./routes/photos')({
    photoRouter
});

app.use(logger());
app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(dogRouter.routes());
app.use(dogRouter.allowedMethods());

app.use(systemRouter.routes());
app.use(systemRouter.allowedMethods());

app.use(photoRouter.routes());
app.use(photoRouter.allowedMethods());

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
        ctx.app.emit('error', err, ctx);
    }
});

const server = app.listen(3000);
console.log(`Server is running on http://127.0.0.1:3000`);
module.exports = server;