import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TimeCell } from "~/features/labs/monitoring/time-cell";
import { Button } from "~/components/ui/button";

export function TimePerQuestionCard({
  data,
  onGoQuestions,
}: {
  data: { questionId: string; questionText: string; questionOrder: number; medianMs: number; samples: number }[];
  onGoQuestions?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Time per question</CardTitle>
        {onGoQuestions ? (
          <Button variant="secondary" size="sm" onClick={onGoQuestions}>View questions</Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground border rounded-md p-4">No data in selected window.</div>
        ) : (
          <div className="space-y-2">
            {data.map((r) => (
              <div key={r.questionId} className="flex items-center gap-3">
                <div className="flex-1 min-w-0 text-sm truncate">{r.questionText}</div>
                <div className="w-24 text-right text-xs text-muted-foreground">{r.samples} samples</div>
                <div className="w-24 text-right"><TimeCell durationMs={r.medianMs} /></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
