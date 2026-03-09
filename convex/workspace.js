import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Throws if the workspace does not belong to the given user. */
async function assertOwnership(ctx, workspaceId, userId) {
  if (!userId) return; // skip check when userId is not provided (backward-compat)
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  if (workspace.user !== userId) {
    throw new Error("Unauthorized: workspace does not belong to this user");
  }
  return workspace;
}

// ─── Mutations & Queries ──────────────────────────────────────────────────────

export const CreateWorkspace = mutation({
  args: {
    user: v.id("users"),
    messages: v.any(),
    files: v.optional(v.any()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workspaces", {
      messages: args.messages,
      files: args.files ?? null,
      user: args.user,
      title: args.title,
    });
  },
});

export const GetWorkspaceById = query({
  args: {
    id: v.id("workspaces"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { id, userId }) => {
    const workspace = await ctx.db.get(id);
    if (!workspace) throw new Error("Workspace not found");
    // Owner check — when the caller provides their userId, verify ownership.
    if (userId && workspace.user !== userId) {
      throw new Error("Unauthorized: workspace does not belong to this user");
    }
    return workspace;
  },
});

// Returns all workspaces for a user, newest first.
export const GetWorkspacesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .order("desc")
      .collect();
  },
});

// Selectively patches only the fields that are provided.
// Accepts an optional userId for owner verification.
export const UpdateWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
    userId: v.optional(v.id("users")),
    messages: v.optional(v.any()),
    files: v.optional(v.any()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { id, userId, messages, files, title }) => {
    // Verify ownership when userId is provided
    await assertOwnership(ctx, id, userId);

    const patch = {};
    if (messages !== undefined) patch.messages = messages;
    if (files !== undefined) patch.files = files;
    if (title !== undefined) patch.title = title;
    return await ctx.db.patch(id, patch);
  },
});

// Deletes a workspace, ensuring the user owns it first.
export const DeleteWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { id, userId }) => {
    await assertOwnership(ctx, id, userId);
    await ctx.db.delete(id);
  },
});
