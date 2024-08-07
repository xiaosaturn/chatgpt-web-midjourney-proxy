import { Redis } from 'ioredis'
import cron from 'node-cron';
import { logger } from '../utils/logger';

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

const resetArr = [{
    level: 'expireTimeLevel1-*', // 用于匹配要重置的键的模式 *暂定为用户id
    value: '5' // 重置后的值
}, {
    level: 'expireTimeLevel2-*',
    value: '50'
}, {
    level: 'expireTimeLevel3-*',
    value: '100'
}]

// 扫描并重置键值的函数
const scanAndResetKeys = async () => {
    logger.info({
        msg: {
            now: new Date()
        },
        lable: '开始扫描并重置键值，时间为：'
    })
    let cursor = '0';
    for (let item of resetArr) {
        do {
            const [newCursor, keys] = await redis.scan(cursor, 'MATCH', item.level, 'COUNT', 100);
            cursor = newCursor;

            for (const key of keys) {
                await redis.set(key, item.value);
                logger.info({
                    msg: {
                        value: item.value
                    },
                    lable: `重置键 ${key} 的值`
                })
            }
        } while (cursor !== '0');
        logger.info({
            msg: {
                level: item.level
            },
            lable: '扫描并重置完成'
        });
    }
}

// 定时任务确保每天 0 点准时执行重置操作。
cron.schedule('0 0 * * *', async () => {
    try {
        await scanAndResetKeys()
    } catch (error) {
        logger.info({
            msg: error,
            lable: '重置出错了(Error resetting Redis key)'
        })
    }
});

export {
    setRedisValue,
    getRedisValue,
    setRedisValueKeepTTL
}
