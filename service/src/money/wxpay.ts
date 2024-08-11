import crypto from 'crypto';
import url from 'url';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getRedisValue, setRedisValue } from '../db/redis';
import { insertUserPoint, insertUserLevelRecord, updateUserLevelRecord, updateUserExpireTime } from '../db/userModel';
import xml2js from 'xml2js';
import bodyParser from 'body-parser';
import moment from 'moment';
import axios from 'axios';
import fs from 'fs';

const nativeURL = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native';
const wxPlatformCertUrl = 'https://api.mch.weixin.qq.com/v3/certificates';
const schema = "WECHATPAY2-SHA256-RSA2048";
const KEY_LENGTH_BYTE = 32;
const AUTH_TAG_LENGTH_BYTE = 16;

const getToken = (method, httpurl, body = null) => {
    const nonceStr = generateNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    const message = buildMessage(method, httpurl, timestamp, nonceStr, body);
    console.log('msg', message);
    logger.info({
        msg: message,
        label: '构造的msg为：'
    });
    const signature = sign(Buffer.from(message, 'utf-8'));

    return `mchid="${process.env.WXPAY_MCH_ID}",`
        + `nonce_str="${nonceStr}",`
        + `timestamp="${timestamp}",`
        + `serial_no="${process.env.WXPAY_CERT_NO}",`
        + `signature="${signature}"`;
}

const sign = (message) => {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    return sign.sign(process.env.WXPAY_SECRET_KEY, 'base64');
}

const buildMessage = (method, httpurl, timestamp, nonceStr, body = null) => {
    const parsedUrl = new url.URL(httpurl);
    let canonicalUrl = parsedUrl.pathname;
    if (parsedUrl.search) {
        canonicalUrl += parsedUrl.search;
    }

    if (method == 'POST') {
        return `${method}\n`
            + `${canonicalUrl}\n`
            + `${timestamp}\n`
            + `${nonceStr}\n`
            + `${body}\n`;
    } else {
        return `${method}\n`
            + `${canonicalUrl}\n`
            + `${timestamp}\n`
            + `${nonceStr}\n\n`;
    }
}

const generateNonceStr = () => {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function createAesKey(aesKey) {
    if (Buffer.from(aesKey).length !== KEY_LENGTH_BYTE) {
        throw new Error('无效的ApiV3Key，长度应为32个字节');
    }
    return Buffer.from(aesKey);
}

function decryptToString(aesKey, associatedData, nonceStr, ciphertext) {
    const decodedCiphertext = Buffer.from(ciphertext, 'base64');
    if (decodedCiphertext.length <= AUTH_TAG_LENGTH_BYTE) {
        return false;
    }
    try {
        const authTag = decodedCiphertext.subarray(decodedCiphertext.length - AUTH_TAG_LENGTH_BYTE);
        const data = decodedCiphertext.subarray(0, decodedCiphertext.length - AUTH_TAG_LENGTH_BYTE);
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            aesKey,
            Buffer.from(nonceStr)
        );
        decipher.setAuthTag(authTag);
        decipher.setAAD(Buffer.from(associatedData));
        const decrypted = decipher.update(data);
        const final = decipher.final();
        return Buffer.concat([decrypted, final]).toString('utf8');;
    } catch (error) {
        if (error.message) {
            throw new Error('Decryption failed: ' + error);
        } else {
            throw error;
        }
    }
}

const getWXPlatformCert = async () => {
    const token = getToken('GET', wxPlatformCertUrl);
    const headers = {
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Accept': 'application/json',
        'Authorization': `${schema} ${token}`,
        'Accept-Language': 'zh-CN'
    };
    logger.info({
        msg: headers,
        label: '获取微信平台证书的Headers：',
    });
    try {
        // 用axios报错，json转换循环引用的错误，所以用fetch
        // const response = await axios.get(wxPlatformCertUrl, {
        //     headers
        // });
        const response = await fetch(wxPlatformCertUrl, {
            method: 'GET',
            headers: headers,
        });
        const data = await response.json();
        logger.info({
            msg: data,
            label: '获取微信平台证书的返回结果：',
        });
        const realData = data['data'];
        if (realData && realData[0]) {
            console.log('realData:', realData);
            const encryptCertificate = realData[0]['encrypt_certificate'];
            const key = createAesKey(Buffer.from(process.env.WXPAY_APIV3_KEY, 'utf8'));
            const associatedData = encryptCertificate.associated_data;
            const nonce = Buffer.from(encryptCertificate.nonce, 'utf8');
            const decrypted = decryptToString(key, associatedData, nonce, encryptCertificate.ciphertext);
            logger.info({
                msg: decrypted,
                label: '解密出的密文：',
            });
            return decrypted;
        }
    } catch (error) {
        logger.error({
            msg: error.response ? error.response.data : error.message,
            label: '获取微信平台证书出错了：',
        });
        throw error;
    }
}

