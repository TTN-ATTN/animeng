// app/api/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import db from '../../../../db/drizzle'
import { userSubscription } from '../../../../db/schema'

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('MoMo IPN Callback:', body)

  const {
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    transId,
    signature,
  } = body

  const accessKey = process.env.MOMO_ACCESS_KEY
  const secretKey = process.env.MOMO_SECRET_KEY

  if (!accessKey || !secretKey) {
    console.error('Missing MOMO_ACCESS_KEY or MOMO_SECRET_KEY in env')
    return NextResponse.json({ message: 'Server misconfiguration' }, { status: 500 })
  }

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex')

  if (signature !== expectedSignature) {
    console.error('Signature verification failed')
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  if (resultCode === 0) {
    console.log('✅ Payment successful:', orderId)

    // 🟢 Extract userId from extraData or another unique way (you must pass it during payment creation)
    const userId = extraData // Example: use extraData to pass userId

    if (!userId) {
      console.error('Missing userId in extraData')
      return NextResponse.json({ message: 'Missing user info' }, { status: 400 })
    }

    await db.insert(userSubscription).values({
      userId: userId,
      momoCustomerId: orderId,
      momoSubscriptionId: transId,
      momoPriceId: 'momo_price_id', // Replace with dynamic value if needed
      momoCurrentPeriodEnd: new Date(Number(responseTime)),
    })
  } else {
    console.warn('⚠️ Payment failed or canceled:', resultCode)
  }

  return NextResponse.json({ message: 'IPN received' })
}
