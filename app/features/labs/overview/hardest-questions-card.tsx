import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function HardestQuestionsCard({
  data,
}: {
  data: { questionId: string; questionText: string; questionOrder: number; accuracy: number; attempts: number; corrects: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hardest questions</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground border rounded-md p-4">No data in selected window.</div>
        ) : (
          <div className="space-y-3">
            {data.map((q) => (
              <div key={q.questionId} className="space-y-1">
                <div className="text-sm font-medium line-clamp-2">{q.questionText}</div>
                <div className="text-xs text-muted-foreground">Accuracy {(q.accuracy * 100).toFixed(0)}% · {q.attempts} attempts</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
