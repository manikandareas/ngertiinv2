import { Button } from "~/components/ui/button";

export function ReviewPanel({
  total,
  answeredOrders,
  activeOrder,
  onJump,
  unansweredOrders,
  orders,
  disabled,
}: {
  total: number;
  answeredOrders: number[];
  activeOrder: number;
  onJump: (order: number) => void;
  unansweredOrders?: number[];
  orders?: number[];
  disabled?: boolean;
}) {
  const answeredSet = new Set(answeredOrders);
  const unansweredSet = new Set(unansweredOrders ?? []);
  const orderList: number[] = orders ?? Array.from({ length: total }, (_, i) => i);
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {orderList.map((ord) => {
        const isActive = ord === activeOrder;
        const isAnswered = answeredSet.has(ord);
        const isUnanswered = unansweredSet.has(ord);
        return (
          <Button
            key={String(ord)}
            variant={
              isActive ? "default" : isAnswered ? "secondary" : "outline"
            }
            size="sm"
            className={isUnanswered && !isActive ? "ring-1 ring-amber-400" : undefined}
            disabled={disabled}
            onClick={() => onJump(ord)}
          >
            {ord + 1}
          </Button>
        );
      })}
    </div>
  );
}
