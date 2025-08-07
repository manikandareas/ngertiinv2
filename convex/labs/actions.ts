import { generateObject } from "ai";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { availableModels } from "../ai";
import { workflow } from "../components";
import { questionSchema } from "./schema";

export const startGenerationQuestion = internalAction({
	args: {
		labId: v.id("labs"),
	},
	handler: async (ctx, args) => {
		const workflowId = await workflow.start(
			ctx,
			internal.labs.workflows.generateLabQuestions,
			{
				labId: args.labId,
			},
		);
		try {
			while (true) {
				const status = await workflow.status(ctx, workflowId);
				if (status.type === "inProgress") {
					continue;
				}
				console.log("Workflow completed with status:", status);
				break;
			}
		} finally {
			await workflow.cleanup(ctx, workflowId);
		}
	},
});

export const generateQuestionsWithLLM = internalAction({
	args: {
		prompt: v.string(),
	},
	handler: async (_, args) => {
		const { object: generatedQuestions } = await generateObject({
			output: "array",
			model: availableModels.gpt4_1,
			schema: questionSchema,
			prompt: args.prompt,
		});

		return generatedQuestions;
	},
});
