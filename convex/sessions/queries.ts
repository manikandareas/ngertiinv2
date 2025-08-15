import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { type QueryCtx, query } from "../_generated/server";

async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) throw new Error("Unauthorized");
	const user = await ctx.db
		.query("users")
		.withIndex("by_subject", (q) => q.eq("subject", identity.subject))
		.first();
	if (!user) throw new Error("Unauthorized");
	return user as Doc<"users">;
}

export const getSessionBundle = query({
	args: { sessionId: v.id("labSessions") },
	handler: async (ctx, { sessionId }) => {
		const user = await getCurrentUser(ctx);

		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		if (session.userId !== user._id) throw new Error("Forbidden");

		const lab = await ctx.db.get(session.labId);
		if (!lab) throw new Error("Lab not found");

		const questions = await ctx.db
			.query("questions")
			.withIndex("by_lab_order", (q) => q.eq("labId", session.labId))
			.order("asc")
			.collect();

		const optionsByQuestion: Record<
			string,
			{ _id: Id<"questionOptions">; optionOrder: number; optionText: string }[]
		> = {};
		for (const qDoc of questions) {
			const opts = await ctx.db
				.query("questionOptions")
				.withIndex("by_question_order", (q) => q.eq("questionId", qDoc._id))
				.order("asc")
				.collect();
			optionsByQuestion[qDoc._id] = opts.map((o) => ({
				_id: o._id,
				optionOrder: o.optionOrder,
				optionText: o.optionText,
			}));
		}

		const answersArr = await ctx.db
			.query("userAnswers")
			.withIndex("by_session", (q) => q.eq("sessionId", session._id))
			.collect();
		const answers: Record<string, Id<"questionOptions">> = {};
		for (const a of answersArr) answers[a.questionId] = a.selectedOptionId;

		return {
			lab: {
				_id: lab._id,
				name: lab.name,
				endTime: lab.endTime,
				maxAttempts: lab.maxAttempts,
			},
			session: {
				_id: session._id,
				attemptNumber: session.attemptNumber,
				status: session.status,
				totalQuestions: session.totalQuestions,
				correctAnswers: session.correctAnswers,
				currentQuestionOrder: session.currentQuestionOrder,
				startedAt: session.startedAt,
				lastActivity: session.lastActivity,
			},
			questions: questions.map((q) => ({
				_id: q._id,
				questionOrder: q.questionOrder,
				questionText: q.questionText,
				explanation: q.explanation,
			})),
			optionsByQuestion,
			answers,
		};
	},
});

export const getResultBundle = query({
	args: { sessionId: v.id("labSessions") },
	handler: async (ctx, { sessionId }) => {
		const user = await getCurrentUser(ctx);

		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");

		const lab = await ctx.db.get(session.labId);
		if (!lab) throw new Error("Lab not found");

		// Allow if owner (participant) or lab creator (teacher)
		const isOwner = session.userId === user._id;
		const isTeacher = lab.creatorId === user._id;
		if (!isOwner && !isTeacher) throw new Error("Forbidden");

		const questions = await ctx.db
			.query("questions")
			.withIndex("by_lab_order", (q) => q.eq("labId", session.labId))
			.order("asc")
			.collect();

		const optionsByQuestion = new Map<string, Doc<"questionOptions">[]>();
		for (const qDoc of questions) {
			const opts = await ctx.db
				.query("questionOptions")
				.withIndex("by_question_order", (q) => q.eq("questionId", qDoc._id))
				.order("asc")
				.collect();
			optionsByQuestion.set(qDoc._id, opts);
		}

		const answers = await ctx.db
			.query("userAnswers")
			.withIndex("by_session", (q) => q.eq("sessionId", session._id))
			.collect();

		const byQ = new Map<string, Doc<"userAnswers">>();
		for (const a of answers) byQ.set(a.questionId, a);

		const items = questions.map((q) => {
			const a = byQ.get(q._id);
			const opts = optionsByQuestion.get(q._id) ?? [];
			const selected = opts.find((o) => o._id === a?.selectedOptionId);
			return {
				question: {
					_id: q._id,
					questionText: q.questionText,
					questionOrder: q.questionOrder,
					explanation: q.explanation,
				},
				selectedOption: selected
					? {
							_id: selected._id,
							optionText: selected.optionText,
							optionOrder: selected.optionOrder,
							isCorrect: selected.isCorrect,
						}
					: undefined,
				isCorrect: a?.isCorrect ?? false,
			};
		});

		const correct = items.reduce((acc, it) => acc + (it.isCorrect ? 1 : 0), 0);
		const total = session.totalQuestions || questions.length;
		const score = Math.round((correct / (total || 1)) * 100);

		return {
			lab: { _id: lab._id, name: lab.name },
			session: {
				_id: session._id,
				status: session.status,
				attemptNumber: session.attemptNumber,
				startedAt: session.startedAt,
				completedAt: session.completedAt,
				totalQuestions: total,
				correctAnswers: session.correctAnswers ?? correct,
				totalScore: session.totalScore ?? score,
			},
			metrics: {
				score,
				correctAnswers: correct,
				totalQuestions: total,
				accuracy: total ? correct / total : 0,
				durationMs:
					(session.completedAt ?? Date.now()) -
					(session.startedAt ?? Date.now()),
			},
			items,
		};
	},
});
