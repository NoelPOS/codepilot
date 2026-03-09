import getStripe from "@/lib/stripe";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req) => {
  const stripe = getStripe();
  const { stripeCustomerId } = await req.json();

  if (!stripeCustomerId) {
    return NextResponse.json({ error: "Missing stripeCustomerId" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}, "Stripe portal");
