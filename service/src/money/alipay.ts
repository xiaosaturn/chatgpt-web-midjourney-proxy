import { AlipaySdk } from 'alipay-sdk';
import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import { handlePaySuccess } from './wxpay';

const monthlyPrice = '69.00';
const yearlyPrice = '699.00';
const callbackUrl = 'https://all-ai.chat/api/app/money/alipayCallback';
// const callbackUrl = 'http://mpce.tpddns.cn:41000/app/money/alipayCallback'; // 测试回调

// 实例化客户端
const alipaySdk = new AlipaySdk({
    // 设置应用 ID
    appId: process.env.Alipay_APPID,
    // appId: '2021004165665513',
    // 设置应用私钥
    privateKey: process.env.Alipay_PrivateKey,
    // 设置支付宝公钥
    alipayPublicKey: process.env.Alipay_PublicKey,
    // 密钥类型，请与生成的密钥格式保持一致，参考平台配置一节
    keyType: 'PKCS1',
    // 设置网关地址，默认是 https://openapi.alipay.com
    // endpoint: 'https://openapi.alipay.com',
});

const aliwebPayOrder = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    // const result = await alipaySdk.curl('POST', '/v3/alipay/user/deloauth/detail/query', {
    //     body: {
    //         date: '20230102',
    //         offset: 20,
    //         limit: 1,
    //     },
    // });

    // console.log('JSONStrring', JSON.stringify(result))
    // logger.info({
    //     msg: result,
    //     label: '支付宝测试情况：'
    // })
    const orderNo = 'YSH' + moment().format('YYYYMMDDHHmmss');
    const goodsId = 'G-' + moment().format('YYYYMMDDHHmmss');
    const bizContent = {
        out_trade_no: orderNo,
        total_amount: monthlyPrice,
        subject: 'All-AI Chat月度会员',
        product_code: 'FAST_INSTANT_TRADE_PAY',
        qr_pay_mode: "1",
        qrcode_width: "100",
        integration_type: "PCWEB",
        goods_detail: [
            {
                goods_id: goodsId,
                goods_name: 'All-AI Chat月度会员',
                quantity: 1,
                price: monthlyPrice,
            }
        ],
        passbackParams: encodeURIComponent(`id=${obj.id}&level=${req.body.level}`)
    }
    if (req.body.level == 3) {
        bizContent.subject = 'All-AI Chat年度会员';
        bizContent.total_amount = yearlyPrice;
        bizContent.goods_detail[0].goods_name = 'All-AI Chat年度会员'
        bizContent.goods_detail[0].price = yearlyPrice;
    }
    logger.info({
        msg: bizContent,
        label: 'alipay.trade.page.pay入参：'
    });
    const formRes = await alipaySdk.pageExec("alipay.trade.page.pay", {
        notify_url: callbackUrl,
        bizContent
    });
    res.send(formRes);
}

const alih5PayOrder = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    const orderNo = 'YSH' + moment().format('YYYYMMDDHHmmss');
    const goodsId = 'G-' + moment().format('YYYYMMDDHHmmss');
    const bizContent = {
        out_trade_no: orderNo,
        total_amount: monthlyPrice,
        subject: 'All-AI Chat月度会员',
        product_code: 'FAST_INSTANT_TRADE_PAY',
        qr_pay_mode: "1",
        qrcode_width: "100",
        integration_type: "PCWEB",
        goods_detail: [
            {
                goods_id: goodsId,
                goods_name: 'All-AI Chat月度会员',
                quantity: 1,
                price: monthlyPrice,
            }
        ],
        passbackParams: encodeURIComponent(`id=${obj.id}&level=${req.body.level}`)
    }
    if (req.body.level == 3) {
        bizContent.subject = 'All-AI Chat年度会员';
        bizContent.total_amount = yearlyPrice;
        bizContent.goods_detail[0].goods_name = 'All-AI Chat年度会员'
        bizContent.goods_detail[0].price = yearlyPrice;
    }
    logger.info({
        msg: bizContent,
        label: 'alipay.trade.wap.pay入参：'
    });
    const formRes = await alipaySdk.pageExec("alipay.trade.wap.pay", {
        notify_url: callbackUrl,
        bizContent
    });
    res.send(formRes);
}

const alipayCallback = async (req: Request, res: Response, next: NextFunction) => {
    const params = req.body;
    const signVerified = alipaySdk.checkNotifySignV2(params);
    logger.info({
        msg: signVerified,
        label: 'signVerified验签'
    });
    logger.info({
        msg: params,
        label: 'signVerified验签的params'
    });
    try {
        if (signVerified) {
            // 通知验证成功
            const tradeStatus = params.trade_status;
            const passbackParams = str2obj(params.passback_params);

            if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
                // 支付成功，进行相应的业务处理
                handlePaySuccess(passbackParams['id'], passbackParams['level']);
                // 返回成功结果给支付宝
                res.send('success');
            } else {
                // 其他交易状态
                console.log(`Received payment status: ${tradeStatus}`);
                res.send('success');
            }
        } else {
            logger.info({
                msg: params,
                label: '通知验签失败'
            });
            res.status(500).send('fail');
        }
    } catch (error) {
        console.error('Error processing Alipay notification:', error);
        res.status(500).send('fail');
    }
}

const str2obj = (str) => {
    // 1. 解码字符串
    let decodedString = decodeURIComponent(str);

    // 2. 将字符串分割成键值对
    let pairs = decodedString.split('&');

    // 3. 创建一个对象来存储结果
    let result = {};

    // 4. 遍历键值对并添加到结果对象中
    pairs.forEach(pair => {
        let [key, value] = pair.split('=');
        result[key] = value;
    });

    return result;
}

const objToSortedString = (obj) => {
    // 获取对象的所有键并排序
    const sortedKeys = Object.keys(obj).sort();

    // 构建结果字符串
    const result = sortedKeys.map(key => {
        const value = handleValue(obj[key]);
        return `${key}=${value}`;
    }).join('&');

    return `{${result}}`;
}

const handleValue = (value) => {
    if (typeof value === 'string') {
        return `"${value}"`;
    } else if (Array.isArray(value)) {
        return `[${value.map(handleValue).join(',')}]`;
    } else if (typeof value === 'object' && value !== null) {
        return objToSortedString(value);
    } else {
        return String(value);
    }
}

export {
    aliwebPayOrder,
    alih5PayOrder,
    alipayCallback
}