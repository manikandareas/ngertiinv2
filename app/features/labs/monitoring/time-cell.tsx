function fmtDuration(ms: number) {
  if (ms < 0 || !Number.isFinite(ms)) return "-";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [] as string[];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return parts.join(" ");
}

function fmtRelative(ts: number) {
  const now = Date.now();
  const diff = Math.max(0, now - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function TimeCell({
  timestamp,
  durationMs,
}: {
  timestamp?: number;
  durationMs?: number;
}) {
  if (typeof durationMs === "number") {
    return <span className="tabular-nums">{fmtDuration(durationMs)}</span>;
  }
  if (typeof timestamp === "number") {
    const absolute = new Date(timestamp).toLocaleString();
    return (
      <span title={absolute} className="tabular-nums">
        {fmtRelative(timestamp)}
      </span>
    );
  }
  return <span className="text-muted-foreground">-</span>;
}
