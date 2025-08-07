import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { generateAccessCode } from "../utils";

export const createLab = mutation({
	args: {
		name: v.string(),
		description: v.optional(v.string()),
		topics: v.array(v.string()),
		difficultyLevel: v.union(
			v.literal("elementary"),
			v.literal("middle"),
			v.literal("high"),
			v.literal("college"),
		),
		questionSize: v.number(),
		// Lab Settings
		createdAsRole: v.union(v.literal("teacher"), v.literal("student")),
	},

	handler: async (ctx, args) => {
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

		return await ctx.db.insert("labs", {
			creatorId: user._id,
			accessCode: generateAccessCode(),
			createdAsRole: args.createdAsRole,
			difficultyLevel: args.difficultyLevel,
			questionSize: args.questionSize,
			name: args.name,
			description: args.description,
			topics: args.topics,

			// default values
			status: "draft",
			isRandomizeQuestions: false,
			isRandomizeOptions: false,
			maxAttempts: 1,
			showResultsAfterSubmission: false,
			allowReviewAnswers: false,
			endTime: undefined,
			startTime: undefined,
			timeLimitMinutes: undefined,
		});
	},
});

export const updateLabSettings = mutation({
	args: {
		labId: v.id("labs"),
		name: v.string(),
		description: v.optional(v.string()),
		topics: v.array(v.string()),
		difficultyLevel: v.union(
			v.literal("elementary"),
			v.literal("middle"),
			v.literal("high"),
			v.literal("college"),
		),
		questionSize: v.number(),
		// Lab Settings
		isRandomizeQuestions: v.boolean(),
		isRandomizeOptions: v.boolean(),
		maxAttempts: v.number(),
		showResultsAfterSubmission: v.boolean(),
		allowReviewAnswers: v.boolean(),
		endTime: v.optional(v.number()),
		startTime: v.optional(v.number()),
		timeLimitMinutes: v.optional(v.number()),
	},

	handler: async (ctx, args) => {
		const lab = await ctx.db.get(args.labId);

		if (!lab) {
			throw new Error("Lab not found");
		}

		return await ctx.db.patch(args.labId, {
			name: args.name,
			description: args.description,
			topics: args.topics,
			difficultyLevel: args.difficultyLevel,
			questionSize: args.questionSize,
			isRandomizeQuestions: args.isRandomizeQuestions,
			isRandomizeOptions: args.isRandomizeOptions,
			maxAttempts: args.maxAttempts,
			showResultsAfterSubmission: args.showResultsAfterSubmission,
			allowReviewAnswers: args.allowReviewAnswers,
			endTime: args.endTime,
			startTime: args.startTime,
			timeLimitMinutes: args.timeLimitMinutes,
		});
	},
});
