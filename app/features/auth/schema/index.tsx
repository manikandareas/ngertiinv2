import { z } from "zod";

export const signInSchema = z.object({
	email: z.email({ message: "Invalid email" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" }),
	rememberMe: z.boolean().optional(),
});

export const signUpSchema = z.object({
	name: z
		.string()
		.min(3, { message: "Name must be at least 3 characters long" }),
	email: z.email({ message: "Invalid email" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" }),
});
