import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import db from "../../../../../db/drizzle"
import { userSubscription } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text(); // ✅ Get raw body
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
    );

    if (!session?.metadata?.userId) {
        return new NextResponse("User ID is require", { status: 400 });
    }
    await db.insert(userSubscription).values({
        userId: session.metadata.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
        )
    });
  }

  if (event.type === "invoice.payment_succeeded")
  {
    const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
    );
    await db.update(userSubscription).set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
        ),
    }).where(eq(userSubscription.stripeSubscriptionId, subscription.id));
  }
  return new NextResponse("Webhook received", { status: 200 });
}
