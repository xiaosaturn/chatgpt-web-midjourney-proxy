import { isNotEmptyString } from '../utils/is'
import { Request, Response, NextFunction } from 'express';
import FormData from 'form-data';
import fetch from 'node-fetch';
import md5 from 'md5';

import { getRedisValue, setRedisValue, setRedisValueKeepTTL } from '../db/redis';
import { getUserByEmail, getUserById } from '../db/userModel';

import moment from 'moment'; // 使用moment库来处理日期，更方便
import jwt from 'jsonwebtoken';

import { logger } from '../utils/logger';

import type { User } from '../db/userModel'
import { log } from 'console';

// 存储IP地址和错误计数的字典
const ipErrorCount = {};

// 存储被禁止登录的IP地址及禁止结束时间的字典
const bannedIPs = {};

export const mlog = (...arg) => {
    //const M_DEBUG = process.env.M_DEBUG
    // if(['error','log'].indexOf( arg[0] )>-1 ){ //必须显示的
    // }else  if(! isNotEmptyString(process.env.M_DEBUG) ) return ;

    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    console.log(currentTime, ...arg)
}

export const verify = async (req: Request, res: Response) => {
    try {
        checkLimit(req, res);
        const { token } = req.body as { token: string }
        if (!token)
            throw new Error('Secret key is empty')

        if (process.env.AUTH_SECRET_KEY !== token)
            throw new Error('密钥无效 | Secret key is invalid')

        clearLimit(req, res);
        res.send({ status: 'Success', message: 'Verify successfully', data: null })
    }
    catch (error) {
        res.send({ status: 'Fail', message: error.message, data: null })
    }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    if (isNotEmptyString(AUTH_SECRET_KEY)) {
        try {
            checkLimit(req, res);
            const Authorization = req.header('Authorization')
            if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim())
                throw new Error('Error: 无访问权限 | No access rights')

            clearLimit(req, res);
            next()
        }
        catch (error) {
            res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
        }
    }
    else {
        next()
    }
}

const getIp = (req: Request) => {
    if (req.header && req.header('x-forwarded-for')) return req.header('x-forwarded-for');
    return req.ip;
}

const checkLimit = (req: Request, res: Response) => {
    if (!isNotEmptyString(process.env.AUTH_SECRET_ERROR_COUNT)) {
        return;
    }

    const bTime = process.env.AUTH_SECRET_ERROR_TIME ?? 10;

    // 允许的最大错误次数
    const maxErrorCount = +process.env.AUTH_SECRET_ERROR_COUNT;

    // 禁止登录的时间（毫秒）
    let banTime = (+bTime) * 60 * 1000; // 10分钟
    if (banTime <= 0) banTime = 10 * 60 * 1000;

    const ipAddress = getIp(req);

    if (bannedIPs[ipAddress] && Date.now() < bannedIPs[ipAddress]) {
        const timeLeft = Math.ceil((bannedIPs[ipAddress] - Date.now()) / 1000);
        console.log("myIP ", ipAddress, ipErrorCount[ipAddress]);

        //return res.status(403).send(`IP地址被禁止登录，剩余时间: ${timeLeft}秒`);
        let ts = timeLeft > 60 ? (timeLeft / 60).toFixed(0) + '分钟' : timeLeft + '秒'
        throw new Error(`Error: ${ipAddress} 验证次数过多，请在${ts}后重试！`)
    }
    ipErrorCount[ipAddress] = ipErrorCount[ipAddress] ? (ipErrorCount[ipAddress] + 1) : 1;
    if (ipErrorCount[ipAddress] >= maxErrorCount) {
        bannedIPs[ipAddress] = Date.now() + banTime;
    }
}

const clearLimit = (req: Request, res: Response) => {
    const ipAddress = getIp(req);
    bannedIPs[ipAddress] = 0;
    ipErrorCount[ipAddress] = 0;
}

// authV2认证token后，next({ id, email })传参，用户的email和id
export const authV2 = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    console.log('token', token)
    logger.info({
        msg: req,
        label: 'authV2开始认证',
    });
    if (!token) {
        res.status(401);
        return res.send({
            code: 401,
            msg: '无token，请先登录'
        });
    }
    jwt.verify(token.split(' ')[1], process.env.SECRET_KEY, {
        algorithms: ['HS256']
    }, async (err, decoded) => {
        if (err) {
            res.status(401);
            return res.send({
                code: 401,
                msg: '无效的token，请登录'
            });
        }
        const redisToken = await getRedisValue(decoded.email)
        if (redisToken != token) {
            res.status(403);
            return res.send({
                code: 401,
                msg: '无效的token，请重新登录'
            });
        }
        logger.info({
            msg: 'redisToken',
            label: 'authV2开始认证',
        });
        req.query.email = decoded.email; // 从token里解析出用户email，放到query上
        req.query.id = decoded.id; // 从token里解析出用户id，放到query上
        next({
            email: decoded.email,
            id: decoded.id
        });
    });
}

