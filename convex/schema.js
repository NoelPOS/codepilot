import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
    // Subscription
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    // Usage tracking (resets each billing cycle)
    promptsUsed: v.optional(v.number()),
    billingCycleStart: v.optional(v.number()),
    // Stripe
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  }).index("by_email", ["email"]),

  workspaces: defineTable({
    messages: v.any(),
    files: v.optional(v.any()),
    user: v.id("users"),
    title: v.optional(v.string()),
  }).index("by_user", ["user"]),
});
