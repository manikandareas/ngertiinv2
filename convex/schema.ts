import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		image: v.string(),
		alreadyOnboarded: v.boolean(),
		subject: v.string(),
	})
		.index("by_email", ["email"])
		.index("by_subject", ["subject"]),

	labs: defineTable({
		creatorId: v.id("users"),
		name: v.string(),
		description: v.optional(v.string()),
		topics: v.array(v.string()),
		difficultyLevel: v.union(
			v.literal("elementary"),
			v.literal("middle"),
			v.literal("high"),
			v.literal("college"),
		),
		questionSize: v.number(), // new field - number of questions to generate
		accessCode: v.string(),
		status: v.union(
			v.literal("draft"),
			v.literal("published"),
			v.literal("closed"),
		),
		// Lab Settings
		isRandomizeQuestions: v.boolean(),
		isRandomizeOptions: v.boolean(),
		maxAttempts: v.number(),
		timeLimitMinutes: v.optional(v.number()), // optional = no time limit
		startTime: v.optional(v.number()), // timestamp
		endTime: v.optional(v.number()), // timestamp
		showResultsAfterSubmission: v.boolean(),
		allowReviewAnswers: v.boolean(),
		// Role context
		createdAsRole: v.union(v.literal("teacher"), v.literal("student")),
	})
		.index("by_creator", ["creatorId"])
		.index("by_access_code", ["accessCode"])
		.index("by_status", ["status"])
		.index("by_creator_status", ["creatorId", "status"]),

	questions: defineTable({
		labId: v.id("labs"),
		questionText: v.string(),
		questionOrder: v.number(),
		explanation: v.optional(v.string()),
	})
		.index("by_lab", ["labId"])
		.index("by_lab_order", ["labId", "questionOrder"]),

	questionOptions: defineTable({
		questionId: v.id("questions"),
		optionText: v.string(),
		optionOrder: v.number(),
		isCorrect: v.boolean(),
	})
		.index("by_question", ["questionId"])
		.index("by_question_order", ["questionId", "optionOrder"])
		.index("by_question_correct", ["questionId", "isCorrect"]),

	// Lab Sessions table
	labSessions: defineTable({
		labId: v.id("labs"),
		userId: v.id("users"),
		attemptNumber: v.number(),
		status: v.union(
			v.literal("in_progress"),
			v.literal("completed"),
			v.literal("timeout"),
			v.literal("abandoned"),
		),
		startedAt: v.number(), // timestamp
		completedAt: v.optional(v.number()), // timestamp
		totalScore: v.number(),
		totalQuestions: v.number(),
		correctAnswers: v.number(),
		// For realtime monitoring
		currentQuestionOrder: v.number(),
		lastActivity: v.number(), // timestamp
	})
		.index("by_lab_user", ["labId", "userId"])
		.index("by_lab_status", ["labId", "status"])
		.index("by_last_activity", ["lastActivity"])
		.index("by_user_lab_attempt", ["userId", "labId", "attemptNumber"]),

	userAnswers: defineTable({
		sessionId: v.id("labSessions"),
		questionId: v.id("questions"),
		selectedOptionId: v.id("questionOptions"),
		isCorrect: v.boolean(),
		answeredAt: v.number(), // timestamp
	})
		.index("by_session", ["sessionId"])
		.index("by_question", ["questionId"])
		.index("by_session_question", ["sessionId", "questionId"]),

	aiFeedback: defineTable({
		sessionId: v.id("labSessions"),
		feedbackText: v.string(),
		strengths: v.array(v.string()),
		weaknesses: v.array(v.string()),
		improvementSuggestions: v.array(v.string()),
		openaiResponse: v.optional(v.any()), // raw OpenAI response for debugging
	}).index("by_session", ["sessionId"]),
});
