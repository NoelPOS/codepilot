import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req) => {
  const stripe = getStripe();
  const { userId, email } = await req.json();

  if (!userId || !email) {
    return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
  }

  // Find or create the Stripe customer so the user doesn't have to re-enter
  // their card details if they upgrade again after cancelling.
  const customers = await stripe.customers.list({ email, limit: 1 });
  let customerId = customers.data[0]?.id;

  if (!customerId) {
    const customer = await stripe.customers.create({ email });
    customerId = customer.id;
  }

  // We use a SetupIntent because Stripe in some regions/accounts (like TH) 
  // might not generate a PaymentIntent on default_incomplete subscriptions.
  // The webhook will listen to `setup_intent.succeeded` to create the subscription.
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session", // We will use this card later for recurring subscription charges
    metadata: { userId },
  });

  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
  });
}, "Stripe setup intent create");
