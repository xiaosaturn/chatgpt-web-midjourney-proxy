import { AlipaySdk } from 'alipay-sdk';
import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

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
        total_amount: "0.01",
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
                price: "0.01",
            }
        ]
    }
    if (req.body.level == 3) {
        bizContent.subject = 'All-AI Chat年度会员';
        bizContent.total_amount = '699.00';
        bizContent.goods_detail[0].goods_name = 'All-AI Chat年度会员'
        bizContent.goods_detail[0].price = '699.00';
    }
    logger.info({
        msg: bizContent,
        label: 'alipay.trade.page.pay入参：'
    });
    const formRes = await alipaySdk.pageExec("alipay.trade.page.pay", {
        notify_url: 'http://mpce.tpddns.cn:41000/app/money/alipayCallback',
        bizContent
    });
    res.send(formRes);
}

const alih5PayOrder = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    const orderNo = 'YSH' + moment().format('YYYYMMDDHHmmss');
    const goodsId = 'G-' + moment().format('YYYYMMDDHHmmss');
    const bizContent = {
        out_trade_no: orderNo,
        total_amount: "0.01",
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
                price: "0.01",
            }
        ]
    }
    if (req.body.level == 3) {
        bizContent.subject = 'All-AI Chat年度会员';
        bizContent.total_amount = '699.00';
        bizContent.goods_detail[0].goods_name = 'All-AI Chat年度会员'
        bizContent.goods_detail[0].price = '699.00';
    }
    logger.info({
        msg: bizContent,
        label: 'alipay.trade.wap.pay入参：'
    });
    const formRes = await alipaySdk.pageExec("alipay.trade.wap.pay", {
        notify_url: 'http://mpce.tpddns.cn:41000/app/money/alipayCallback',
        bizContent
    });
    res.send(formRes);
}

const alipayCallback = async (req: Request, res: Response, next: NextFunction) => {
    console.log('req.header:', req.headers)
    const params = req.body;
    try {
        // 验证通知的真实性
        const jsonStr = params.toString('utf8');
        const decodedStr = decodeURIComponent(jsonStr);
        const decodedArr = decodedStr.split('&');
        const decodedObj = {};
        if (decodedArr) {
            decodedArr.map(item => {
                const arr = item.split('=')
                decodedObj[arr[0]] = arr[1];
            });
            logger.info({
                msg: decodedObj,
                label: '从buffer解析出的数据转成obj：'
            });
            const allDecodedObj = Object.assign({}, decodedObj);
            delete decodedObj['sign'];
            delete decodedObj['sign_type'];
            logger.info({
                msg: decodedObj,
                label: '删除了sign/sign_type的obj：'
            });
            const sortStr = objToSortedString(decodedObj);
            logger.info({
                msg: sortStr,
                label: '排序之后的sortStr：'
            });
            const signVerified = alipaySdk.checkNotifySignV2(allDecodedObj);
            const signVerified2 = alipaySdk.checkNotifySignV2(decodedObj);
            const signVerified3 = alipaySdk.checkNotifySignV2(jsonStr);
            logger.info({
                msg: signVerified,
                label: 'signVerified验签'
            });
            logger.info({
                msg: signVerified2,
                label: 'signVerified验签2'
            });
            logger.info({
                msg: signVerified3,
                label: 'signVerified验签3'
            });
            if (signVerified) {
                // 通知验证成功
                const tradeStatus = params.trade_status;

                if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
                    // 支付成功，进行相应的业务处理
                    const outTradeNo = params.out_trade_no; // 商户订单号
                    const tradeNo = params.trade_no; // 支付宝交易号
                    const totalAmount = params.total_amount; // 交易金额

                    // TODO: 在这里添加您的业务逻辑
                    console.log(`Payment successful for order ${outTradeNo}`);

                    // 返回成功结果给支付宝
                    res.send('success');
                } else {
                    // 其他交易状态
                    console.log(`Received payment status: ${tradeStatus}`);
                    res.send('success');
                }
            } else {
                logger.info({
                    msg: jsonStr,
                    label: '通知验证失败'
                });
            }
        }
    } catch (error) {
        console.error('Error processing Alipay notification:', error);
        res.status(500).send('fail');
    }
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