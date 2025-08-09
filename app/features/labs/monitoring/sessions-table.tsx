import type { Id } from "convex/_generated/dataModel";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { EnrichedSession } from "./monitoring-tab";
import { ProgressCell } from "./progress-cell";
import { ScoreCell } from "./score-cell";
import { SessionRowExpanded } from "./session-row-expanded";
import { StatusBadge } from "./status-badge";
import { TimeCell } from "./time-cell";

function fmtPercent(n: number) {
	return `${Math.round(n * 100)}%`;
}

export function SessionsTable({
	sessions,
	expandedId,
	onToggleExpand,
}: {
	sessions: EnrichedSession[];
	expandedId: string | null;
	onToggleExpand: (id: string) => void;
}) {
	return (
		<div className="overflow-x-auto rounded-lg border">
			<table className="min-w-full text-sm">
				<thead className="bg-muted/50">
					<tr className="text-left">
						<th className="w-10"></th>
						<th className="px-4 py-2">User</th>
						<th className="px-4 py-2">Attempt</th>
						<th className="px-4 py-2">Status</th>
						<th className="px-4 py-2">Progress</th>
						<th className="px-4 py-2">Correct</th>
						<th className="px-4 py-2">Score</th>
						<th className="px-4 py-2">Started</th>
						<th className="px-4 py-2">Last Activity</th>
						<th className="px-4 py-2">Duration</th>
					</tr>
				</thead>
				<tbody>
					{sessions.map((s) => {
						const isOpen = expandedId === (s._id as unknown as string);
						const correctPct = s.totalQuestions
							? s.correctAnswers / s.totalQuestions
							: 0;
						const durationMs = (s.completedAt ?? Date.now()) - s.startedAt;

						return (
							<>
								<tr key={s._id as unknown as string} className="border-t">
									<td className="align-top">
										<button
											type="button"
											className="h-8 w-8 flex items-center justify-center"
											aria-label={isOpen ? "Collapse" : "Expand"}
											onClick={() => onToggleExpand(s._id as unknown as string)}
										>
											{isOpen ? (
												<ChevronDown className="size-4" />
											) : (
												<ChevronRight className="size-4" />
											)}
										</button>
									</td>
									<td className="px-4 py-2">
										<div className="flex items-center gap-2">
											<Avatar>
												<AvatarImage src={s.user.avatarUrl || undefined} />
												<AvatarFallback>
													{(s.user.name || s.user.email || "?")
														.slice(0, 2)
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="font-medium">
													{s.user.name || s.user.email || "Unknown"}
												</span>
												{s.user.email && (
													<span className="text-muted-foreground text-xs">
														{s.user.email}
													</span>
												)}
											</div>
										</div>
									</td>
									<td className="px-4 py-2 tabular-nums">{s.attemptNumber}</td>
									<td className="px-4 py-2">
										<StatusBadge status={s.status} />
									</td>
									<td className="px-4 py-2">
										<ProgressCell
											current={s.currentQuestionOrder}
											total={s.totalQuestions}
										/>
									</td>
									<td className="px-4 py-2 tabular-nums">
										{s.correctAnswers}/{s.totalQuestions} (
										{fmtPercent(correctPct)})
									</td>
									<td className="px-4 py-2 tabular-nums">
										<ScoreCell score={s.totalScore} />
									</td>
									<td className="px-4 py-2">
										<TimeCell timestamp={s.startedAt} />
									</td>
									<td className="px-4 py-2">
										<TimeCell timestamp={s.lastActivity} />
									</td>
									<td className="px-4 py-2">
										<TimeCell durationMs={durationMs} />
									</td>
								</tr>
								{isOpen && (
									<tr className="bg-muted/20">
										<td></td>
										<td className="px-4 pb-4" colSpan={9}>
											<SessionRowExpanded
												sessionId={s._id as Id<"labSessions">}
											/>
										</td>
									</tr>
								)}
							</>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
