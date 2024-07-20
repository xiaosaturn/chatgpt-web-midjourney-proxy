const Redis = require('ioredis')

const redis = new Redis({
    host: process.env.REDIS_HOST, // Redis服务器的主机名
    port: process.env.REDIS_PORT, // Redis服务器的端口号
    password: process.env.REDIS_AUTH, // Redis服务器的密码（如果有的话）
    lazyConnect: true
});

exports.setRedisValue = (key, value, expire) => {
    if (expire) {
        // 传有效期expire，调用setex
        redis.setex(key, expire, value);
    } else {
        // 不传expire，永久存储
        redis.set(key, value);
    }
}

exports.getRedisValue = async (key) => {
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
