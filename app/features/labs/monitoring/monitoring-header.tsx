import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

import type { SummaryKPI } from "./monitoring-tab";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}

export function MonitoringHeader({ summary }: { summary: SummaryKPI | undefined }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="h-24 animate-pulse" />
        <Card className="h-24 animate-pulse" />
        <Card className="h-24 animate-pulse" />
        <Card className="h-24 animate-pulse" />
      </div>
    );
  }

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const fmt = (n: number | null) => (n == null ? "-" : Math.round(n).toString());

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Active" value={`${summary.active}`} />
      <Stat label="Completed" value={`${summary.completed}`} />
      <Stat label="Completion rate" value={pct(summary.completionRate)} />
      <Stat label="Avg score" value={fmt(summary.avgScore)} />
    </div>
  );
}
