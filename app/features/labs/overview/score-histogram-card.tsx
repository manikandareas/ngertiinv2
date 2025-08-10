import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function ScoreHistogramCard({
	data,
}: {
	data?: {
		bucketSize: number;
		buckets: { from: number; to: number; count: number }[];
	} | null;
}) {
	const max = Math.max(1, ...(data?.buckets?.map((b) => b.count) ?? [0]));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Score distribution</CardTitle>
			</CardHeader>
			<CardContent>
				{!data || data.buckets.length === 0 ? (
					<div className="text-sm text-muted-foreground border rounded-md p-4">
						No completed sessions in selected window.
					</div>
				) : (
					<div className="flex items-end gap-1 h-32">
						{data.buckets.map((b, i) => (
							<div key={i.toString()} className="flex-1">
								<div
									className="bg-primary/80 rounded-t"
									style={{ height: `${(b.count / max) * 100}%` }}
									title={`${b.from}-${b.to}: ${b.count}`}
								/>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
