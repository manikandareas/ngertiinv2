import { v } from "convex/values";
import { internal } from "../_generated/api";
import { workflow } from "../components";

export const generateLabQuestions = workflow.define({
	args: {
		labId: v.id("labs"),
	},
	handler: async (step, args) => {
		await step.runMutation(internal.labs.mutations.upsertGenerationTask, {
			labId: args.labId,
			status: "pending",
			step: "Initializing question generation",
			message: "Preparing the environment to generate lab questions",
		});

		const lab = await step.runQuery(internal.labs.queries.getLab, {
			labId: args.labId,
		});

		if (!lab) {
			await step.runMutation(internal.labs.mutations.upsertGenerationTask, {
				labId: args.labId,
				step: "Validating lab context",
				status: "failed",
				message: "Lab not found. Please verify the lab exists and try again.",
			});
			return;
		}

		await step.runMutation(internal.labs.mutations.upsertGenerationTask, {
			labId: args.labId,
			status: "pending",
			step: "Generating questions with AI",
			message: "Creating questions based on selected topics and difficulty",
		});

		const prompt = `Generate ${lab.questionSize} questions for a ${lab.difficultyLevel} difficulty level lab. The topics are ${lab.topics.join(", ")}. The questions should be related to the topics and the difficulty level.`;

		const generatedQuestions = await step.runAction(
			internal.labs.actions.generateQuestionsWithLLM,
			{
				prompt,
			},
		);

		if (!generatedQuestions) {
			await step.runMutation(internal.labs.mutations.upsertGenerationTask, {
				labId: args.labId,
				step: "Generating questions with AI",
				status: "failed",
				message:
					"Failed to generate questions. The AI did not return any results.",
			});
			return;
		}

		await step.runMutation(internal.labs.mutations.upsertGenerationTask, {
			labId: args.labId,
			status: "pending",
			step: "Persisting generated questions",
			message: "Saving generated questions to the lab",
		});

		for (const question of generatedQuestions) {
			await step.runMutation(
				internal.labs.mutations.insertQuestionWithOptions,
				{
					labId: args.labId,
					question,
				},
			);
		}

		await step.runMutation(internal.labs.mutations.upsertGenerationTask, {
			labId: args.labId,
			step: "Question generation complete",
			message: "Successfully generated and saved questions for the lab",
			status: "completed",
		});
	},
});
