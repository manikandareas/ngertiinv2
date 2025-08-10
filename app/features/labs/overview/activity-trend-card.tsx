import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

function makePath(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function ActivityTrendCard({
  data,
}: {
  data: { date: string; sessionsStarted: number; sessionsCompleted: number; activeTouches: number }[];
}) {
  const width = 600;
  const height = 120;
  const started = data.map((d) => d.sessionsStarted);
  const completed = data.map((d) => d.sessionsCompleted);
  const active = data.map((d) => d.activeTouches);
  const titleId = "activity-trend-title";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity trend</CardTitle>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <div className="text-sm text-muted-foreground border rounded-md p-4">No activity in selected window.</div>
        ) : (
          <div className="space-y-2">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-32"
              role="img"
              aria-labelledby={titleId}
            >
              <title id={titleId}>
                Activity trend: Active touches (blue), Started (green), Completed (amber)
              </title>
              <path d={makePath(active, width, height)} stroke="#3b82f6" strokeWidth={2} fill="none" />
              <path d={makePath(started, width, height)} stroke="#10b981" strokeWidth={2} fill="none" />
              <path d={makePath(completed, width, height)} stroke="#f59e0b" strokeWidth={2} fill="none" />
            </svg>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-0.5 bg-blue-500" /> Active touches</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-0.5 bg-emerald-500" /> Started</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-0.5 bg-amber-500" /> Completed</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
