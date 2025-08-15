import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { normalizeAccessCode } from "../utils";

export const startOrResumeWithCode = mutation({
	args: { code: v.string() },
	handler: async (ctx, { code }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new Error("Unauthorized");

		const user = await ctx.db
			.query("users")
			.withIndex("by_subject", (q) => q.eq("subject", identity.subject))
			.first();
		if (!user) throw new Error("Unauthorized");

		const codeN = normalizeAccessCode(code);

		const lab = await ctx.db
			.query("labs")
			.withIndex("by_access_code", (q) => q.eq("accessCode", codeN))
			.first();

		if (!lab || lab.status === "closed") {
			// Neutral error to avoid enumeration
			throw new Error("Kode tidak valid atau sudah tidak aktif");
		}

		// 1) Resume first if there is an in_progress session
		const inprog = await ctx.db
			.query("labSessions")
			.withIndex("by_lab_user", (q) =>
				q.eq("labId", lab._id).eq("userId", user._id),
			)
			.filter((q) => q.eq(q.field("status"), "in_progress"))
			.first();

		if (inprog) {
			return { sessionId: inprog._id, labId: lab._id };
		}

		// 2) Gating for new attempt
		const now = Date.now();
		if (typeof lab.endTime === "number" && now > lab.endTime) {
			throw new Error("Periode pengerjaan sudah berakhir");
		}

		const attemptsUsed = await ctx.db
			.query("labSessions")
			.withIndex("by_user_lab_attempt", (q) =>
				q.eq("userId", user._id).eq("labId", lab._id),
			)
			.collect()
			.then((arr) => arr.length);

		if (attemptsUsed >= lab.maxAttempts) {
			throw new Error("Batas percobaan tercapai");
		}

		// 3) Initialize a new session

    const questionsCount = await ctx.db
      .query("questions")
      .withIndex("by_lab", (q) => q.eq("labId", lab._id))
      .collect()
      .then((arr) => arr.length);

    const sessionId = await ctx.db.insert("labSessions", {
      labId: lab._id,
      userId: user._id,
      attemptNumber: attemptsUsed + 1,
      status: "in_progress",
      startedAt: now,
      completedAt: undefined,
      totalScore: 0,
      totalQuestions: questionsCount,
      correctAnswers: 0,
      currentQuestionOrder: 0,
      lastActivity: now,
    });

    return { sessionId, labId: lab._id };
  },
});

export const submit = mutation({
  args: { sessionId: v.id("labSessions") },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .first();
    if (!user) throw new Error("Unauthorized");

    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== user._id) throw new Error("Forbidden");
    if (session.status !== "in_progress") throw new Error("Session is not active");

    const answers = await ctx.db
      .query("userAnswers")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    const correct = answers.reduce((acc, a) => acc + (a.isCorrect ? 1 : 0), 0);
    const total = session.totalQuestions || (await ctx.db
      .query("questions")
      .withIndex("by_lab", (q) => q.eq("labId", session.labId))
      .collect()
      .then((arr) => arr.length));

    const score = Math.round(((correct / (total || 1)) * 100));
    const now = Date.now();

    await ctx.db.patch(session._id, {
      status: "completed",
      completedAt: now,
      correctAnswers: correct,
      totalScore: score,
      totalQuestions: total,
      lastActivity: now,
      currentQuestionOrder: Math.max(0, total - 1),
    });

    return { score, correct, total };
  },
});

export const setCurrentQuestion = mutation({
  args: { sessionId: v.id("labSessions"), questionOrder: v.number() },
  handler: async (ctx, { sessionId, questionOrder }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .first();
    if (!user) throw new Error("Unauthorized");

    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== user._id) throw new Error("Forbidden");
    if (session.status !== "in_progress") throw new Error("Session is not active");

    const now = Date.now();
    await ctx.db.patch(session._id, {
      currentQuestionOrder: Math.max(0, Math.floor(questionOrder)),
      lastActivity: now,
    });
    return { ok: true };
  },
});
