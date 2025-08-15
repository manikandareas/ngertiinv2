import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

type ResultItem = {
  question: {
    _id: Id<"questions">;
    questionOrder: number;
    questionText: string;
    explanation?: string | null;
  };
  selectedOption?: {
    _id: Id<"questionOptions">;
    optionText: string;
  } | null;
  isCorrect: boolean;
};

export function ResultPage({ sessionId }: { sessionId: Id<"labSessions"> }) {
  const rq = convexQuery(api.sessions.queries.getResultBundle, { sessionId });
  const { data, isPending, isError, error } = useQuery(rq);

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-48 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <Card className="p-8">
          <p className="text-red-600 font-medium">
            {(error as Error)?.message ?? "Failed to load result"}
          </p>
          <div className="mt-4">
            <Button asChild>
              <a href="/labs">Back to Labs</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const score = data.metrics.score;
  const correct = data.metrics.correctAnswers;
  const total = data.metrics.totalQuestions;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{data.lab.name}</h2>
        <div className="text-sm text-muted-foreground">
          Score: <span className="font-medium">{score}%</span> ({correct}/{total})
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-3">Summary</h3>
        <div className="grid gap-3">
          {data.items.map((it: ResultItem) => (
            <div
              key={it.question._id}
              className="rounded border p-3 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Question {it.question.questionOrder + 1}
                </div>
                <div
                  className={
                    it.isCorrect ? "text-emerald-600" : "text-red-600"
                  }
                >
                  {it.isCorrect ? "Correct" : "Incorrect"}
                </div>
              </div>
              <div className="font-medium">{it.question.questionText}</div>
              {it.selectedOption ? (
                <div className="text-sm">
                  Your answer: {it.selectedOption.optionText}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No answer</div>
              )}
              {it.question.explanation ? (
                <div className="text-xs text-muted-foreground mt-1">
                  Explanation: {it.question.explanation}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button asChild>
            <a href="/labs">Back to Labs</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
