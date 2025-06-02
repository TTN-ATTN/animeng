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
  const redirectUrl = `${process.env.PUBLIC_URL}/shop`
  const ipnUrl = `${process.env.PUBLIC_URL}/api/callback`
  const amount = '50000'
  const requestType = 'payWithMethod'
  
  const autoCapture = true
  const lang = 'vi'

  const timestamp = Date.now()
  const orderId = partnerCode + timestamp
  const requestId = orderId
  
  const {userId} = await auth();
  const extraData =  userId ? `${encodeURIComponent(userId)}` : ''

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

  console.log('User ID:', userId)

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

  return Response.json({ payUrl: momoResponse.payUrl || null })
}
