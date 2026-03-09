import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      },
    });

    if (error) {
      toast.error(error.message || "An error occurred with your payment.");
    } else {
      // The return_url will handle the redirect on success.
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4 w-full">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-4 h-12 text-lg"
      >
        {loading ? (
          <Loader2Icon className="animate-spin w-5 h-5 mr-2" />
        ) : null}
        Pay and Upgrade to Pro
      </Button>
    </form>
  );
}
