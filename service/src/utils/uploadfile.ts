import { cos } from './tencos'
import { randomString } from './common';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment'; // 使用moment库来处理日期，更方便
// const { logger } = require('./serviceLogger');

const uploadFile = async (fileName, fileBuffer, directory = 'Photo') => {
    return new Promise((resolve, reject) => {
        // 获取年月日并进行拼接
        if (!directory) {
            directory = 'Photo';
        }
        if (!fileName) {
            fileName = randomString();
        }
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const path = `${directory}/` + year + '' + month + '' + day + '/' + fileName + '.png';
        cos.putObject({
            Bucket: 'xiaosaturn-1254446013',
            Region: 'ap-nanjing',
            Key: path,
            StorageClass: 'STANDARD',
            Body: Buffer.from(fileBuffer),
        }, (err, data) => {
            if (err) {
                console.log('上传失败', err);
                reject(err);
            } else {
                const url = 'https://image.xiaosaturn.com/' + path;
                resolve(url);
            }
        })
    });
}

const uploadFile2 = async (req: Request, res: Response) => {
    return new Promise(async (resolve, reject) => {
        if (req.file.buffer) {
            const url = await uploadFile(randomString(), req.file.buffer);
            res.send({
                code: 200,
                msg: 'success',
                data: url
            })
        } else {
            res.send({
                code: 405,
                msg: 'file not exist',
            })
        }
    })
}

export {
    uploadFile,
    uploadFile2
}