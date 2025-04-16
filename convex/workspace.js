import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateWorkspace = mutation({
  args: {
    user: v.id("users"),
    messages: v.any(),
    files: v.any(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.insert("workspaces", {
      messages: args.messages,
      files: args.files || null, // Use null if files are not provided
      user: args.user,
    });
    return workspace; // Return the newly created workspace
  },
});

export const GetWorkspaceById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, { id }) => {
    const workspace = await ctx.db.get(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    return workspace;
  },
});

export const UpdateWorkspace = mutation({
  args: {
    id: v.id("workspaces"),
    messages: v.any(),
    files: v.any(),
  },
  handler: async (ctx, { id, messages, files }) => {
    const workspace = await ctx.db.patch(id, {
      messages: messages,
      files: files || null, // Use null if files are not provided
    });
    return workspace;
  },
});
