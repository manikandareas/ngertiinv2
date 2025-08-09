import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { assertLabOwner } from "../utils/ownership";

export const getBySession = query({
	args: { sessionId: v.id("labSessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		await assertLabOwner(ctx, session.labId);

		const answers = await ctx.db
			.query("userAnswers")
			.withIndex("by_session", (q) => q.eq("sessionId", sessionId))
			.collect();

		const enriched = await Promise.all(
			answers.map(async (a) => {
				const qDoc = await ctx.db.get(a.questionId);
				const oDoc = await ctx.db.get(a.selectedOptionId);
				return {
					...a,
					question: qDoc
						? {
								questionText: (qDoc as Doc<"questions">).questionText,
								questionOrder: (qDoc as Doc<"questions">).questionOrder,
							}
						: undefined,
					selectedOption: oDoc
						? {
								optionText: (oDoc as Doc<"questionOptions">).optionText,
								isCorrect: (oDoc as Doc<"questionOptions">).isCorrect,
								optionOrder: (oDoc as Doc<"questionOptions">).optionOrder,
							}
						: undefined,
				} as Doc<"userAnswers"> & {
					question?: { questionText: string; questionOrder: number };
					selectedOption?: {
						optionText: string;
						isCorrect: boolean;
						optionOrder: number;
					};
				};
			}),
		);

		enriched.sort(
			(x, y) =>
				(x.question?.questionOrder ?? 0) - (y.question?.questionOrder ?? 0) ||
				x.answeredAt - y.answeredAt,
		);

		return { answers: enriched };
	},
});
