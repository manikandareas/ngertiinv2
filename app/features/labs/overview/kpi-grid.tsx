import { Card, CardContent } from "~/components/ui/card";

export function KpiGrid({
  data,
}: {
  data?: {
    participants: number;
    activeNow: number;
    completed: number;
    completionRate: number;
    avgScore: number | null;
    avgAccuracy: number | null;
    totalQuestions: number;
  } | null;
}) {
  const fmtPct = (n: number | null | undefined) =>
    typeof n === "number" ? `${(n * 100).toFixed(0)}%` : "-";
  const fmtNum = (n: number | null | undefined) =>
    typeof n === "number" ? n.toLocaleString() : "-";
  const fmtScore = (n: number | null | undefined) =>
    typeof n === "number" ? n.toFixed(2) : "-";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Participants</div>
          <div className="text-2xl font-semibold">{fmtNum(data?.participants)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Active now</div>
          <div className="text-2xl font-semibold">{fmtNum(data?.activeNow)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Completed</div>
          <div className="text-2xl font-semibold">{fmtNum(data?.completed)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Completion rate</div>
          <div className="text-2xl font-semibold">{fmtPct(data?.completionRate)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Avg score</div>
          <div className="text-2xl font-semibold">{fmtScore(data?.avgScore)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Avg accuracy</div>
          <div className="text-2xl font-semibold">{fmtPct(data?.avgAccuracy)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
