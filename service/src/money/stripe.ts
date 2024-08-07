import stripe from 'stripe'
import { Request, Response, NextFunction } from 'express';
import exp from 'constants';
import { logger } from '../utils/logger';
import { getRedisValue, setRedisValue } from '../db/redis';
import { insertUserPoint, insertUserLevelRecord, updateUserLevelRecord, updateUserExpireTime } from '../db/userModel';

// const stripe2 = new stripe('sk_test_51NFoodQPQTn5KJriUS5tQZ8sgmdcbXIRsomLbS1R4J3eaBU8N9Ey5Gc0WDCRSNBREkgvf6mrPsgD88pi5sdZX2a400sJNxl9AM'); // test
const stripe2 = new stripe(process.env.StripeKey)

// Use the secret provided by Stripe CLI for local testing
// or your webhook endpoint's secret.
// const endpointSecretTest = 'whsec_14b5750b5b751a5fa0eb0eaaeae2107bf6978b2baf07dc0dacf4ba4b08c2edfb';

const createCheckoutSession = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    logger.info({
        msg: 'stripe',
        label: '调用stripe开始',
    });
    const priceObj = await createPrice({
        level: req.body.level,
        currency: req.body.currency
    })
    const session = await stripe2.checkout.sessions.create({
        line_items: [
            {
                price: priceObj.price.id,
                quantity: 1,
            }
        ],
        mode: 'payment',
        payment_method_types: req.body.currency == 'usd' ? ['card', 'link'] : ['wechat_pay', 'alipay'],
        payment_method_options: {
            wechat_pay: {
                client: 'web'
            }
        },
        success_url: 'https://all-ai.chat',
        cancel_url: 'https://all-ai.chat',
        automatic_tax: {
            enabled: true
        },
        metadata: {
            userId: obj.id,
            level: priceObj.level
        }
    });
    logger.info({
        msg: session,
        label: '调用stripe结果',
    });
    res.send({
        code: 200,
        msg: 'success',
        data: session
    });
}

const createPrice = async (obj) => {
    const product = await stripe2.products.create({
        name: levelName(obj.level),
    });
    const price = await stripe2.prices.create({
        product: product.id,
        unit_amount: levelPrice(obj),
        currency: obj.currency == 'usd' ? 'usd' : 'cny',
    });
    return {
        price,
        level: obj.level
    };
}

const fulfillCheckout = async (sessionId, userId, level) => {
    const checkoutSession = await stripe2.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
    });
    // 'no_payment_required' | 'paid' | 'unpaid';
    if (checkoutSession.payment_status == 'paid') {
        /**
         * 支付成功后需要做的事情
         * 
         */
        if (level == 2) {
            // 月度会员
            setRedisValue(`expireTimeLevel2-` + userId, 50); // 支付成功，每天50条消息的
            let midCount = Number(await getRedisValue(`midLevel2-` + userId));
            if (midCount > 0) {
                midCount += 20;
            } else {
                midCount = 20;
            }
            setRedisValue(`midLevel2-` + userId, midCount); // 支付成功，赠送一次性20次绘画次数
            updateUserExpireTime(userId, level);
        } else if (level == 3) {
            // 年度会员
            setRedisValue(`expireTimeLevel3-` + userId, 100); // 支付成功，每天100条消息的
            let midCount = Number(await getRedisValue(`midLevel3-` + userId));
            if (midCount > 0) {
                midCount += 300;
            } else {
                midCount = 300;
            }
            setRedisValue(`midLevel3-` + userId, 300); // 支付成功，赠送一次性300次绘画次数
            updateUserExpireTime(userId, level);
        }
        updateUserLevelRecord(userId, level); // 插入lelve等级

        // TODO: Perform fulfillment of the line items
        // TODO: Record/save fulfillment status for this
        // Checkout Session
    } else {

    }
}

const webhookStripe = async (req: any, res: any) => {
    logger.info({
        msg: req,
        label: '接收到stripe的回调',
    });
    const payload = req.body;
    logger.info({
        msg: payload,
        label: 'req.body的payload是：'
    })
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        // event = stripe2.webhooks.constructEvent(payload, sig, endpointSecretTest); // test
        event = stripe2.webhooks.constructEvent(payload, sig, process.env.StripeWebhookKey);
    } catch (err) {
        logger.info({
            msg: err.message,
            label: 'constructEvent解析出错啦'
        })
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    logger.info({
        msg: event,
        label: 'stripe event事件'
    });
    const session = event.data.object;
    switch (event.type) {
        case 'checkout.session.completed':
            fulfillCheckout(session.id, session.metadata.userId, session.metadata.level);
            break;
        case 'payment_intent.succeeded':
            // Then define and call a method to handle the successful payment intent.
            break;
        case 'payment_intent.failed':
            // Then define and call a method to handle the failed payment intent.
            break;
    }

    res.status(200).end();
}

const levelName = (level) => {
    if (level == 1) return '免费用户';
    if (level == 2) return '按月付费';
    if (level == 3) return '按年付费';
}

/**
 * 月度会员，赠送20张midjournary
 * 年度会员，赠送300张midjournary
 * 其他情况，另行购买，RMB 0.5/次，
 * */
const levelPrice = (obj) => {
    if (obj.currency == 'usd') {
        switch (obj.level) {
            case 1: return 0;
            case 2: return 990;
            case 3: return 9900;
        }
    } else {
        switch (obj.level) {
            case 1: return 0;
            case 2: return 6900;
            case 3: return 69900;
        }
    }
    return 0;
}

export {
    createCheckoutSession,
    webhookStripe
}