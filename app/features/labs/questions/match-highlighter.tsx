import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export type HighlightRange = { start: number; end: number };

function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: HighlightRange[] = [];
  let curr = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const r = sorted[i];
    if (r.start <= curr.end) {
      curr.end = Math.max(curr.end, r.end);
    } else {
      merged.push(curr);
      curr = { ...r };
    }
  }
  merged.push(curr);
  return merged;
}

export function MatchHighlighter({
  text,
  ranges,
  className,
  markClassName,
}: {
  text: string;
  ranges: HighlightRange[];
  className?: string;
  markClassName?: string;
}) {
  const merged = mergeRanges(ranges).filter((r) => r.start < r.end);
  if (merged.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const parts: ReactNode[] = [];
  let last = 0;
  merged.forEach((r, idx) => {
    if (r.start > last) {
      parts.push(
        <span key={`t-${idx}-${last}`}>{text.slice(last, r.start)}</span>,
      );
    }
    parts.push(
      <mark
        key={`m-${idx}-${r.start}`}
        className={cn("bg-yellow-200/70 rounded-sm px-0.5", markClassName)}
      >
        {text.slice(r.start, r.end)}
      </mark>,
    );
    last = r.end;
  });
  if (last < text.length) {
    parts.push(<span key={`t-end-${last}`}>{text.slice(last)}</span>);
  }

  return (
    <span className={cn("[&>mark]:font-medium", className)}>{parts}</span>
  );
}
