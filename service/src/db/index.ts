const mysql = require('mysql')

// 数据库
exports.db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
})

exports.resultsWithCamelCase = (result) => {
    const newRow = {};
    Object.keys(result).forEach(key => {
        const camelCaseKey = key.replace(/_([a-z])/g, function (m, p1) {
            return p1.toUpperCase();
        });
        newRow[camelCaseKey] = result[key];
    });
    return newRow;
};