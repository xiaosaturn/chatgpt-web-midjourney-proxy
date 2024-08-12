import { db, resultsWithCamelCase } from './index.ts';
import { getRedisValue } from './redis.ts';
import { logger } from '../utils/logger';

interface User {
    id?: number
    email?: string
    avatar?: string
    nickname?: string
    mobile?: string
    createTime?: string
    updatedTime?: string
    status?: string
    gender?: string
    password?: string
    expireTime?: string
    level?: number // 会员等级，1-免费会员， 2-月付会员，3-年度会员
    chatCount?: string | number, // 今日对话剩余次数
    drawCount?: number | string, // 绘画剩余次数
}

/**
 * 根据email获取用户信息
 */
const getUserByEmail = async (email) => {
    const sql = `select id, email, avatar, mobile, create_time, update_time,
        status, gender, password, DATE_FORMAT(expire_time, '%Y-%m-%d') AS expire_time
        from member_user where email = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, email, (err, results) => {
            if (err) {
                throw Error(err)
            } else {
                const result = results[0];
                if (result) {
                    const user: User = resultsWithCamelCase(results[0]);
                    resolve({
                        id: user.id,
                        email: user.email,
                        nickname: user.nickname,
                        avatar: user.avatar,
                        mobile: user.mobile,
                        createTime: user.createTime,
                        updatedTime: user.updatedTime,
                        status: user.status,
                        gender: user.gender,
                        password: user.password,
                        expireTime: user.expireTime
                    });
                } else {
                    resolve(null);
                }
            }
        });
    });
}

/**
 * 根据userId获取用户信息
 */
const getUserById = async (userId) => {
    const sql = `select mu.id, mu.nickname, mu.email, mu.avatar, mu.mobile, 
    DATE_FORMAT(mu.create_time, '%Y-%m-%d') as createTime, DATE_FORMAT(mu.update_time, '%Y-%m-%d') as updateTime, 
    mu.status, mu.gender, mu.password, DATE_FORMAT(mu.expire_time, '%Y-%m-%d') as expireTime, mlr.level as level from member_user mu
    left join member_level_record mlr on mlr.user_id = mu.id
    where mu.id=?`;
    return new Promise((resolve, reject) => {
        db.query(sql, userId, async (err, results) => {
            if (err) {
                throw Error(err)
            } else {
                const result = results[0];
                if (result) {
                    const user: User = results[0];
                    user.chatCount = Number(await getRedisValue(`expireTimeLevel${user.level}-` + user.id));
                    user.drawCount = Number(await getRedisValue(`midLevel${user.level}-` + user.id));
                    resolve(user);
                }
            }
        });
    });
}

const insertUser = async (params) => {
    const sql = 'insert into member_user \
        (nickname, avatar, email, password, level_id, register_ip, register_terminal_name)\
        values(?, ?, ?, ?, 3, ?, ?)';
    return new Promise((resolve, reject) => {
        db.query(sql,
            [params.nickname, params.avatar, params.email, params.password, params.registerIp, params.registerTerminalName],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result.insertId);
                }
            });
    });
}

const updateUser = async (params) => {
    let sql = 'update member_user set ';
    let updateFields = [];
    let values = [];
    if (params.avatar) {
        updateFields.push('avatar = ?');
        values.push(params.avatar);
    }
    if (params.nickname) {
        updateFields.push('nickname = ?');
        values.push(params.nickname);
    }
    if (updateFields.length == 0) {
        console.log('No fields to update');
        return 0; // 或者抛出一个错误，取决于你的需求
    }
    sql += updateFields.join(', ');
    sql += ' WHERE id = ?';
    values.push(params.id); 
    return new Promise((resolve, reject) => {
        db.query(sql, values,
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(1);
                }
            });
    });
}

const insertUserPoint = (userId) => {
    const sql = `insert into member_point_record (user_id, title, description, point, total_point) values (?, ?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.query(sql, [userId, '首次注册', '首次注册赠送5次消息体验', 5, 5],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result.insertId);
                }
            });
    });
}

const insertUserLevelRecord = (userId) => {
    const sql = `insert into member_level_record (user_id, level_id, level) values (?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.query(sql, [userId, 1, 1],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result.insertId);
                }
            });
    });
}

const updateUserLevelRecord = (userId, level) => {
    const sql = `update member_level_record set level = ?, level_id = ? where id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [level, level ,userId],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result.insertId);
                }
            });
    });
}

const updateUserExpireTime = async (userId, level) => {
    const res: User = await getUserById(userId);
    let arr;
    const nowDay = new Date();
    if (res.expireTime) {
        // 有值，说明还要加上
        logger.info({
            msg: res,
            label: '有expireTime：'
        });
        arr = res.expireTime.split('-'); // ['2024', '5', '9']
        if (level == 2) {
            if (arr[1] == '12') {
                arr[0] = String(Number(arr[0]) + 1).padStart(2, '0');
                arr[1] = '01'
            } else {
                arr[1] = String(Number(arr[1]) + 1).padStart(2, '0');
            }
        } else if (level == 3) {
            arr[0] += 1; // 加一年
        }
    } else {
        // 没值，则初始化
        logger.info({
            msg: res,
            label: '无expireTime：'
        });
        if (level == 2) {
            if (nowDay.getMonth() + 1 == 12) {
                arr = [nowDay.getFullYear() + 1, '01', String(nowDay.getDate()).padStart(2, '0')]
            } else {
                arr = [nowDay.getFullYear(), String(nowDay.getMonth() + 1).padStart(2, '0'), String(nowDay.getDate()).padStart(2, '0')]
            }
        } else if (level == 3) {
            arr = [nowDay.getFullYear() + 1, String(nowDay.getMonth() + 1).padStart(2, '0'), String(nowDay.getDate()).padStart(2, '0')]
        }
    }
    logger.info({
        msg: arr,
        label: '处理好的arr为：'
    });
    const newExpireTime = arr[0] + '-' + arr[1] + '-' + arr[2] + ' '
    String(nowDay.getHours()).padStart(2, '0') + ':' + String(nowDay.getMinutes() ).padStart(2, '0') + ':' + String(nowDay.getSeconds() ).padStart(2, '0');
    const sql = `update member_user set expire_time = ?, level_id = ? where id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [newExpireTime, level ,userId],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result.insertId);
                }
            });
    });
}

const insertImage = async (obj) => {
    const sql = `insert into member_user_photo (user_id, image_url, prompt, action) values (?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.query(sql, [obj.id, obj.imageUrl, obj.prompt, obj.action],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result);
                }
            });
    });
}

const selectImagesByUserId = async (userId) => {
    const sql = `select id, user_id as userId, image_url as imageUrl, prompt, action, type, 
    create_time as createTime, update_time as updateTime
     from member_user_photo where user_id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [userId],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result);
                }
            });
    });
}

export {
    getUserByEmail,
    getUserById,
    insertUser,
    updateUser,
    insertUserPoint,
    insertUserLevelRecord,
    selectImagesByUserId,
    insertImage,
    updateUserLevelRecord,
    updateUserExpireTime,
    type User
}