// authV3 校验gpt使用次数，接收 next({ id, email })传参，用户的email和id
export const authV3 = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    const user: User = await getUserById(obj.id);
    logger.info({
        msg: user,
        label: 'authV3开始认证',
    });
    let tempMsgCount;
    let redisCountKey;
    if (user.level == 1) {
        redisCountKey = 'expireTimeLevel1-' + obj.id;
        tempMsgCount = await getRedisValue(redisCountKey);
    } else if (user.level == 2) {
        redisCountKey = 'expireTimeLevel2-' + obj.id;
        tempMsgCount = await getRedisValue(redisCountKey);
    } else if (user.level == 3) {
        redisCountKey = 'expireTimeLevel3-' + obj.id;
        tempMsgCount = await getRedisValue(redisCountKey);
    }
    let msgCount = Number(tempMsgCount)
    if (user.expireTime) {
        // 有值，说明充钱了
        const expiryDate = moment(user.expireTime); // 将数据库日期转换为moment对象
        const currentDate = moment(); // 获取当前日期
        if (user.level == 1) {
            // 没充值，不需要判断会员是否过期，每天免费送5条
            if (msgCount <= 0) {
                res.status(405);
                return res.send({
                    code: 405,
                    msg: '已超过24小时最大使用次数，请0点之后再试，谢谢'
                });
            }
        } else {
            if (expiryDate.isBefore(currentDate)) {
                // 过期了，需要重新充值
                res.status(403);
                return res.send({
                    code: 403,
                    msg: '账户已过期，请联系客服充值'
                });
            } else {
                // 没过期，判断24小时是否超过指定次数
                if (user.level == 2) {
                    // 月付会员，不超过50次
                    if (msgCount <= 0) {
                        res.status(405);
                        return res.send({
                            code: 405,
                            msg: '已超过24小时最大使用次数，请0点之后再试，谢谢'
                        });
                    }
                } else if (user.level == 3) {
                    // 年度会员，不超过100次
                    if (msgCount <= 0) {
                        res.status(405);
                        return res.send({
                            code: 405,
                            msg: '已超过24小时最大使用次数，请0点之后再试，谢谢'
                        });
                    }
                }
            }
        }
    } else {
        // 没值，每天体验5次
        if (msgCount <= 0) {
            res.status(405);
            return res.send({
                code: 405,
                msg: '已超过24小时最大使用次数，请0点之后再试，谢谢'
            });
        }
    }
    req.query.email = obj.email; // 从token里解析出用户email，放到query上
    req.query.id = obj.id; // 从token里解析出用户id，放到query上

    // 将msgCount--
    msgCount--;
    await setRedisValue(redisCountKey, msgCount);
    next()
}

// authV4只认证token，next()不传参
export const authV4 = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    console.log('token', token)
    logger.info({
        msg: req,
        label: 'authV2开始认证',
    });
    if (!token) {
        res.status(401);
        return res.send({
            code: 401,
            msg: '无token，请先登录'
        });
    }
    jwt.verify(token.split(' ')[1], process.env.SECRET_KEY, {
        algorithms: ['HS256']
    }, async (err, decoded) => {
        if (err) {
            res.status(401);
            return res.send({
                code: 401,
                msg: '无效的token，请登录'
            });
        }
        const redisToken = await getRedisValue(decoded.email)
        if (redisToken != token) {
            res.status(403);
            return res.send({
                code: 401,
                msg: '无效的token，请重新登录'
            });
        }
        logger.info({
            msg: 'redisToken',
            label: 'authV2开始认证',
        });
        req.query.email = decoded.email; // 从token里解析出用户email，放到query上
        req.query.id = decoded.id; // 从token里解析出用户id，放到query上
        next();
    });
}

