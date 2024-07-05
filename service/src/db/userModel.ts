const { db, resultsWithCamelCase } = require('./index.ts');

exports.getUserById = async (userId) => {
    if (!userId) return 'no userId'
    const sql = "select * from member_user where id=?";
    return new Promise((resolve, reject) => {
        db.query(sql, userId, (err, results) => {
            if (err) {
                throw Error(err)
            } else {
                const result = results[0];
                if (result) {
                    resolve(resultsWithCamelCase(results[0]));
                }
            }
        });
    });
}