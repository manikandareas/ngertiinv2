import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Suspense, useMemo } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { QuestionsHeader } from "./questions-header";
import { QuestionsList } from "./questions-list";

export function QuestionsTab({ labId }: { labId: Id<"labs"> }) {
	// Bundle: { lab, questions }
	const {
		data: labBundle,
		isPending,
		error,
	} = useQuery(convexQuery(api.labs.queries.getLabWithQuestions, { labId }));

	const { data: gen } = useQuery(
		convexQuery(api.generationTasks.queries.getByLab, { labId }),
	);

	const { data: me } = useQuery(convexQuery(api.users.queries.getCurrent, {}));

	const isOwner = useMemo(() => {
		if (!labBundle || !me) return false;
		return labBundle.lab.creatorId === me._id;
	}, [labBundle, me]);

	if (isPending) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-9 w-56" />
				<div className="space-y-3">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</div>
		);
	}

	if (error || !labBundle) {
		return (
			<div className="text-sm text-red-500">Failed to load questions.</div>
		);
	}

	return (
		<div className="space-y-4">
			<Suspense>
				<QuestionsHeader
					status={gen?.status ?? undefined}
					message={gen?.message ?? undefined}
					step={gen?.step ?? undefined}
				/>
			</Suspense>

			<QuestionsList
				labId={labId}
				isOwner={isOwner}
				questions={labBundle.questions}
			/>
		</div>
	);
}
