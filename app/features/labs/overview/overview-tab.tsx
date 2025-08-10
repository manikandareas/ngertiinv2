import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { EnrichedSession } from "~/features/labs/monitoring/monitoring-tab";
import { ScoreCell } from "~/features/labs/monitoring/score-cell";
import { StatusBadge } from "~/features/labs/monitoring/status-badge";
import { TimeCell } from "~/features/labs/monitoring/time-cell";
import { ActivityTrendCard } from "./activity-trend-card";
import { HardestQuestionsCard } from "./hardest-questions-card";
import { KpiGrid } from "./kpi-grid";
import { OverviewHeader } from "./overview-header";
import { QuickActions } from "./quick-actions";
import { ScoreHistogramCard } from "./score-histogram-card";
import { StatusDistributionCard } from "./status-distribution-card";
import { TimePerQuestionCard } from "./time-per-question-card";

export function OverviewTab({
	labId,
	onNavigateTab,
}: {
	labId: Id<"labs">;
	onNavigateTab?: (tab: "settings" | "questions" | "monitoring") => void;
}) {
	// Window selector (7d/30d) via URL state
	const [windowStr, setWindowStr] = useQueryState(
		"window",
		parseAsStringEnum(["7", "30"]).withDefault("7"),
	);
	const windowDays = useMemo(() => Number(windowStr) || 7, [windowStr]);

	// Lab bundle for header (lab name)
	const { data: labBundle } = useQuery(
		convexQuery(api.labs.queries.getLabWithQuestions, { labId }),
	);

	// Generation task (for header status)
	const { data: gen } = useQuery(
		convexQuery(api.generationTasks.queries.getByLab, { labId }),
	);

	// KPI
	const { data: kpi, isPending: kpiLoading } = useQuery(
		convexQuery(api.labs.queries.overviewKpi, { labId, windowDays }),
	);

	// Status distribution
	const { data: statusDist } = useQuery(
		convexQuery(api.labSessions.queries.statusDistribution, {
			labId,
			windowDays,
		}),
	);

	// Activity trend (timeseries)
	const { data: trend } = useQuery(
		convexQuery(api.labSessions.queries.activityTimeseries, {
			labId,
			days: windowDays,
		}),
	);

	// Score histogram
	const { data: histogram } = useQuery(
		convexQuery(api.labSessions.queries.scoreHistogram, {
			labId,
			windowDays,
			bucketSize: 10,
		}),
	);

	// Hardest questions
	const { data: hardest } = useQuery(
		convexQuery(api.analytics.queries.hardestQuestions, {
			labId,
			windowDays,
			limit: 5,
		}),
	);

	// Time per question
	const { data: tPerQ } = useQuery(
		convexQuery(api.analytics.queries.timePerQuestion, {
			labId,
			windowDays,
			limit: 10,
		}),
	);

	// Recent activity feed (paginated)
	const {
		results: recent,
		status: recentStatus,
		loadMore,
	} = usePaginatedQuery(
		api.labSessions.queries.recentByLabPaginated,
		{ labId },
		{ initialNumItems: 15 },
	);

	const onWindowChange = (val: 7 | 30) =>
		setWindowStr(String(val) as "7" | "30");

	return (
		<div className="space-y-4">
			<OverviewHeader
				lab={labBundle?.lab as Doc<"labs"> | undefined}
				generationStatus={gen?.status}
				windowDays={windowDays}
				onWindowChange={onWindowChange}
			/>

			{kpiLoading ? (
				<Card>
					<CardContent className="p-6">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<Skeleton className="h-20" />
							<Skeleton className="h-20" />
							<Skeleton className="h-20" />
							<Skeleton className="h-20" />
							<Skeleton className="h-20" />
							<Skeleton className="h-20" />
						</div>
					</CardContent>
				</Card>
			) : (
				<KpiGrid data={kpi} />
			)}

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
				<div className="lg:col-span-8 space-y-4">
					<StatusDistributionCard data={statusDist} />
					<ActivityTrendCard data={trend ?? []} />
					<ScoreHistogramCard data={histogram} />
				</div>
				<div className="lg:col-span-4 space-y-4">
					<HardestQuestionsCard data={hardest ?? []} />
					<TimePerQuestionCard
						data={tPerQ ?? []}
						onGoQuestions={() => onNavigateTab?.("questions")}
					/>
					<QuickActions onNavigateTab={onNavigateTab} />
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					{!recent || recent.length === 0 ? (
						<div className="text-sm text-muted-foreground border rounded-md p-4">
							No recent activity.
						</div>
					) : (
						<div className="divide-y">
							{(recent as EnrichedSession[]).map((s) => (
								<div key={s._id} className="py-3 flex items-center gap-3">
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium truncate">
											{s.user?.name || s.user?.email || "Unknown"}
										</div>
										<div className="text-xs text-muted-foreground truncate">
											{s.user?.email}
										</div>
									</div>
									<div className="w-28 shrink-0 text-right">
										<ScoreCell score={s.totalScore ?? null} />
									</div>
									<div className="w-28 shrink-0 text-right">
										<StatusBadge status={s.status} />
									</div>
									<div className="w-28 shrink-0 text-right">
										<TimeCell timestamp={s.lastActivity} />
									</div>
								</div>
							))}
						</div>
					)}

					<div className="flex justify-center pt-3">
						<Button
							variant="secondary"
							onClick={() => loadMore(15)}
							disabled={
								recentStatus === "LoadingMore" || recentStatus === "Exhausted"
							}
						>
							{recentStatus === "LoadingMore"
								? "Loading..."
								: recentStatus === "Exhausted"
									? "No more"
									: "Load more"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
