import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { assertLabOwner } from "../utils/ownership";

export const hardestQuestions = query({
  args: {
    labId: v.id("labs"),
    limit: v.optional(v.number()),
    windowDays: v.optional(v.number()),
  },
  handler: async (ctx, { labId, limit, windowDays }) => {
    await assertLabOwner(ctx, labId);

    const now = Date.now();
    const days = typeof windowDays === "number" && windowDays > 0 ? windowDays : 7;
    const windowStart = now - days * 24 * 60 * 60 * 1000;

    // Get questions of this lab
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_lab", (q) => q.eq("labId", labId))
      .collect();
    const qMap = new Map<Id<"questions">, Doc<"questions">>(
      questions.map((q) => [q._id, q]),
    );

    // Aggregate by question from userAnswers
    // We iterate questions to ensure we filter by lab efficiently
    const stats: {
      questionId: Id<"questions">;
      attempts: number;
      corrects: number;
    }[] = [];

    for (const q of questions) {
      const answers = await ctx.db
        .query("userAnswers")
        .withIndex("by_question", (qq) => qq.eq("questionId", q._id))
        .collect();

      const inWindow = answers.filter((a) => (a.answeredAt ?? 0) >= windowStart);
      if (inWindow.length === 0) continue;

      const attempts = inWindow.length;
      const corrects = inWindow.reduce((acc, a) => acc + (a.isCorrect ? 1 : 0), 0);
      stats.push({ questionId: q._id, attempts, corrects });
    }

    const enriched = stats
      .map((s) => {
        const q = qMap.get(s.questionId)!;
        const accuracy = s.attempts ? s.corrects / s.attempts : 0;
        return {
          questionId: s.questionId,
          questionText: q.questionText,
          questionOrder: q.questionOrder,
          accuracy,
          attempts: s.attempts,
          corrects: s.corrects,
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy || a.questionOrder - b.questionOrder);

    const topN = limit && limit > 0 ? limit : 5;
    return enriched.slice(0, topN);
  },
});

export const timePerQuestion = query({
  args: {
    labId: v.id("labs"),
    limit: v.optional(v.number()),
    windowDays: v.optional(v.number()),
  },
  handler: async (ctx, { labId, limit, windowDays }) => {
    await assertLabOwner(ctx, labId);

    const now = Date.now();
    const days = typeof windowDays === "number" && windowDays > 0 ? windowDays : 7;
    const windowStart = now - days * 24 * 60 * 60 * 1000;

    // Map of question meta
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_lab", (q) => q.eq("labId", labId))
      .collect();
    const qMap = new Map<Id<"questions">, Doc<"questions">>(
      questions.map((q) => [q._id, q]),
    );

    // Collect sessions in window
    const sessions = await ctx.db
      .query("labSessions")
      .withIndex("by_lab_status", (q) => q.eq("labId", labId))
      .collect();

    const inWindow = sessions.filter(
      (s) =>
        (s.startedAt ?? 0) >= windowStart ||
        (s.completedAt ?? 0) >= windowStart ||
        (s.lastActivity ?? 0) >= windowStart,
    );

    // For each session, gather answers and compute per-question durations
    const durationsByQ = new Map<Id<"questions">, number[]>();

    for (const s of inWindow) {
      const answers = await ctx.db
        .query("userAnswers")
        .withIndex("by_session", (q) => q.eq("sessionId", s._id))
        .collect();

      const enriched = answers
        .map((a) => ({
          ...a,
          order: qMap.get(a.questionId)?.questionOrder ?? 0,
        }))
        .sort((a, b) => a.order - b.order || a.answeredAt - b.answeredAt);

      let prevTs = s.startedAt;
      for (const ans of enriched) {
        const diff = Math.max(0, ans.answeredAt - prevTs);
        prevTs = ans.answeredAt;
        const arr = durationsByQ.get(ans.questionId) ?? [];
        arr.push(diff);
        durationsByQ.set(ans.questionId, arr);
      }
    }

    function median(arr: number[]): number {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
      return sorted[mid];
    }

    const rows = Array.from(durationsByQ.entries())
      .map(([questionId, arr]) => {
        const q = qMap.get(questionId);
        if (!q) return null;
        return {
          questionId,
          questionText: q.questionText,
          questionOrder: q.questionOrder,
          medianMs: median(arr),
          samples: arr.length,
        };
      })
      .filter(Boolean) as Array<{
      questionId: Id<"questions">;
      questionText: string;
      questionOrder: number;
      medianMs: number;
      samples: number;
    }>;

    rows.sort((a, b) => b.medianMs - a.medianMs || a.questionOrder - b.questionOrder);

    const topN = limit && limit > 0 ? limit : 10;
    return rows.slice(0, topN);
  },
});
