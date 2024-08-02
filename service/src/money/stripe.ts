import stripe from 'stripe'
import { Request, Response, NextFunction } from 'express';
import exp from 'constants';
import { logger } from '../utils/logger';

const stripe2 = new stripe(process.env.StripeKey)

// Use the secret provided by Stripe CLI for local testing
// or your webhook endpoint's secret.
const endpointSecret = 'whsec_...';

const createCheckoutSession = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    logger.info({
        msg: 'stripe',
        label: '调用stripe开始',
    });
    const price = await createPrice({
        level: req.body.level,
        currency: req.body.currency
    })
    const session = await stripe2.checkout.sessions.create({
        line_items: [
            {
                price: price.id,
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
    return price;
}

const fulfillCheckout = async (sessionId) => {
    const checkoutSession = await stripe2.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
    });
    // 'no_payment_required' | 'paid' | 'unpaid';
    if (checkoutSession.payment_status == 'paid') {
        // TODO: Perform fulfillment of the line items

        // TODO: Record/save fulfillment status for this
        // Checkout Session
    } else {

    }
}

const webhookStripe = async (obj: any, req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe2.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (
        event.type === 'checkout.session.completed'
        || event.type === 'checkout.session.async_payment_succeeded'
    ) {
        fulfillCheckout(event.data.object.id);
    }

    res.status(200).end();
}

const levelName = (level) => {
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