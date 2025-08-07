import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { GraduationCap, Loader, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/3d-button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getUrlPrefix } from "../../utils";
import { FormSwitch } from "./animated-switch";
import { FormSelect } from "./form-select";
import { FormSizeSelector } from "./form-size-selector";
import { FormTopicSelector } from "./form-topic-selector";

export type CreateAssessmentFormValues = {
	assessmentName: string;
	topics: string[];
	difficulty: string;
	questionSize: number;
	role: "teacher" | "student";
};

type Props = {
	defaultValues?: Partial<CreateAssessmentFormValues>;
	predefinedTopics: string[];
	difficultyOptions: { value: string; label: string }[];
	predefinedSizes: number[];
	className?: string;
};

export function CreateAssessmentForm({
	defaultValues,
	predefinedTopics,
	difficultyOptions,
	predefinedSizes,
	className,
}: Props) {
	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { isSubmitting },
		getValues,
	} = useForm<CreateAssessmentFormValues>({
		defaultValues: {
			assessmentName: "My Assessment",
			topics: ["Mathematics"],
			difficulty: "elementary",
			questionSize: 10,
			role: "teacher",
			...defaultValues,
		},
	});

	const navigate = useNavigate();

	const { mutate: createLab, isPending } = useMutation({
		mutationFn: useConvexMutation(api.labs.mutations.createLab),
		onSuccess: (lid) => {
			if (lid) {
				const role = getValues("role");
				toast.success("Assessment created successfully");
				navigate(`/labs/${lid}/${getUrlPrefix(role)}/dashboard`);
			}
		},
	});

	const questionSize = watch("questionSize");

	const submit = (values: CreateAssessmentFormValues) => {
		createLab({
			createdAsRole: values.role,
			name: values.assessmentName,
			topics: values.topics,
			questionSize: values.questionSize,
			difficultyLevel: values.difficulty as
				| "elementary"
				| "middle"
				| "high"
				| "college",
		});
	};

	return (
		<form onSubmit={handleSubmit(submit)} className={className}>
			<div className="mb-3">
				<h1 className="text-xl font-semibold mb-1 text-gray-900">
					{"Let's build your "}
					<code className="bg-gray-100 px-2 py-0.5 rounded-md text-sm font-mono text-blue-600">
						{"<Assessment />"}
					</code>
				</h1>
				<p className="text-sm text-gray-500">
					Create a personalized assessment tailored to your needs
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Assessment Name */}
				<div className="space-y-2">
					<Label
						htmlFor="assessment-name"
						className="text-sm font-medium text-gray-900"
					>
						Assessment name
					</Label>
					<p className="text-xs text-gray-500">
						We generated one for you. Change this now, or anytime.
					</p>
					<Input
						id="assessment-name"
						className="w-full h-9 rounded-md border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
						{...register("assessmentName")}
					/>
				</div>

				{/* Topics */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-900">Topics</Label>
					<p className="text-xs text-gray-500">
						Select existing topics or add custom ones.
					</p>
					<Controller
						name="topics"
						control={control}
						render={({ field }) => (
							<FormTopicSelector
								selectedTopics={field.value}
								onTopicsChange={field.onChange}
								predefinedTopics={predefinedTopics}
								density="compact"
							/>
						)}
					/>
				</div>

				{/* Difficulty */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-900">
						Difficulty Level
					</Label>
					<p className="text-xs text-gray-500">
						Choose the appropriate difficulty for your audience.
					</p>
					<Controller
						name="difficulty"
						control={control}
						render={({ field }) => (
							<FormSelect
								options={difficultyOptions}
								value={field.value}
								onChange={field.onChange}
								placeholder="Select difficulty"
								size="sm"
							/>
						)}
					/>
				</div>

				{/* Question Size */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-900">
						Number of Questions
					</Label>
					<p className="text-xs text-gray-500">
						How many questions should be in this assessment?
					</p>
					<Controller
						name="questionSize"
						control={control}
						render={({ field }) => (
							<FormSizeSelector
								selectedSize={field.value}
								onSizeChange={field.onChange}
								predefinedSizes={predefinedSizes}
								size="sm"
							/>
						)}
					/>
				</div>

				{/* Role */}
				<div className="space-y-2">
					<Label className="text-sm font-medium text-gray-900">Your Role</Label>
					<p className="text-xs text-gray-500">
						Are you creating this as a teacher or taking it as a student?
					</p>
					<div className="grid grid-cols-2 gap-2">
						<Controller
							name="role"
							control={control}
							render={({ field }) => (
								<>
									<FormSwitch
										checked={field.value === "teacher"}
										onChange={(checked) =>
											field.onChange(checked ? "teacher" : "student")
										}
										label="Teacher"
										icon={<GraduationCap className="w-4 h-4" />}
										size="sm"
									/>
									<FormSwitch
										checked={field.value === "student"}
										onChange={(checked) =>
											field.onChange(checked ? "student" : "teacher")
										}
										label="Student"
										icon={<User className="w-4 h-4" />}
										size="sm"
									/>
								</>
							)}
						/>
					</div>
				</div>
			</div>

			<div className="mt-4">
				<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.995 }}>
					<Button
						type="submit"
						className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-9 text-sm font-medium"
						disabled={isPending || isSubmitting}
					>
						{isPending || isSubmitting ? (
							<>
								Create Assessment
								<Loader className="w-4 h-4 mr-2 animate-spin" />
							</>
						) : (
							`Create Assessment (${questionSize} questions)`
						)}
					</Button>
				</motion.div>
			</div>
		</form>
	);
}
