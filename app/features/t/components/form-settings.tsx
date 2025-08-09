import { useConvexMutation } from "@convex-dev/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { motion } from "framer-motion";
import { ListChecks, Loader, Timer, ToggleLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/3d-button";
import { CardContent } from "~/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { FormSwitch } from "~/features/home/components/new-form/animated-switch";
import { FormSizeSelector } from "~/features/home/components/new-form/form-size-selector";
// Reuse polished micro-interaction components from new-form
import { FormTopicSelector } from "~/features/home/components/new-form/form-topic-selector";

const labSettingsSchema = z.object({
	name: z.string().min(1, "Lab name is required"),
	description: z.string().optional(),
	topics: z.array(z.string()).min(1, "At least one topic is required"),
	difficultyLevel: z.enum(["elementary", "middle", "high", "college"]),
	questionSize: z.number().min(1, "Must have at least 1 question"),
	isRandomizeQuestions: z.boolean(),
	isRandomizeOptions: z.boolean(),
	maxAttempts: z.number().min(1, "Must allow at least 1 attempt"),
	timeLimitMinutes: z.number().optional(),
	showResultsAfterSubmission: z.boolean(),
	allowReviewAnswers: z.boolean(),
});

type LabSettingsForm = z.infer<typeof labSettingsSchema>;

export const SettingsTab = ({ data }: { data: Doc<"labs"> }) => {
	console.log(data);
	const { mutate: updateLabSettings, isPending } = useMutation({
		mutationFn: useConvexMutation(api.labs.mutations.updateLabSettings),
		onSuccess: () => {
			toast.success("Lab settings updated");
		},
		onError: (error) => {
			if (error instanceof ConvexError) {
				if (
					error.data.kind === "RateLimited" &&
					error.data.name === "updateLabs"
				) {
					const seconds = Math.ceil(error.data.retryAfter / 1000);
					toast.error("You are updating too fast", {
						description: `Please wait ${seconds} seconds before updating again`,
					});
					return;
				}
			}

			toast.error("Failed to update lab settings");
		},
	});

	const form = useForm<LabSettingsForm>({
		resolver: zodResolver(labSettingsSchema),
		defaultValues: {
			name: data?.name || "",
			description: data?.description || "",
			topics: data?.topics || [],
			difficultyLevel: data?.difficultyLevel || "elementary",
			questionSize: data?.questionSize || 10,
			isRandomizeQuestions: data?.isRandomizeQuestions || false,
			isRandomizeOptions: data?.isRandomizeOptions || false,
			maxAttempts: data?.maxAttempts || 1,
			timeLimitMinutes: data?.timeLimitMinutes || undefined,
			showResultsAfterSubmission: data?.showResultsAfterSubmission || false,
			allowReviewAnswers: data?.allowReviewAnswers || false,
		},
	});

	const onSubmit = (values: LabSettingsForm) => {
		updateLabSettings({
			labId: data._id,
			...values,
		});
	};

	// Derived helpers for subtle micro-interactions
	const sectionHover = "transition-colors hover:bg-gray-50";
	const panelBase =
		"rounded-xl border border-gray-200 bg-white p-4 md:p-5 " + sectionHover;

	return (
		<div className="overflow-hidden">
			<CardContent className="p-4 md:p-6">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Basic Information */}
						<motion.div
							className={panelBase}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2 }}
						>
							<div className="flex items-center gap-2 mb-4">
								<ListChecks className="w-4 h-4 text-gray-500" />
								<h3 className="text-base md:text-lg font-semibold tracking-tight">
									Basic Information
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-900">
												Lab Name
											</FormLabel>
											<FormDescription className="text-xs text-gray-500">
												This will be visible to participants
											</FormDescription>
											<FormControl>
												<Input
													placeholder="Enter lab name"
													className="h-10 rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-900">
												Description
											</FormLabel>
											<FormDescription className="text-xs text-gray-500">
												Short summary shown on the assessment page
											</FormDescription>
											<FormControl>
												<Input
													placeholder="Enter lab description"
													className="h-10 rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="difficultyLevel"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-900">
												Difficulty Level
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger className="h-10 rounded-lg border-gray-200">
														<SelectValue placeholder="Select difficulty level" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="elementary">
															Elementary
														</SelectItem>
														<SelectItem value="middle">
															Middle School
														</SelectItem>
														<SelectItem value="high">High School</SelectItem>
														<SelectItem value="college">College</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="topics"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-900">
												Topics
											</FormLabel>
											<FormDescription className="text-xs text-gray-500">
												Select existing topics or add custom ones
											</FormDescription>
											<FormControl>
												<div>
													<FormTopicSelector
														selectedTopics={field.value}
														onTopicsChange={field.onChange}
														predefinedTopics={[
															"Mathematics",
															"Science",
															"History",
															"Geography",
															"Programming",
														]}
														density="compact"
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</motion.div>

						{/* Quiz Settings */}
						<motion.div
							className={panelBase}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2, delay: 0.05 }}
						>
							<div className="flex items-center gap-2 mb-4">
								<ToggleLeft className="w-4 h-4 text-gray-500" />
								<h3 className="text-base md:text-lg font-semibold tracking-tight">
									Quiz Settings
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="questionSize"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium text-gray-900">
												Number of Questions
											</FormLabel>
											<FormDescription className="text-xs text-gray-500">
												Choose from presets or set a custom value
											</FormDescription>
											<FormControl>
												<div>
													<FormSizeSelector
														selectedSize={field.value}
														onSizeChange={field.onChange}
														predefinedSizes={[5, 10, 15, 20, 25, 30, 40, 50]}
														size="sm"
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="maxAttempts"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium text-gray-900">
													Maximum Attempts
												</FormLabel>
												<FormDescription className="text-xs text-gray-500">
													How many times can a participant retake the quiz?
												</FormDescription>
												<FormControl>
													<Input
														type="number"
														min={1}
														placeholder="e.g. 3"
														className="h-10 rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500"
														{...field}
														onChange={(e) =>
															field.onChange(Number(e.target.value))
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="timeLimitMinutes"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium text-gray-900 flex items-center gap-2">
													<Timer className="w-4 h-4 text-gray-500" /> Time Limit
													(minutes)
												</FormLabel>
												<FormDescription className="text-xs text-gray-500">
													Leave empty for no time limit
												</FormDescription>
												<FormControl>
													<Input
														type="number"
														min={1}
														placeholder="No limit"
														className="h-10 rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500"
														{...field}
														value={field.value || ""}
														onChange={(e) =>
															field.onChange(
																e.target.value
																	? Number(e.target.value)
																	: undefined,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
									<FormField
										control={form.control}
										name="isRandomizeQuestions"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<FormSwitch
														checked={field.value}
														onChange={field.onChange}
														label="Randomize Questions"
														icon={<ListChecks className="w-4 h-4" />}
														size="sm"
													/>
												</FormControl>
												<FormDescription className="text-xs text-gray-500 mt-1 pl-1">
													Show questions in random order
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="isRandomizeOptions"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<FormSwitch
														checked={field.value}
														onChange={field.onChange}
														label="Randomize Options"
														icon={<ToggleLeft className="w-4 h-4" />}
														size="sm"
													/>
												</FormControl>
												<FormDescription className="text-xs text-gray-500 mt-1 pl-1">
													Show answer options in random order
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="showResultsAfterSubmission"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<FormSwitch
														checked={field.value}
														onChange={field.onChange}
														label="Show Results After Submission"
														icon={<ListChecks className="w-4 h-4" />}
														size="sm"
													/>
												</FormControl>
												<FormDescription className="text-xs text-gray-500 mt-1 pl-1">
													Display results immediately after quiz submission
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="allowReviewAnswers"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<FormSwitch
														checked={field.value}
														onChange={field.onChange}
														label="Allow Review Answers"
														icon={<ListChecks className="w-4 h-4" />}
														size="sm"
													/>
												</FormControl>
												<FormDescription className="text-xs text-gray-500 mt-1 pl-1">
													Allow students to review their answers after
													submission
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</motion.div>

						<div className="flex justify-end gap-2">
							<motion.div
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.995 }}
							>
								<Button
									disabled={isPending}
									type="button"
									variant="outline"
									onClick={() => form.reset()}
									className="rounded-lg"
								>
									Reset
								</Button>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.995 }}
							>
								<Button
									disabled={isPending}
									type="submit"
									className="rounded-lg"
								>
									{isPending ? (
										<>
											Saving
											<Loader className="w-4 h-4 ml-2 animate-spin" />
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</motion.div>
						</div>
					</form>
				</Form>
			</CardContent>
		</div>
	);
};
