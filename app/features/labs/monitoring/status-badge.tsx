import { Badge } from "~/components/ui/badge";
import type { SessionStatus } from "./monitoring-tab";

const label: Record<SessionStatus, string> = {
  in_progress: "In progress",
  completed: "Completed",
  timeout: "Timeout",
  abandoned: "Abandoned",
};

const styles: Record<SessionStatus, string> = {
  in_progress:
    "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-800",
  completed:
    "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-800",
  timeout:
    "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-300 dark:border-amber-800",
  abandoned:
    "bg-gray-500/10 text-gray-700 border-gray-200 dark:text-gray-300 dark:border-gray-800",
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  return <Badge className={styles[status]}>{label[status]}</Badge>;
}
