import winston from 'winston';
const { format } = winston;

import moment from 'moment-timezone';

// 设置时区为'Asia/Shanghai'
moment.tz.setDefault('Asia/Shanghai');

// interface LogParams {
//     level?: number
//     message?: IMessage | string
//     label?: string
//     timestamp?: string
// }

// interface IMessage {
//     url?: string
//     method?: string
//     params?: object
//     auth?: object
//     headers?: object
//     realMsg?: string
// }

// const message: IMessage = { url: '', method: '', params: {}, auth: {}, headers: {}};

interface MsgType {
    url?: string
    method?: string
    auth?: string
    headers?: string
    params?: string
    query?: string
    body?: string
    weixin?: string
}

const myFormat = format.printf(({ level, message, label, timestamp }) => {
    let obj: MsgType = {};
    const formattedTimestamp = timestamp.toLocaleString('cn-ZH', { timeZone: 'Asia/Shanghai' });
    if (typeof message === 'object') {
        const msgObj = message.msg;
        if (msgObj.url) {
            // 说明是req
            obj.url = msgObj.url;
            obj.method = msgObj.method;
            obj.auth = msgObj.auth;
            obj.headers = msgObj.headers;
            obj.params = msgObj.params;
            obj.query = msgObj.query;
            obj.body = msgObj.body;
        } else {
            // 说明是对象
            obj = msgObj;
        }
    } else {
        // 非object类型，直接json stringify
        obj = message.msg;
    }
    return `${formattedTimestamp} [${message.label}] ${level}: ${JSON.stringify(obj)}`;
});

const logger = winston.createLogger({
    format: format.combine(
        // format.label({ label: 'MasterH'}),
        // format.label({ label: true }), // 包含标签
        format.timestamp({
            format: () => moment().format('YYYY-MM-DD HH:mm:ss')
        }),
        myFormat
    ),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'info.log', level: 'info' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: format.simple(),
    }));
}

export {
    logger
}