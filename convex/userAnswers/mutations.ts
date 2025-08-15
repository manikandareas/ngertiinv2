import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

async function requireCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_subject", (q: any) => q.eq("subject", identity.subject))
    .first();
  if (!user) throw new Error("Unauthorized");
  return user as Doc<"users">;
}

export const saveAnswer = mutation({
  args: {
    sessionId: v.id("labSessions"),
    questionId: v.id("questions"),
    selectedOptionId: v.id("questionOptions"),
  },
  handler: async (ctx, { sessionId, questionId, selectedOptionId }) => {
    const user = await requireCurrentUser(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== user._id) throw new Error("Forbidden");
    if (session.status !== "in_progress") throw new Error("Session not active");

    const option = await ctx.db.get(selectedOptionId);
    if (!option) throw new Error("Option not found");
    if (option.questionId !== questionId) throw new Error("Option does not belong to question");

    const existing = await ctx.db
      .query("userAnswers")
      .withIndex("by_session_question", (q) => q.eq("sessionId", sessionId).eq("questionId", questionId))
      .first();

    const now = Date.now();
    const isCorrect = (option as Doc<"questionOptions">).isCorrect;

    // adjust denorm correctAnswers if changed
    let correctDelta = 0;
    if (existing) {
      const prevCorrect = existing.isCorrect;
      if (prevCorrect !== isCorrect) correctDelta = isCorrect ? 1 : -1;
      if (
        existing.selectedOptionId !== selectedOptionId ||
        existing.isCorrect !== isCorrect
      ) {
        await ctx.db.patch(existing._id, {
          selectedOptionId,
          isCorrect,
          answeredAt: now,
        });
      } else {
        // idempotent update
        await ctx.db.patch(existing._id, { answeredAt: now });
      }
    } else {
      await ctx.db.insert("userAnswers", {
        sessionId,
        questionId,
        selectedOptionId,
        isCorrect,
        answeredAt: now,
      });
      correctDelta = isCorrect ? 1 : 0;
    }

    if (correctDelta !== 0) {
      await ctx.db.patch(session._id, {
        correctAnswers: (session.correctAnswers ?? 0) + correctDelta,
      });
    }

    await ctx.db.patch(session._id, { lastActivity: now });

    return { ok: true };
  },
});
