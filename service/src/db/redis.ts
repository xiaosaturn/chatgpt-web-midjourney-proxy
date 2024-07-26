import { Redis } from 'ioredis'
const cron = require('node-cron');

const redis = new Redis(Number(process.env.REDIS_PORT), process.env.REDIS_HOST, {
    password: process.env.REDIS_AUTH
})

// const redis = new Redis({
//     host: process.env.REDIS_HOST, // Redis服务器的主机名
//     port: process.env.REDIS_PORT, // Redis服务器的端口号
//     password: process.env.REDIS_AUTH, // Redis服务器的密码（如果有的话）
//     lazyConnect: true
// });

const setRedisValue = (key, value, expire = '') => {
    if (expire) {
        // 传有效期expire，调用setex
        redis.setex(key, expire, value);
    } else {
        // 不传expire，永久存储
        redis.set(key, value);
    }
}

const setRedisValueKeepTTL = (key, value) => {
    redis.set(key, value, 'KEEPTTL');
}

const getRedisValue = async (key) => {
    return new Promise((resolve, reject) => {
        redis.get(key, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

cron.schedule('0 0 * * *', async () => {
    try {
        // await setRedisValue(resetValue);
    } catch (error) {
        console.error('Error resetting Redis key:', error);
    }
});

export {
    setRedisValue,
    getRedisValue,
    setRedisValueKeepTTL
}
