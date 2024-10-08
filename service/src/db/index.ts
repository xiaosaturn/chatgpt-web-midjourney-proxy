// const mysql = require('mysql')
import mysql from 'mysql'

// 数据库
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
})

const resultsWithCamelCase = (result) => {
    const newRow = {};
    Object.keys(result).forEach(key => {
        const camelCaseKey = key.replace(/_([a-z])/g, function (m, p1) {
            return p1.toUpperCase();
        });
        newRow[camelCaseKey] = result[key];
        if (camelCaseKey == 'createTime' || camelCaseKey == 'updateTime') {
            // format time YYYY-MM-dd hh:mm:ss
            const dateTime = formatDate(result[key]);
            newRow[camelCaseKey] = dateTime;
        }
        if (camelCaseKey == 'expireTime') {
            // format time YYYY-MM-dd
            if (result[key]) {
                const dateTime = formatDate2(result[key]);
                newRow[camelCaseKey] = dateTime;
            } else {
                newRow[camelCaseKey] = '';
            }
        }
    });
    return newRow;
};

const formatDate = (dateString) => {
    let date = new Date(dateString);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero based
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const formatDate2 = (dateString) => {
    let date = new Date(dateString);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero based
    let day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export {
    db,
    resultsWithCamelCase
}