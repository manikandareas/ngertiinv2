import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { assertLabOwner } from "../utils/ownership";

export const reorderQuestions = mutation({
  args: {
    labId: v.id("labs"),
    orderedIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    await assertLabOwner(ctx, args.labId);

    // Validate all questions belong to the lab
    const questions = await Promise.all(
      args.orderedIds.map((id) => ctx.db.get(id))
    );
    for (const q of questions) {
      if (!q) throw new Error("Question not found");
      if (q.labId !== args.labId) throw new Error("Invalid question for lab");
    }

    // Apply new order
    await Promise.all(
      args.orderedIds.map((id, index) => ctx.db.patch(id, { questionOrder: index }))
    );

    return true as const;
  },
});

export const updateQuestion = mutation({
  args: {
    id: v.id("questions"),
    questionText: v.optional(v.string()),
    explanation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id);
    if (!question) throw new Error("Question not found");

    await assertLabOwner(ctx, question.labId as Id<"labs">);

    const patch: Partial<typeof question> = {};
    if (typeof args.questionText !== "undefined") patch.questionText = args.questionText;
    if (typeof args.explanation !== "undefined") patch.explanation = args.explanation;

    if (Object.keys(patch).length === 0) return true as const;

    await ctx.db.patch(args.id, patch);
    return true as const;
  },
});
