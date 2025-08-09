import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, mutation } from "../_generated/server";
import { rateLimiter } from "../components";
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

		const labId = await ctx.db.insert("labs", {
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

		ctx.scheduler.runAfter(0, internal.labs.actions.startGenerationQuestion, {
			labId,
		});

		return labId;
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
		await rateLimiter.limit(ctx, "updateLabs", { throws: true });

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

export const upsertGenerationTask = internalMutation({
	args: {
		labId: v.id("labs"),
		step: v.string(),
		message: v.optional(v.string()),
		status: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("completed"),
				v.literal("failed"),
			),
		),
	},
	handler: async (ctx, args) => {
		const lab = await ctx.db.get(args.labId);

		if (!lab) {
			throw new Error("Lab not found");
		}

		const generationTask = await ctx.db
			.query("generationTasks")
			.withIndex("by_lab", (q) => q.eq("labId", args.labId))
			.first();

		if (generationTask) {
			return await ctx.db.patch(generationTask._id, {
				status: args.status,
				step: args.step,
				message: args.message,
			});
		}

		return await ctx.db.insert("generationTasks", {
			labId: args.labId,
			status: "pending",
			step: args.step,
			message: args.message,
		});
	},
});

export const insertQuestionWithOptions = internalMutation({
	args: {
		labId: v.id("labs"),
		question: v.object({
			questionText: v.string(),
			explanation: v.optional(v.string()),
			questionOrder: v.number(),
			options: v.array(
				v.object({
					optionText: v.string(),
					optionOrder: v.number(),
					isCorrect: v.boolean(),
				}),
			),
		}),
	},
	handler: async (ctx, args) => {
		const lab = await ctx.db.get(args.labId);

		if (!lab) {
			throw new Error("Lab not found");
		}

		const questionId = await ctx.db.insert("questions", {
			labId: args.labId,
			questionText: args.question.questionText,
			explanation: args.question.explanation,
			questionOrder: args.question.questionOrder,
		});

		for (const option of args.question.options) {
			await ctx.db.insert("questionOptions", {
				questionId,
				optionText: option.optionText,
				optionOrder: option.optionOrder,
				isCorrect: option.isCorrect,
			});
		}

		return questionId;
	},
});

export const insertQuestionOption = internalMutation({
	args: {
		questionId: v.id("questions"),
		option: v.object({
			optionText: v.string(),
			optionOrder: v.number(),
			isCorrect: v.boolean(),
		}),
	},
	handler: async (ctx, args) => {
		const question = await ctx.db.get(args.questionId);

		if (!question) {
			throw new Error("Question not found");
		}

		return await ctx.db.insert("questionOptions", {
			questionId: args.questionId,
			optionText: args.option.optionText,
			optionOrder: args.option.optionOrder,
			isCorrect: args.option.isCorrect,
		});
	},
});
