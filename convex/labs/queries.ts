import { v } from "convex/values";
import { query } from "../_generated/server";

export const getUserLabs = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new Error("Unauthorized");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_subject", (u) => u.eq("subject", identity.subject))
			.first();

		if (!user) {
			throw new Error("User not found");
		}

		return await ctx.db
			.query("labs")
			.withIndex("by_creator", (l) => l.eq("creatorId", user._id))
			.collect();
	},
});

export const getLabWithQuestions = query({
	args: {
		labId: v.id("labs"),
	},
	handler: async (ctx, args) => {
		const lab = await ctx.db.get(args.labId);

		if (!lab) return null;

		const questions = await ctx.db
			.query("questions")
			.withIndex("by_lab", (q) => q.eq("labId", lab._id))
			.order("asc")
			.collect();

		const questionsWithOptions = await Promise.all(
			questions.map(async (question) => {
				const options = await ctx.db
					.query("questionOptions")
					.withIndex("by_question", (q) => q.eq("questionId", question._id))
					.order("asc")
					.collect();

				return { ...question, options };
			}),
		);

		return { ...lab, questions: questionsWithOptions };
	},
});
