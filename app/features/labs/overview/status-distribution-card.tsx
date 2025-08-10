import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { StatusBadge } from "~/features/labs/monitoring/status-badge";

export function StatusDistributionCard({
  data,
}: {
  data?: {
    in_progress: number;
    completed: number;
    timeout: number;
    abandoned: number;
  } | null;
}) {
  const total = (data?.in_progress ?? 0) + (data?.completed ?? 0) + (data?.timeout ?? 0) + (data?.abandoned ?? 0);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {!total ? (
          <div className="text-sm text-muted-foreground border rounded-md p-4">No sessions in selected window.</div>
        ) : (
          <div className="space-y-3">
            {([
              ["in_progress", data?.in_progress ?? 0],
              ["completed", data?.completed ?? 0],
              ["timeout", data?.timeout ?? 0],
              ["abandoned", data?.abandoned ?? 0],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <div className="w-28 shrink-0"><StatusBadge status={k} /></div>
                <div className="flex-1 h-2 bg-muted rounded">
                  <div className="h-2 bg-primary rounded" style={{ width: `${pct(v)}%` }} />
                </div>
                <div className="w-14 text-right text-sm tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
