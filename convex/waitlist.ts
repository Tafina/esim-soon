import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      // Already on the list, just return success
      return { success: true, alreadyExists: true };
    }

    // Add to waitlist
    await ctx.db.insert("waitlist", {
      email,
      createdAt: Date.now(),
    });

    return { success: true, alreadyExists: false };
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("waitlist").collect();
    return all.length;
  },
});
