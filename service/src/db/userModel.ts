import { db, resultsWithCamelCase } from './index.ts';

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
    level?: number // 会员等级， 1-月付会员，2-年度会员
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
        db.query(sql, userId, (err, results) => {
            if (err) {
                throw Error(err)
            } else {
                const result = results[0];
                if (result) {
                    const user: User = results[0];
                    resolve(user);
                }
            }
        });
    });
}

const insertUser = async (params) => {
    const sql = 'insert into member_user \
        (nickname, avatar, email, password, register_ip, register_terminal_name)\
        values(?, ?, ?, ?, ?, ?)';
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
        db.query(sql, [userId, 3, 0],
            (err, result) => {
                if (err) {
                    throw Error(err);
                } else {
                    resolve(result.insertId);
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
    type User
}
