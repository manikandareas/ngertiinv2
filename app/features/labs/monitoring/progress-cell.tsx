export function ProgressCell({ current, total }: { current: number; total: number }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div className="min-w-40">
      <div className="h-2 w-full rounded-full bg-accent">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-muted-foreground tabular-nums">
        {current}/{total} ({pct}%)
      </div>
    </div>
  );
}
