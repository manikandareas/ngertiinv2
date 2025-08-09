import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function assertLabOwner(ctx: MutationCtx | QueryCtx, labId: Id<"labs">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_subject", (u) => u.eq("subject", identity.subject))
    .first();
  if (!user) throw new Error("User not found");

  const lab = await ctx.db.get(labId);
  if (!lab) throw new Error("Lab not found");
  if (lab.creatorId !== user._id) throw new Error("Forbidden");
  return { user, lab };
}
