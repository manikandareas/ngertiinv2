import React from "react";
import { Card } from "~/components/ui/card";

export function QuestionView({ order, text }: { order: number; text: string }) {
  return (
    <Card className="p-6">
      <div className="text-sm text-muted-foreground mb-2">Question {order + 1}</div>
      <div className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </Card>
  );
}
