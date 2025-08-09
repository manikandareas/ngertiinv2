import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export function QuestionsHeader({
  status,
  message,
  step,
}: {
  status?: "pending" | "completed" | "failed";
  message?: string;
  step?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {status === "pending" && (
          <Badge variant="secondary" className="gap-2">
            <Loader2 className="animate-spin" />
            <span>
              Generating…{step ? ` (step: ${step})` : ""}
            </span>
          </Badge>
        )}
        {status === "completed" && (
          <Badge className="gap-2">
            <CheckCircle2 />
            <span>Questions ready</span>
          </Badge>
        )}
        {status === "failed" && (
          <Badge variant="destructive" className="gap-2">
            <AlertTriangle />
            <span>Generation failed</span>
          </Badge>
        )}
        {!status && (
          <Badge variant="outline">Status: Unknown</Badge>
        )}
      </div>
      {message ? (
        <p className={cn("text-xs text-muted-foreground truncate")}>{message}</p>
      ) : null}
    </div>
  );
}
