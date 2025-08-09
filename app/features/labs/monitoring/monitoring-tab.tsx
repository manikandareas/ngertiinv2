import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import {
	parseAsArrayOf,
	parseAsString,
	parseAsStringEnum,
	useQueryState,
} from "nuqs";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { MonitoringHeader } from "./monitoring-header";
import { MonitoringToolbar } from "./monitoring-toolbar";
import { SessionsTable } from "./sessions-table";

export type SessionStatus = Doc<"labSessions">["status"];

export type EnrichedSession = Doc<"labSessions"> & {
	user: { name: string; email: string; avatarUrl: string };
};

export type SummaryKPI = {
	total: number;
	active: number;
	completed: number;
	timeout: number;
	abandoned: number;
	completionRate: number;
	avgScore: number | null;
	avgAccuracy: number | null;
};

export function MonitoringTab({ labId }: { labId: Id<"labs"> }) {
	// URL state
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [statusCsv, setStatusCsv] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [sort, setSort] = useQueryState(
		"sort",
		parseAsStringEnum(["last", "started", "score"]).withDefault("last"),
	);

	const selectedStatuses = useMemo(() => {
		const s = (statusCsv ?? []).filter(Boolean) as SessionStatus[];
		return s.length ? s : undefined;
	}, [statusCsv]);

	// Paginated sessions (server ordered by lastActivity desc)
	const { results, status, loadMore } = usePaginatedQuery(
		api.labSessions.queries.listByLabPaginated,
		{ labId, status: selectedStatuses },
		{ initialNumItems: 30 },
	);

	// KPI summary
	const { data: summary } = useQuery(
		convexQuery(api.labSessions.queries.summaryByLab, { labId }),
	);

	// Client-side search + sort for started/score
	const filteredSorted = useMemo(() => {
		let arr = (results as EnrichedSession[]) ?? [];

		// search by user name/email (case-insensitive)
		if (q) {
			const needle = q.toLowerCase();
			arr = arr.filter(
				(s) =>
					s.user?.name?.toLowerCase().includes(needle) ||
					s.user?.email?.toLowerCase().includes(needle),
			);
		}

		if (sort === "started") {
			arr = [...arr].sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
		} else if (sort === "score") {
			arr = [...arr].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
		} // else keep server order by lastActivity desc

		return arr;
	}, [results, q, sort]);

	const [expanded, setExpanded] = useState<string | null>(null);

	const canLoadMore = status === "CanLoadMore" || status === "LoadingMore";
	const isLoadingMore = status === "LoadingMore";

	// Empty state checks (before/after filtering)
	const hasAny = (results?.length ?? 0) > 0;
	const hasFiltered = filteredSorted.length > 0;

	return (
		<div className="space-y-4">
			<MonitoringHeader summary={summary as SummaryKPI | undefined} />

			<MonitoringToolbar
				q={q}
				onQChange={setQ}
				statuses={(statusCsv as SessionStatus[]) ?? []}
				onStatusesChange={setStatusCsv}
				sort={sort}
				onSortChange={setSort}
			/>

			{!hasAny ? (
				<div className="text-sm text-muted-foreground p-4 border rounded-md">
					Belum ada yang mengerjakan lab ini.
				</div>
			) : !hasFiltered ? (
				<div className="text-sm text-muted-foreground p-4 border rounded-md">
					No sessions match your filters.{" "}
					<button
						type="button"
						className="underline"
						onClick={() => {
							setQ("");
							setStatusCsv([]);
						}}
					>
						Clear filters
					</button>
				</div>
			) : (
				<SessionsTable
					sessions={filteredSorted}
					expandedId={expanded}
					onToggleExpand={(id) =>
						setExpanded((cur) => (cur === id ? null : id))
					}
				/>
			)}

			{hasFiltered && (
				<div className="flex justify-center pt-2">
					<Button
						onClick={() => loadMore(30)}
						disabled={!canLoadMore}
						variant="secondary"
					>
						{isLoadingMore
							? "Loading..."
							: canLoadMore
								? "Load more"
								: "No more"}
					</Button>
				</div>
			)}
		</div>
	);
}
