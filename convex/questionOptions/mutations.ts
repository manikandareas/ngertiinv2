import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { assertLabOwner } from "../utils/ownership";

export const createOption = mutation({
  args: {
    questionId: v.id("questions"),
    optionText: v.string(),
    isCorrect: v.boolean(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    await assertLabOwner(ctx, question.labId as Id<"labs">);

    // find last order
    const last = await ctx.db
      .query("questionOptions")
      .withIndex("by_question_order", (q) => q.eq("questionId", args.questionId))
      .order("desc")
      .first();

    const optionOrder = typeof last?.optionOrder === "number" ? last.optionOrder + 1 : 0;

    return await ctx.db.insert("questionOptions", {
      questionId: args.questionId,
      optionText: args.optionText,
      isCorrect: args.isCorrect,
      optionOrder,
    });
  },
});

export const updateOption = mutation({
  args: {
    id: v.id("questionOptions"),
    optionText: v.optional(v.string()),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const opt = await ctx.db.get(args.id);
    if (!opt) throw new Error("Option not found");

    const question = await ctx.db.get(opt.questionId);
    if (!question) throw new Error("Question not found");

    await assertLabOwner(ctx, question.labId as Id<"labs">);

    const patch: Partial<typeof opt> = {};
    if (typeof args.optionText !== "undefined") patch.optionText = args.optionText;
    if (typeof args.isCorrect !== "undefined") patch.isCorrect = args.isCorrect;

    if (Object.keys(patch).length > 0) await ctx.db.patch(args.id, patch);
    return true as const;
  },
});

export const deleteOption = mutation({
  args: { id: v.id("questionOptions") },
  handler: async (ctx, args) => {
    const opt = await ctx.db.get(args.id);
    if (!opt) throw new Error("Option not found");

    const question = await ctx.db.get(opt.questionId);
    if (!question) throw new Error("Question not found");

    await assertLabOwner(ctx, question.labId as Id<"labs">);

    await ctx.db.delete(args.id);
    return true as const;
  },
});

export const reorderOptions = mutation({
  args: {
    questionId: v.id("questions"),
    orderedOptionIds: v.array(v.id("questionOptions")),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    await assertLabOwner(ctx, question.labId as Id<"labs">);

    // Validate ownership by questionId
    const opts = await Promise.all(args.orderedOptionIds.map((id) => ctx.db.get(id)));
    for (const o of opts) {
      if (!o) throw new Error("Option not found");
      if (o.questionId !== args.questionId) throw new Error("Invalid option for question");
    }

    await Promise.all(
      args.orderedOptionIds.map((id, index) => ctx.db.patch(id, { optionOrder: index }))
    );

    return true as const;
  },
});