// authV5 校验midjournary使用次数，接收 next({ id, email })传参，用户的email和id
export const authV5 = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    const user: User = await getUserById(obj.id);
    logger.info({
        msg: user,
        label: 'authV5开始认证',
    });
    if (req.url.includes('submit') || req.url.includes('insight-face/swap')) {
        // submit是提交任务，insight-face/swap是换脸，都需要扣除次数，其他查询不扣次数
        let tempMsgCount;
        let redisCountKey;
        if (user.level == 0) {
            redisCountKey = 'midLevel0-' + obj.id;
            res.status(405);
            return res.send({
                code: 405,
                msg: 'midjournary仅限月度会员或年度会员，请充值后使用，谢谢'
            });
        } else if (user.level == 1) {
            redisCountKey = 'midLevel1-' + obj.id;
            tempMsgCount = await getRedisValue(redisCountKey);
        } else if (user.level == 2) {
            redisCountKey = 'midLevel2-' + obj.id;
            tempMsgCount = await getRedisValue(redisCountKey);
        }
        let msgCount = Number(tempMsgCount);
        if (user.expireTime) {
            // 有值，说明充钱了
            const expiryDate = moment(user.expireTime); // 将数据库日期转换为moment对象
            const currentDate = moment(); // 获取当前日期
            if (user.level == 0) {
                // 没充值，不给使用
                return res.send({
                    code: 405,
                    msg: 'midjournary仅限月度会员或年度会员，请充值后使用，谢谢'
                });
            } else {
                if (expiryDate.isBefore(currentDate)) {
                    // 过期了，需要重新充值
                    res.status(403);
                    return res.send({
                        code: 403,
                        msg: '账户已过期，请联系客服充值'
                    });
                } else {
                    // 没过期，判断是否超过为0
                    if (msgCount <= 0) {
                        res.status(405);
                        return res.send({
                            code: 405,
                            msg: 'midjournary使用次数已用完，请充值后使用，谢谢'
                        });
                    }
                }
            }
        } else {
            // 没值，不可体验midjournary
            if (msgCount <= 0) {
                res.status(405);
                return res.send({
                    code: 405,
                    msg: 'midjournary仅限月度会员或年度会员，请充值后使用，谢谢'
                });
            }
        }
        // 将msgCount--
        msgCount--;
        await setRedisValue(redisCountKey, msgCount);
    }
    req.query.email = obj.email; // 从token里解析出用户email，放到query上
    req.query.id = obj.id; // 从token里解析出用户id，放到query上
    next()
}

export const turnstileCheck = async (req: Request, res: Response, next: NextFunction) => {
    const TURNSTILE_SITE = process.env.TURNSTILE_SITE
    if (!isNotEmptyString(TURNSTILE_SITE)) {
        next();
        return;
    }

    //TURNSTILE_NO_CHECK
    if (isNotEmptyString(process.env.TURNSTILE_NO_CHECK)) {
        next();
        return;
    }
    try {
        if (checkCookie(req)) {
            next();
            return;
        }
        const Authorization = req.header('X-Vtoken')
        if (!Authorization) throw new Error('无权限访问,请刷新重试 | No access rights by Turnstile')

        const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
        let formData = new FormData();
        formData.append('secret', SECRET_KEY);
        formData.append('response', Authorization);
        //formData.append('remoteip', ip);

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            body: formData,
            method: 'POST',
        });

        const outcome: any = await result.json();
        //console.log('outcome>> ', outcome );
        if (!outcome.success) throw new Error('无权限访问,请刷新重试 | No access rights by Turnstile')
        next();
    } catch (error) {
        res.status(422);
        mlog('Turnstile_Error')
        res.send({ code: 'Turnstile_Error', message: error.message ?? 'Please authenticate.' })
    }
}

const getCookie = (time: string) => {
    return time + '_' + (md5(time + process.env.TURNSTILE_SECRET_KEY).substring(0, 10));
}

export const regCookie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Authorization = req.header('X-Vtoken')
        if (!Authorization) throw new Error('Turnstile token 缺失')

        const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
        let formData = new FormData();
        formData.append('secret', SECRET_KEY);
        formData.append('response', Authorization);
        //formData.append('remoteip', ip);

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            body: formData,
            method: 'POST',
        });

        const outcome: any = await result.json();
        //console.log('outcome>> ', outcome );
        if (!outcome.success) throw new Error('Turnstile 错误,请刷新重试 | No access rights by Turnstile')
        const now = `${(Date.now() / 1000).toFixed(0)}`;

        res.status(200);
        //req.cookies.username;
        //res.cookie('gptmj',  getCookie( now ), { maxAge: 5*3600*1000, httpOnly: true });
        res.send({ ok: 'ok', ctoken: getCookie(now) })
    } catch (error) {
        res.status(422);
        mlog('reg_cookie error ');
        res.send({ code: 'reg_cookie', message: error.message ?? 'Please authenticate.' })
    }
}

const checkCookie = (req: Request): boolean => {
    //console.log( 'cookies : ',  req.header('X-Ctoken')  );
    if (!req.header('X-Ctoken')) return false;
    const gptmj = req.header('X-Ctoken') as string;
    if (gptmj == getCookie(gptmj.split('_')[0])) {
        mlog('cookie ok ');
        return true;
    }
    return false;
}

///export { auth }
