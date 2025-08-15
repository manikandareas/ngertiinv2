import React from "react";
import { Badge } from "~/components/ui/badge";

export function SessionHeader({
  title,
  attemptNumber,
  answered,
  total,
}: {
  title: string;
  attemptNumber: number;
  answered: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="secondary">Attempt #{attemptNumber}</Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        Answered {answered} / {total}
      </div>
    </div>
  );
}
