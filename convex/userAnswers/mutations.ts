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

export const saveAnswersBatch = mutation({
  args: {
    answers: v.array(v.object({
      sessionId: v.id("labSessions"),
      questionId: v.id("questions"),
      selectedOptionId: v.id("questionOptions"),
    })),
  },
  handler: async (ctx, { answers }) => {
    if (answers.length === 0) return { savedCount: 0, errors: [] };
    if (answers.length > 10) throw new Error("Batch size too large (max 10)");

    const user = await requireCurrentUser(ctx);
    const results = [];
    const errors = [];
    let totalCorrectDelta = 0;
    const sessionId = answers[0]?.sessionId;

    // Validate session once
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== user._id) throw new Error("Forbidden");
    if (session.status !== "in_progress") throw new Error("Session not active");

    const now = Date.now();

    // Process each answer
    for (const answer of answers) {
      try {
        const { questionId, selectedOptionId } = answer;
        
        // Validate option
        const option = await ctx.db.get(selectedOptionId);
        if (!option) {
          errors.push({ questionId, error: "Option not found" });
          continue;
        }
        if (option.questionId !== questionId) {
          errors.push({ questionId, error: "Option does not belong to question" });
          continue;
        }

        // Find existing answer
        const existing = await ctx.db
          .query("userAnswers")
          .withIndex("by_session_question", (q) => q.eq("sessionId", sessionId).eq("questionId", questionId))
          .first();

        const isCorrect = (option as Doc<"questionOptions">).isCorrect;
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

        totalCorrectDelta += correctDelta;
        results.push({ questionId, success: true });

      } catch (error) {
        errors.push({ 
          questionId: answer.questionId, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    // Update session correctAnswers and lastActivity
    if (totalCorrectDelta !== 0) {
      await ctx.db.patch(session._id, {
        correctAnswers: (session.correctAnswers ?? 0) + totalCorrectDelta,
        lastActivity: now,
      });
    } else {
      await ctx.db.patch(session._id, { lastActivity: now });
    }

    return { 
      savedCount: results.length, 
      errors,
      totalCorrectDelta,
    };
  },
});
