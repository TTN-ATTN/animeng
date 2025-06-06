"use server"
import { NextRequest } from 'next/server'
import crypto from 'crypto'
import https from 'https'
// import { auth } from '@clerk/nextjs/server' // Removed Clerk auth
import { auth } from "@/auth"; // Import NextAuth config

export async function POST(req: NextRequest) {
  const accessKey = "F8BBA842ECF85" // Consider moving to .env
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz" // Consider moving to .env
  const partnerCode = 'MOMO'
  const orderInfo = 'Pay with MoMo'
  // Use NEXT_PUBLIC_APP_URL from .env for redirect/ipn URLs
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; 
  const redirectUrl = `${appUrl}/shop`
  const ipnUrl = `${appUrl}/api/callback` // Ensure this callback route exists and handles Momo IPN
  const amount = '50000'
  const requestType = 'payWithMethod'
  
  const autoCapture = true
  const lang = 'vi'

  const timestamp = Date.now()
  const orderId = partnerCode + timestamp
  const requestId = orderId
  
  // Get user session from NextAuth
  const session = await auth();
  const userId = session?.user?.id; // Get user ID from NextAuth session
  
  if (!userId) {
    // Handle case where user is not authenticated
    return Response.json({ error: "User not authenticated" }, { status: 401 });
  }

  const extraData = userId ? `${encodeURIComponent(userId)}` : ''

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

  console.log('User ID (NextAuth):', userId)

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

  try {
    const momoResponse = await new Promise<any>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            console.log("Momo Response:", parsed);
            resolve(parsed)
          } catch (err) {
            console.error("Error parsing Momo response:", err);
            reject(new Error("Failed to parse Momo response"))
          }
        })
      })

      req.on('error', (e) => {
        console.error("Error requesting Momo payment:", e);
        reject(e)
      })
      req.write(body)
      req.end()
    })

    if (momoResponse.resultCode !== 0) {
        console.error("Momo payment creation failed:", momoResponse);
        return Response.json({ error: `Momo payment failed: ${momoResponse.message}` }, { status: 400 });
    }

    return Response.json({ payUrl: momoResponse.payUrl || null })

  } catch (error) {
    console.error("Error processing Momo payment request:", error);
    return Response.json({ error: "Internal server error processing payment" }, { status: 500 });
  }
}

