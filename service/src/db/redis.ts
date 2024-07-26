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

// // 用于匹配要重置的键的模式
// const RESET_PATTERN_LEVEL1 = 'expireTimeLevel1:*'; // 月度会员
// const RESET_PATTERN_LEVEL2 = 'expireTimeLevel2:*'; // 年度会员

// // 重置后的值
// const RESET_VALUE_LEVEL1 = '50';
// const RESET_VALUE_LEVEL2 = '100';

// // 扫描并重置键值的函数
// async function scanAndResetKeys() {
//     console.log('开始扫描并重置键值...');
//     let cursor = '0';
//     do {
//         const [newCursor, keys] = await redis.scan(cursor, 'MATCH', RESET_PATTERN, 'COUNT', 100);
//         cursor = newCursor;
        
//         for (const key of keys) {
//             await redis.set(key, RESET_VALUE);
//             console.log(`重置键 ${key} 的值为 ${RESET_VALUE}`);
//         }
//     } while (cursor !== '0');
//     console.log('扫描并重置完成');
// }

// cron.schedule('0 0 * * *', async () => {
//     try {
//         // await setRedisValue(resetValue);
//     } catch (error) {
//         console.error('Error resetting Redis key:', error);
//     }
// });

export {
    setRedisValue,
    getRedisValue,
    setRedisValueKeepTTL
}
