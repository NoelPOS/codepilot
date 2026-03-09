import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { withErrorHandler } from "@/lib/apiHandler";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Next.js App Router: disable body parsing so we can verify the raw signature.
export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (req) => {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object;
      if (!invoice.subscription) break;

      const subscriptionId = typeof invoice.subscription === 'string' 
        ? invoice.subscription 
        : invoice.subscription.id;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      
      if (!userId) {
        console.error("No userId found in subscription metadata");
        break;
      }

      await convex.mutation(api.user.updateUserPlanById, {
        userId,
        plan: "pro",
        stripeCustomerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id,
        stripeSubscriptionId: subscriptionId,
      });
      break;
    }

    case "setup_intent.succeeded": {
      const setupIntent = event.data.object;
      console.log("SETUP INTENT RECEIVED:", JSON.stringify(setupIntent, null, 2));

      const userId = setupIntent.metadata?.userId;
      const customerId = setupIntent.customer;
      const paymentMethodId = setupIntent.payment_method;

      if (!userId || !customerId || !paymentMethodId) {
        console.error("Missing required metadata on setup_intent");
        break;
      }

      // 1. Attach the payment method to the customer first
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // 2. Set the saved card as the customer's default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // 2. Create the subscription (this will immediately charge the card)
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: process.env.STRIPE_PRO_PRICE_ID }],
        metadata: { userId },
      });

      // 3. Update the user's plan in Convex
      await convex.mutation(api.user.updateUserPlanById, {
        userId,
        plan: "pro",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
      });

      console.log(`Successfully upgraded user ${userId} via SetupIntent.`);
      break;
    }

    case "customer.subscription.deleted": {
      // User cancelled — downgrade back to free.
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      await convex.mutation(api.user.updateUserPlanById, {
        userId,
        plan: "free",
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}, "Stripe webhook");
