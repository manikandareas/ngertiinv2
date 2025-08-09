import { v } from "convex/values";
import { query } from "../_generated/server";

export const getByLab = query({
  args: {
    labId: v.id("labs"),
  },
  handler: async (ctx, args) => {
    const latest = await ctx.db
      .query("generationTasks")
      .withIndex("by_lab", (q) => q.eq("labId", args.labId))
      .order("desc")
      .first();

    if (!latest) return null;
    return {
      status: latest.status,
      message: latest.message,
      step: latest.step,
    } as const;
  },
});
