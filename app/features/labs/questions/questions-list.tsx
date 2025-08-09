import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { QuestionCard } from "./question-card";
import type { HighlightRange } from "./match-highlighter";

export type QuestionWithOptions = Doc<"questions"> & {
	options: Doc<"questionOptions">[];
};

type LabBundle = { lab: Doc<"labs">; questions: QuestionWithOptions[] };

export function QuestionsList({
	labId,
	isOwner,
	questions,
	isSearchActive = false,
	getHighlights,
}: {
	labId: Id<"labs">;
	isOwner: boolean;
	questions: QuestionWithOptions[];
	isSearchActive?: boolean;
	getHighlights?: (text: string) => HighlightRange[];
}) {
	const queryClient = useQueryClient();
	const labQ = useMemo(
		() => convexQuery(api.labs.queries.getLabWithQuestions, { labId }),
		[labId],
	);

	const [local, setLocal] = useState<QuestionWithOptions[] | null>(null);
	const ordered = local ?? questions;

	const { mutate: reorderQuestions, isPending } = useMutation({
		mutationFn: useConvexMutation(api.questions.mutations.reorderQuestions),
		onMutate: async (_vars: {
			labId: Id<"labs">;
			orderedIds: Id<"questions">[];
		}) => {
			const prev = queryClient.getQueryData<LabBundle>(labQ.queryKey);
			return { prev } as const;
		},
		onError: (_err, _vars, ctx?: { prev?: LabBundle }) => {
			if (ctx?.prev) queryClient.setQueryData(labQ.queryKey, ctx.prev);
			toast.error("Failed to reorder questions");
		},
		onSettled: () => {
			// Always refetch to ensure canon order
			queryClient.invalidateQueries({ queryKey: labQ.queryKey });
			setLocal(null);
		},
	});

	function handleDragEnd(event: DragEndEvent) {
		if (!isOwner) return;
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		// Only handle question items (ids prefixed with 'q-')
		const aId = String(active.id);
		const oId = String(over.id);
		if (!aId.startsWith("q-") || !oId.startsWith("q-")) return;
		const aDocId = aId.slice(2) as Id<"questions">;
		const oDocId = oId.slice(2) as Id<"questions">;

		const fromIndex = ordered.findIndex((q) => q._id === aDocId);
		const toIndex = ordered.findIndex((q) => q._id === oDocId);
		if (fromIndex < 0 || toIndex < 0) return;

		const optimistic = arrayMove(ordered, fromIndex, toIndex);
		setLocal(optimistic);

		const orderedIds = optimistic.map((q) => q._id);
		const prev = queryClient.getQueryData<LabBundle>(labQ.queryKey);
		if (prev) {
			queryClient.setQueryData(labQ.queryKey, {
				...prev,
				questions: optimistic,
			});
		}

		reorderQuestions({ labId, orderedIds });
	}

	if (!isSearchActive && ordered.length === 0) {
		return (
			<div className="text-sm text-muted-foreground border rounded-md p-4">
				No questions yet.
			</div>
		);
	}

	return (
		<DndContext onDragEnd={handleDragEnd}>
			<SortableContext
				items={ordered.map((q) => `q-${q._id}`)}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-3">
					{ordered.map((q) => (
						<QuestionCard
							key={q._id}
							labId={labId}
							isOwner={isOwner}
							question={q}
							dndDisabled={!isOwner || isPending || isSearchActive}
							getHighlights={getHighlights}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
