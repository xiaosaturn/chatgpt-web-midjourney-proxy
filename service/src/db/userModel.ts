const { db, resultsWithCamelCase } = require('./index.ts');

/**
 * 根据email获取用户信息
 */
exports.getUserByEmail = async (userId) => {
    const sql = "select * from member_user where email=?";
    return new Promise((resolve, reject) => {
        db.query(sql, userId, (err, results) => {
            if (err) {
                throw Error(err)
            } else {
                const result = results[0];
                if (result) {
                    const user = resultsWithCamelCase(results[0]);
                    resolve({
                        email: user.email,
                        avatar: user.avatar,
                        mobile: user.mobile,
                        createTime: user.createTime,
                        updatedTime: user.updatedTime,
                        status: user.status,
                        gender: user.gender,
                        password: user.password,
                        expireDate: user.expireDate
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
exports.getUserById = async (userId) => {
    const sql = "select * from member_user where id=?";
    return new Promise((resolve, reject) => {
        db.query(sql, userId, (err, results) => {
            if (err) {
                throw Error(err)
            } else {
                const result = results[0];
                if (result) {
                    const user = resultsWithCamelCase(results[0]);
                    resolve({
                        email: user.email,
                        avatar: user.avatar,
                        mobile: user.mobile,
                        createTime: user.createTime,
                        updatedTime: user.updatedTime,
                        status: user.status,
                        gender: user.gender,
                        password: user.password,
                        expireDate: user.expireDate
                    });
                }
            }
        });
    });
}

exports.insertUser = async (params) => {
    const sql = 'insert into member_user \
        (avatar, email, password, register_ip, register_terminal_name)\
        values(?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        db.query(sql,
            [params.avatar, params.email, params.password, params.registerIp, params.registerTerminalName],
            (err, result) => {
            if (err) {
                throw Error(err);
            } else {
                resolve(1);
            }
        });
    });
}
