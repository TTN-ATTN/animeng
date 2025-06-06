"use server";

import { NextApiRequest, NextApiResponse } from "next";
import { absoluteUrl } from "@/lib/utils";
import crypto from 'crypto'
import https from 'https'
import { auth } from "@/auth"; // Import NextAuth config

const returnUrl = absoluteUrl("/shop")


/* Need to change createStripeUrl to createMomoUrl */
export const createMomoUrl = async ( req: NextApiRequest, res: NextApiResponse ) => {
    const session= await auth();
    const userId = session?.user.id;

    if (!userId || !session) {
        throw new Error("Unauthorized");
    }
    const accessKey = process.env.MOMO_ACCESS_KEY!
    const secretKey = process.env.MOMO_SECRET_KEY!
    const partnerCode = 'MOMO'
    const orderInfo = 'Pay with MoMo'
    const redirectUrl = process.env.REDIRECT_URL!
    const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'
    const amount = '50000'
    const requestType = 'payWithMethod'
    const extraData = ''
    const autoCapture = true
    const lang = 'vi'

    const timestamp = Date.now()
    const orderId = partnerCode + timestamp
    const requestId = orderId

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

    const body = JSON.stringify({
        partnerCode,
        partnerName: 'Next.js Demo',
        storeId: 'MomoTestStore',
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
        extraData,
        signature,
    })

    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
        },
    }

    const momoResponse = await new Promise<any>((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = ''
            res.on('data', (chunk) => (data += chunk))
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data)
                    resolve(parsed)
                } catch (err) {
                    reject(err)
                }
            })
        })

        req.on('error', (e) => reject(e))
        req.write(body)
        req.end()
    })

    return res.status(200).json({ payUrl: momoResponse.payUrl || null })
};

