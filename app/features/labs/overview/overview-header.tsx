import type { Doc } from "convex/_generated/dataModel";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function OverviewHeader({
	lab,
	generationStatus,
	windowDays,
	onWindowChange,
}: {
	lab?: Doc<"labs">;
	generationStatus?: string;
	windowDays: number;
	onWindowChange: (val: 7 | 30) => void;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-base md:text-lg">
					{lab?.name ?? "Lab"}
				</CardTitle>
				{generationStatus ? (
					<Badge variant="secondary" className="text-xs">
						Gen: {generationStatus}
					</Badge>
				) : null}
			</CardHeader>
			<CardContent className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">{lab?.description}</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant={windowDays === 7 ? "default" : "secondary"}
						onClick={() => onWindowChange(7)}
					>
						7D
					</Button>
					<Button
						size="sm"
						variant={windowDays === 30 ? "default" : "secondary"}
						onClick={() => onWindowChange(30)}
					>
						30D
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
