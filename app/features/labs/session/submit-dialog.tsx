import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

export function SubmitDialog({
  open,
  onOpenChange,
  unansweredOrders,
  onConfirmSubmit,
  onGoto,
  disabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unansweredOrders: number[];
  onConfirmSubmit: () => void;
  onGoto: (order: number) => void;
  disabled?: boolean;
}) {
  const hasUnanswered = unansweredOrders.length > 0;
  const firstUnanswered = hasUnanswered ? unansweredOrders[0] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit this attempt?</DialogTitle>
          <DialogDescription>
            Once submitted, you cannot change your answers.
          </DialogDescription>
        </DialogHeader>
        {hasUnanswered ? (
          <div className="space-y-2">
            <p className="text-sm">
              You have <span className="font-medium">{unansweredOrders.length}</span>{" "}
              unanswered question{unansweredOrders.length > 1 ? "s" : ""}.
            </p>
            <div className="text-sm text-muted-foreground">
              Unanswered: {unansweredOrders.map((n) => `#${n + 1}`).join(", ")}
            </div>
          </div>
        ) : (
          <p className="text-sm">All questions have been answered.</p>
        )}
        <DialogFooter>
          {hasUnanswered ? (
            <Button
              variant="secondary"
              onClick={() => {
                if (firstUnanswered != null) onGoto(firstUnanswered);
                onOpenChange(false);
              }}
              disabled={disabled}
            >
              Go to first unanswered
            </Button>
          ) : null}
          <Button onClick={onConfirmSubmit} disabled={disabled}>
            {hasUnanswered ? "Submit anyway" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
