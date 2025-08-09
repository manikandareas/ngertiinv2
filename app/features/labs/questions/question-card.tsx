import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { GripVertical } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { MatchHighlighter } from "./match-highlighter";
import type { HighlightRange } from "./match-highlighter";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { OptionsEditor } from "./options-editor";

export type QuestionWithOptions = Doc<"questions"> & {
	options: Doc<"questionOptions">[];
};

type LabBundle = { lab: Doc<"labs">; questions: QuestionWithOptions[] };

const schema = z.object({
	questionText: z.string().min(1, "Question is required"),
	explanation: z.string().optional(),
});

export function QuestionCard({
	labId,
	isOwner,
	question,
	dndDisabled,
	getHighlights,
}: {
	labId: Id<"labs">;
	isOwner: boolean;
	question: QuestionWithOptions;
	dndDisabled?: boolean;
	getHighlights?: (text: string) => HighlightRange[];
}) {
	const labQ = useMemo(
		() => convexQuery(api.labs.queries.getLabWithQuestions, { labId }),
		[labId],
	);
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			questionText: question.questionText,
			explanation: question.explanation ?? "",
		},
	});

	const { mutateAsync: updateQuestion } = useMutation({
		mutationFn: useConvexMutation(api.questions.mutations.updateQuestion),
		onMutate: async (vars: {
			id: Id<"questions">;
			questionText?: string;
			explanation?: string;
		}) => {
			const prev = queryClient.getQueryData<LabBundle>(labQ.queryKey);
			if (prev) {
				const nextQs = prev.questions.map((q) =>
					q._id === vars.id
						? {
								...q,
								...("questionText" in vars
									? { questionText: vars.questionText }
									: {}),
								...("explanation" in vars
									? { explanation: vars.explanation }
									: {}),
							}
						: q,
				);
				queryClient.setQueryData(labQ.queryKey, { ...prev, questions: nextQs });
			}
			return { prev } as const;
		},
		onError: (_err, _vars, ctx?: { prev?: LabBundle }) => {
			if (ctx?.prev) queryClient.setQueryData(labQ.queryKey, ctx.prev);
			toast.error("Failed to save question");
		},
		onSuccess: () => {
			toast.success("Saved");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: labQ.queryKey });
		},
	});

	async function saveField(field: "questionText" | "explanation") {
		if (!isOwner) return;
		const values = form.getValues();
		const patch: any = { id: question._id };
		if (field === "questionText") {
			const v = values.questionText?.trim();
			if (v === question.questionText) return;
			patch.questionText = v;
		} else if (field === "explanation") {
			const v = values.explanation?.trim() || undefined;
			if ((question.explanation ?? undefined) === v) return;
			patch.explanation = v;
		}
		if (Object.keys(patch).length > 1) {
			await updateQuestion(patch);
		}
	}

	// Sortable wrapper
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: `q-${question._id}`,
		disabled: dndDisabled || !isOwner,
	});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.8 : 1,
	} as CSSProperties;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="border rounded-md p-3 bg-white shadow-sm"
		>
			<div className="flex items-start gap-2">
				{isOwner ? (
					<button
						type="button"
						className="cursor-grab mt-1 text-muted-foreground"
						{...attributes}
						{...listeners}
						aria-label="Drag question"
					>
						<GripVertical size={16} />
					</button>
				) : (
					<div className="mt-1 w-4" />
				)}
				<div className="flex-1 space-y-3">
					<Form {...form}>
						<form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
							<FormField
								control={form.control}
								name="questionText"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs">Question</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={!isOwner}
												onBlur={() => saveField("questionText")}
												placeholder="Enter the question text"
											/>
										</FormControl>
										<FormMessage />
										{getHighlights ? (
											<div className="text-xs text-muted-foreground">
												<MatchHighlighter
													text={question.questionText}
													ranges={getHighlights(question.questionText)}
												/>
											</div>
										) : null}
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="explanation"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs">
											Explanation (optional)
										</FormLabel>
										<FormControl>
											<textarea
												{...field}
												disabled={!isOwner}
												onBlur={() => saveField("explanation")}
												placeholder="Add an explanation or notes"
												className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											/>
										</FormControl>
										<FormMessage />
										{getHighlights && (question.explanation || "").length > 0 ? (
											<div className="text-xs text-muted-foreground">
												<MatchHighlighter
													text={question.explanation ?? ""}
													ranges={getHighlights(question.explanation ?? "")}
												/>
											</div>
										) : null}
									</FormItem>
								)}
							/>
						</form>
					</Form>

					<OptionsEditor
						labId={labId}
						isOwner={isOwner}
						questionId={question._id}
						options={question.options}
						getHighlights={getHighlights}
					/>
				</div>
			</div>
		</div>
	);
}
