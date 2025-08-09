import { query } from "../_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (u) => u.eq("subject", identity.subject))
      .first();

    return user ?? null;
  },
});
