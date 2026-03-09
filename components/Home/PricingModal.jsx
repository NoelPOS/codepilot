"use client";

import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/context/UserContext";
import Lookup from "@/data/Lookup";
import { CheckCircle, Loader2Icon, Zap } from "lucide-react";
import { toast } from "sonner";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export const PricingModal = ({ open, onOpenChange, currentPlan, stripeCustomerId }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const handleUpgrade = async () => {
    if (!user?.id) {
      toast.error("Please sign in first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        toast.error("Could not start checkout. Please try again.");
      }
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!stripeCustomerId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeCustomerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not open billing portal.");
      }
    } catch {
      toast.error("Could not open billing portal.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen) => {
    if (!isOpen) {
      // Reset the checkout state when modal closes
      setTimeout(() => setClientSecret(""), 300);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {clientSecret ? (
          <div className="pt-4">
             <Elements
              stripe={stripePromise}
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3b82f6', // Tailwind blue-500
                    borderRadius: '8px',
                  }
                }
              }}
            >
              <CheckoutForm />
            </Elements>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Upgrade your plan</DialogTitle>
              <DialogDescription>
                Unlock more prompts and unlimited workspaces to build faster.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {Object.entries(Lookup.PLANS).map(([key, plan]) => {
                const isCurrent = (currentPlan ?? "free") === key;
                const isPro = key === "pro";

                return (
                  <div
                    key={key}
                    className={`relative flex flex-col rounded-xl border p-5 gap-3 ${
                      isPro
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {isPro && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {isPro && <Zap className="w-5 h-5 text-blue-500" />}
                      <h3 className="font-semibold text-lg">{plan.label}</h3>
                    </div>

                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-base font-normal text-gray-500">/mo</span>
                    </div>

                    <ul className="flex flex-col gap-1.5 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-3">
                      {isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : isPro ? (
                        <Button
                          className="w-full"
                          onClick={handleUpgrade}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2Icon className="animate-spin w-4 h-4 mr-2" />
                          ) : null}
                          Upgrade to Pro
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleManageSubscription}
                          disabled={loading || !stripeCustomerId}
                        >
                          Downgrade to Free
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
