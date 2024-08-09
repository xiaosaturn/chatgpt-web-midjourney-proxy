import {
    getUserById, getUserByEmail, insertUser, updateUser, insertUserPoint,
    insertUserLevelRecord, insertImage,
    selectImagesByUserId
} from '../db/userModel';
import { Request, Response, NextFunction } from 'express';
import { getRedisValue, setRedisValue } from '../db/redis';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const transporter = nodemailer.createTransport({
    service: 'QQ',
    auth: {
        user: process.env.QQ_EMAIL,
        pass: process.env.QQ_AUTH
    }
});

const updateUserInfo = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    if (!req.query.id) {
        return res.send({
            msg: 'no userid',
            code: 10000,
        });
    }
    const result = await updateUser(req.body);
    if (result == 1) {
        res.send({
            msg: 'success',
            code: 200,
        });
    } else {
        res.send({
            msg: 'Internal Server Error',
            code: 500,
        });
    }
}

const getUserByIdService = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    if (!req.query.id) {
        return res.send({
            msg: 'no userid',
            code: 10000,
        });
    }
    const user = await getUserById(req.query.id)
    res.send({
        msg: 'success',
        code: 200,
        data: user
    })
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    const userInfo = req.body;
    if (!userInfo.email) {
        return res.send({
            msg: 'no email',
            code: 10001
        });
    }
    if (!userInfo.password) {
        return res.send({
            msg: 'no password',
            code: 10002
        });
    }
    const userSearch = await getUserByEmail(userInfo.email);
    if (!userSearch) {
        return res.send({
            code: 10007,
            msg: '用户不存在'
        });
    }
    const flag = bcrypt.compareSync(userInfo.password, userSearch.password);
    if (!flag) {
        return res.send({
            code: 10006,
            msg: '登录失败，密码错误'
        });
    } else {
        const token = jwt.sign({
            id: userSearch.id,
            email: req.body.email
        }, process.env.SECRET_KEY, {
            algorithm: 'HS256',
            expiresIn: 60 * 60 * 24
        });
        setRedisValue(req.body.email, 'Bearer ' + token);
        res.send({
            code: 200,
            msg: '登录成功！',
            data: {
                token: 'Bearer ' + token,
                user: userSearch
            }
        });
    }
}

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const userInfo = req.body;
    if (!userInfo.email) {
        return res.send({
            msg: 'no email',
            code: 10001
        })
    }
    if (!userInfo.password) {
        return res.send({
            msg: 'no password',
            code: 10002
        })
    }
    if (!userInfo.captcha) {
        return res.send({
            msg: 'no captcha',
            code: 10003
        })
    }
    const captcha = userInfo.captcha;
    const redisCaptcha = await getRedisValue(userInfo.email);
    if (captcha == redisCaptcha) {
        const searchResult = await getUserByEmail(userInfo.email);
        if (!searchResult) {
            userInfo.avatar = imgUrl();
            userInfo.password = bcrypt.hashSync(userInfo.password, 10);
            userInfo.registerIp = req.headers['x-forwarded-for'] || '127.0.0.1';
            const insertResultId = await insertUser(userInfo);
            if (insertResultId) {
                // 成功了
                const token = jwt.sign({
                    email: userInfo.email
                }, process.env.SECRET_KEY, {
                    algorithm: 'HS256',
                    expiresIn: 60 * 60 * 24
                });
                setRedisValue(userInfo.email, 'Bearer ' + token); // 存储token，key是邮箱
                initUserLevel(insertResultId); // 初始化用户的使用额度，一次性赠送5条尝鲜
                return res.send({
                    code: 200,
                    msg: '注册成功，将为你自动登录',
                    data: {
                        token: 'Bearer ' + token,
                        user: userInfo
                    }
                });
            } else {
                return res.send({
                    code: 10005,
                    msg: '注册失败，请稍后重试'
                });
            }
        } else if (searchResult.length > 0) {
            return res.send({
                code: 10004,
                msg: '邮箱已存在'
            });
        }
    } else {
        return res.send({
            msg: 'captcha expired or not correct，please resend captcha!',
            code: '10004'
        })
    }
}

// const insertImage = async (obj: any, req: Request, res: Response, next: NextFunction) => { 
//     const result = await insertImages({
//         id: obj.id,
//         imageUrl: req.body.r
//         prompt: req.body.prompt,
//         action: req.body.action
//     });
//     return res.send({
//         code: 200,
//         msg: 'success',
//     });
// }

const queryAllImages = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    const result = await selectImagesByUserId(obj.id);
    return res.send({
        code: 200,
        msg: 'success',
        data: {
            list: result
        }
    });
}

const verificationCode = async (req, res) => {
    const email = req.query.email;
    const info = await sendMail(email);
    if (info && info.response && info.response.includes('250 OK')) {
        return res.send({
            code: 200,
            msg: '验证码已发送'
        });
    } else {
        return res.send({
            status: 500,
            msg: '验证码发送失败，请稍后重试'
        });
    }
}

const sendMail = async (email) => {
    const code = generateRandomSixDigitNumber();
    const mailOptions = {
        from: '【All AI】<807132689@qq.com>',
        to: email,
        subject: 'Your Captcha',
        html: `<b style="font-size:28px">Your Captcha：<span style="color:red">${code}</span> ，Please Input In 10 minutes</b> <br /><br /><br /> \
        <b style="font-size:28px;color:green">All AI: https://all-ai.chat </b> <br /><br /><br />`
    };
    // const mailOptions = {
    //     from: '【All AI】<807132689@qq.com>',
    //     to: email,
    //     subject: 'Captcha',
    //     html: `<b style="font-size:28px">Your Captcha：<span style="color:red">${code}</span> ，Please Input In 10 minutes</b> <br /><br /><br /> \
    //     <b style="font-size:28px;color:green">All AI: https://all-ai.chat </b> <br /><br /><br />
    //     <b style="font-size:28px;color:green">关注公众号【MasterH杂货铺】，获取最新AI新闻与工具</b> \
    //     <img src="https://image.xiaosaturn.com/2023/hsftyt.jpg"></img>`
    // };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                setRedisValue(email, code, 600);
                resolve(info);
            }
        });
    })
}

// 生成随机六位数
const generateRandomSixDigitNumber = () => {
    var min = 100000; // 最小值（六位数的最小值是100000）
    var max = 999999; // 最大值（六位数的最大值是999999）
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const imgUrl = function () {
    const randomNum = Math.floor(Math.random() * 50) + 1;
    return `https://image.xiaosaturn.com/avatar/avatar-${randomNum}.png`;
}

const initUserLevel = async (userId) => {
    const res = await insertUserPoint(userId); // 只是记录下，不作他用
    const res2 = await setRedisValue('expireTimeLevel1-' + userId, 10); // 初始注册，每天赠送10条消息，0点后重置
    const res3 = await insertUserLevelRecord(userId); // 插入lelve等级
    const res4 = await setRedisValue('midLevel1-' + userId, 10); // 初始注册，一次性赠送10次绘画
    // midjournary levle2 20次，level3 300次，midLevel1-userId，手动添加到redis里
}

export {
    getUserByIdService,
    login,
    registerUser,
    verificationCode,
    sendMail,
    updateUserInfo,
    queryAllImages
}