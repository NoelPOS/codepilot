import Stripe from "stripe";

/**
 * Shared Stripe client singleton (lazy initialization).
 *
 * All API routes import `getStripe()` instead of creating their own `new Stripe(...)`.
 * This follows the Singleton pattern and keeps the secret key reference in one place.
 *
 * Lazy initialization avoids build-time errors when STRIPE_SECRET_KEY
 * isn't available in the build environment.
 */
let _stripe;

export default function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}
