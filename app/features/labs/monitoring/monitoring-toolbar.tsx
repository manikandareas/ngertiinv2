import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { SessionStatus } from "./monitoring-tab";

const ALL_STATUSES: SessionStatus[] = [
	"in_progress",
	"completed",
	"timeout",
	"abandoned",
];

function labelFor(status: SessionStatus) {
	switch (status) {
		case "in_progress":
			return "In progress";
		case "completed":
			return "Completed";
		case "timeout":
			return "Timeout";
		case "abandoned":
			return "Abandoned";
	}
}

export function MonitoringToolbar({
	q,
	onQChange,
	statuses,
	onStatusesChange,
	sort,
	onSortChange,
}: {
	q: string;
	onQChange: (v: string) => void;
	statuses: SessionStatus[];
	onStatusesChange: (v: string[]) => void;
	sort: "last" | "started" | "score";
	onSortChange: (v: "last" | "started" | "score") => void;
}) {
	const toggleStatus = (s: SessionStatus) => {
		const set = new Set(statuses);
		if (set.has(s)) set.delete(s);
		else set.add(s);
		onStatusesChange(Array.from(set));
	};

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				<Input
					value={q}
					onChange={(e) => onQChange(e.target.value)}
					placeholder="Search user (name or email)"
					className="w-72"
				/>
				<div className="flex items-center gap-3">
					{ALL_STATUSES.map((s) => (
						<label
							htmlFor={s}
							key={s}
							className="flex items-center gap-1.5 text-sm"
						>
							<Checkbox
								id={s}
								checked={statuses.includes(s)}
								onCheckedChange={() => toggleStatus(s)}
								aria-label={labelFor(s)}
							/>
							<span className="text-muted-foreground">{labelFor(s)}</span>
						</label>
					))}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Sort by</span>
				<Select
          value={sort}
          onValueChange={(v) => onSortChange(v as "last" | "started" | "score")}
        >
					<SelectTrigger className="w-44">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="last">Last activity (desc)</SelectItem>
						<SelectItem value="started">Started (desc)</SelectItem>
						<SelectItem value="score">Score (desc)</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
