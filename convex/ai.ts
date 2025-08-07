import { openai } from "@ai-sdk/openai";

export const availableModels = {
	gpt4_1: openai("gpt-4.1"),
};