const payNativeOrder = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    logger.info({
        msg: 'wxpay',
        label: '调用微信支付开始',
    });
    const orderNo = 'YSH' + moment().format('YYYYMMDDHHmmss');
    const body = {
        appid: process.env.WXPAY_APP_ID,
        mchid: process.env.WXPAY_MCH_ID,
        description: "月度会员",
        out_trade_no: orderNo,
        notify_url: "https://all-ai.chat/app/money/wxcallback",
        amount: {
            total: 1
        }
    };
    if (req.body.level == 2) {
        // 月度会员
        
    } else if (req.body.level == 3) {
        // 年度会员
        body.description = "年度会员";
        body.amount.total = 69900;
    }

    const token = getToken('POST', nativeURL, customStringify(body));
    const authorization = schema + ' ' + token;
    logger.info({
        msg: token,
        label: '生成的token：'
    });
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authorization
    };
    logger.info({
        msg: body,
        label: '调用微信Native Pay的入参：',
    });
    try {
        // 用axios报错，json转换循环引用的错误，所以用fetch
        // const response = await axios.post(nativeURL, body, {
        //     headers,
        // });
        const response = await fetch(nativeURL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        logger.info({
            msg: JSON.stringify(data),
            label: '调用微信Native Pay返回结果：',
        });
        res.send({
            code: 200,
            msg: 'success',
            data: data.code_url
        });
        // console.log('Native支付二维码链接data:', response.data);
        // console.log('Native支付二维码链接:', response.data.code_url);
        // return response.data;
    } catch (error) {
        res.status(402);
        res.send({
            code: 402,
            msg: error.response ? error.response.data : error.message
        });
        console.error('请求失败:', error.response ? error.response.data : error.message);
        throw error;
    }
}

const wxpayCallback = async (req: Request, res: Response, next: NextFunction) => {
    const timestamp = req.headers['Wechatpay-Timestamp'];
    const nonce = req.headers['Wechatpay-Nonce'];
    const signature = req.headers['Wechatpay-Signature'];
    const serial = req.headers['Wechatpay-Serial'];

    if (serial == process.env.WXPAY_CERT_NO) {
        const body = req.body; // 回调请求体
        const message = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;

        // 读取保存的平台证书
        const cert = fs.readFileSync('path/to/platform_cert.pem', 'utf8');
        const certStr = await getWXPlatformCert();
        if (certStr) {
            const verify = crypto.createVerify('RSA-SHA256');
            verify.update(message);
            const isValid = verify.verify(certStr, sign(Buffer.from(message, 'utf-8')), 'base64');
            if (isValid) {
                console.log('签名验证通过');
            } else {
                console.log('签名验证失败');
            }
        }
    } else {

    }
}

const customStringify = (obj) => {
    // 用于存储已经遍历过的对象，防止循环引用
    const seen = new WeakSet();

    return (function stringify(obj) {
        // 处理 null
        if (obj === null) return 'null';

        // 处理基本类型
        if (typeof obj !== 'object') {
            if (typeof obj === 'string') return '"' + obj.replace(/"/g, '\\"') + '"';
            if (typeof obj === 'number' && !isFinite(obj)) return 'null'; // 处理 NaN 和 Infinity
            if (typeof obj === 'function') return undefined; // 函数通常在 JSON 中被忽略
            return String(obj);
        }

        // 检测循环引用
        if (seen.has(obj)) {
            throw new TypeError('Converting circular structure to JSON');
        }

        seen.add(obj);

        let result;

        // 处理数组
        if (Array.isArray(obj)) {
            result = '[' + obj.map(item => {
                const value = stringify(item);
                return value !== undefined ? value : 'null';
            }).join(',') + ']';
        }
        // 处理普通对象
        else {
            const pairs = [];
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = stringify(obj[key]);
                    if (value !== undefined) {
                        pairs.push('"' + key + '":' + value);
                    }
                }
            }
            result = '{' + pairs.join(',') + '}';
        }

        seen.delete(obj);
        return result;
    })(obj);
}


export {
    payNativeOrder,
    wxpayCallback,
    getWXPlatformCert,
}