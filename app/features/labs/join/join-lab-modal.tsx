import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { Button } from "~/components/ui/3d-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { AccessCodeField } from "./access-code-field";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { useNavigate } from "react-router";

function formatRelative(ts?: number | null) {
  if (typeof ts !== "number") return "No deadline";
  const now = Date.now();
  const diff = ts - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return diff >= 0 ? "in <1 min" : "<1 min ago";
  if (mins < 60) return diff >= 0 ? `in ${mins} min` : `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return diff >= 0 ? `in ${hours} h` : `${hours} h ago`;
  const days = Math.round(hours / 24);
  return diff >= 0 ? `in ${days} d` : `${days} d ago`;
}

export type JoinLabModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JoinLabModal({ open, onOpenChange }: JoinLabModalProps) {
  const navigate = useNavigate();

  const [raw, setRaw] = useState("");
  const normalized = useMemo(() => (raw ?? "").replace(/[\s\-_]/g, "").toUpperCase(), [raw]);
  const [submitted, setSubmitted] = useState(false);

  const {
    data: preview,
    isFetching: resolving,
    isError: isResolveError,
    error: resolveError,
    refetch,
  } = useQuery({
    /* biome-ignore lint/suspicious/noExplicitAny: Generated types may lag behind new functions */
    ...convexQuery(((api as any).labs.queries.resolveByAccessCode), { code: normalized }),
    enabled: open && submitted && normalized.length >= 4,
    retry: false,
  });

  useEffect(() => {
    if (!open) {
      // reset on close
      setRaw("");
      setSubmitted(false);
    }
  }, [open]);

  const { mutate: startOrResume, isPending: starting } = useMutation<
    { sessionId: string; labId: string },
    Error,
    { code: string }
  >({
    // Cast to any to avoid TS error until Convex typegen picks up new mutation file
    mutationFn: useConvexMutation((api as any).labSessions.mutations.startOrResumeWithCode),
    onSuccess: (res) => {
      onOpenChange(false);
      navigate(`/labs/${res.labId}/t/session/${res.sessionId}`);
    },
  });

  const onSubmitCode = () => {
    setSubmitted(true);
    if (!resolving) refetch();
  };

  const hasInProgress = !!preview?.hasInProgress;
  const canStartNew = !!preview?.canStartNew;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join via Access Code</DialogTitle>
          <DialogDescription>Enter the code provided by your teacher to start or resume a lab.</DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-4">
            <AccessCodeField
              autoFocus
              value={raw}
              onChange={(v) => setRaw(v)}
              onEnter={onSubmitCode}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onSubmitCode} disabled={normalized.length < 4}>
                Continue
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {resolving ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Resolving code...
              </div>
            ) : isResolveError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {(resolveError as Error)?.message || "Kode tidak valid atau sudah tidak aktif"}
              </div>
            ) : preview ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-base font-semibold">{preview.lab.title}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="size-5">
                      <AvatarImage src={preview.teacher.avatarUrl} />
                      <AvatarFallback>T</AvatarFallback>
                    </Avatar>
                    <span>{preview.teacher.name || "Teacher"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">End Time</div>
                    <div className="text-sm">
                      {typeof preview.lab.endTime === "number" ? (
                        <>
                          <span title={new Date(preview.lab.endTime).toLocaleString()}>
                            {formatRelative(preview.lab.endTime)}
                          </span>
                          <span className="text-muted-foreground"> · {new Date(preview.lab.endTime).toLocaleString()}</span>
                        </>
                      ) : (
                        "No deadline"
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Attempts</div>
                    <div className="text-sm">
                      {preview.attemptsUsed} / {preview.lab.maxAttempts} used
                      <span className="text-muted-foreground"> · {preview.attemptsLeft} left</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-3 text-sm">
                  {hasInProgress ? (
                    <div className="text-emerald-700">Unfinished attempt available</div>
                  ) : canStartNew ? (
                    <div className="text-foreground">You can start a new attempt</div>
                  ) : typeof preview.lab.endTime === "number" && Date.now() > (preview.lab.endTime ?? 0) ? (
                    <div className="text-destructive">End time passed</div>
                  ) : (
                    <div className="text-destructive">Attempts exhausted</div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={hasInProgress ? "default" : "secondary"}
                      disabled={!hasInProgress}
                      onClick={() => startOrResume({ code: normalized })}
                    >
                      <RotateCcw className="mr-1 size-4" /> Resume
                    </Button>
                    <Button
                      variant="ai"
                      disabled={!canStartNew}
                      onClick={() => startOrResume({ code: normalized })}
                    >
                      {starting ? (
                        <>
                          <Loader2 className="mr-1 size-4 animate-spin" /> Starting...
                        </>
                      ) : (
                        <>
                          <Play className="mr-1 size-4" /> Start New
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            ) : null}

            {!resolving && (
              <div className="text-xs text-muted-foreground">Code: {normalized}</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default JoinLabModal;
