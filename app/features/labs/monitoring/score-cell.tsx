export function ScoreCell({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-muted-foreground">-</span>;
  const v = Math.round((score + Number.EPSILON) * 100) / 100;
  return <span className="tabular-nums font-medium">{v.toFixed(2)}</span>;
}
