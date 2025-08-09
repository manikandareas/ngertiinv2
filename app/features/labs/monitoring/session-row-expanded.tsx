import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { CheckCircle2, XCircle } from "lucide-react";

export function SessionRowExpanded({
  sessionId,
}: {
  sessionId: Id<"labSessions">;
}) {
  const { data, isPending, isError } = useQuery(
    convexQuery(api.userAnswers.queries.getBySession, { sessionId }),
  );

  if (isPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading answers…</div>
    );
  }
  if (isError || !data) {
    return (
      <div className="text-sm text-destructive">Failed to load answers.</div>
    );
  }

  const answers = data.answers ?? [];
  if (!answers.length) {
    return (
      <div className="text-sm text-muted-foreground">No answers yet.</div>
    );
  }

  return (
    <div className="space-y-3">
      {answers.map((a) => {
        const q = a.question;
        const sel = a.selectedOption;
        const correct = sel?.isCorrect;
        return (
          <div key={a._id as unknown as string} className="p-3 rounded-md border bg-background">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Question {q?.questionOrder ?? "-"}
                </div>
                <div className="font-medium leading-snug">
                  {q?.questionText ?? "(Question deleted)"}
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Selected:</span>{" "}
                  <span>{sel?.optionText ?? "(No selection)"}</span>
                </div>
              </div>
              <div className="shrink-0">
                {correct ? (
                  <div className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="size-4" /> Correct
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 text-red-600">
                    <XCircle className="size-4" /> Incorrect
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
