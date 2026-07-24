import { Badge } from "@/components/ui/badge";
import type { NewsStatus, Priority, Visibility } from "@/types/newsAssignment";
import { cn } from "@/lib/utils";

const statusStyles: Record<NewsStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-600 border-red-500/30",
};

export function StatusBadge({ status }: { status: NewsStatus }) {
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold border capitalize", statusStyles[status])}>
      {status}
    </Badge>
  );
}

const priorityStyles: Record<Priority, string> = {
  low: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  medium: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  high: "bg-rose-500/15 text-rose-600 border-rose-500/30",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold border capitalize", priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}

const visibilityStyles: Record<Visibility, string> = {
  public: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  internal: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  hidden: "bg-muted text-muted-foreground border-border",
};

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold border capitalize", visibilityStyles[visibility])}>
      {visibility}
    </Badge>
  );
}
