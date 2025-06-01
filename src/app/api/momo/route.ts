"use server"
import { NextRequest } from 'next/server'
import crypto from 'crypto'
import https from 'https'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const accessKey = "F8BBA842ECF85"
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
  const partnerCode = 'MOMO'
  const orderInfo = 'Pay with MoMo'
  const redirectUrl = 'https://3dbb-14-169-236-27.ngrok-free.app/shop'
  const ipnUrl = 'https://3dbb-14-169-236-27.ngrok-free.app/api/callback'
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

  const {userId} = await auth();

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
    extraData: userId,
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

  return Response.json({ payUrl: momoResponse.payUrl || null })
}
