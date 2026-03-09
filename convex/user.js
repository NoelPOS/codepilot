import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Creates a new user or returns the existing one's ID.
// Always returns the Convex _id (string), never the full object.
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      picture: args.picture,
      uid: args.uid,
    });
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Increments prompts used for the current billing cycle.
// Automatically resets the count when a new 30-day cycle begins.
// Returns the new count.
export const incrementUsage = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const cycleStart = user.billingCycleStart ?? now;
    const isNewCycle = now - cycleStart > THIRTY_DAYS_MS;
    const newCount = isNewCycle ? 1 : (user.promptsUsed ?? 0) + 1;

    await ctx.db.patch(userId, {
      promptsUsed: newCount,
      billingCycleStart: isNewCycle ? now : cycleStart,
    });

    return newCount;
  },
});

// Called by the Stripe webhook to upgrade or downgrade a user.
export const updateUserPlanById = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, plan, stripeCustomerId, stripeSubscriptionId }) => {
    const patch = { plan };
    if (stripeCustomerId) patch.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) patch.stripeSubscriptionId = stripeSubscriptionId;
    await ctx.db.patch(userId, patch);
  },
});
