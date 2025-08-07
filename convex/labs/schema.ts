import { z } from "zod/v4";

export const questionOptionSchema = z.object({
	optionText: z
		.string()
		.describe(
			"Human-readable text for this answer choice as shown to the user.",
		),
	optionOrder: z
		.number()
		.describe(
			"1-based index determining the display order of this option within its question.",
		),
	isCorrect: z
		.boolean()
		.describe("Whether this option is the correct answer for the question."),
});

export const questionSchema = z.object({
	questionText: z
		.string()
		.describe("The question prompt or stem presented to the user."),
	explanation: z
		.string()
		.describe(
			"Explanation or rationale displayed after answering to provide feedback.",
		),
	questionOrder: z
		.number()
		.describe(
			"1-based index determining the display order of this question within the assessment.",
		),
	options: z
		.array(questionOptionSchema)
		.describe(
			"List of answer choices for the question; must include at least one correct option.",
		),
});
