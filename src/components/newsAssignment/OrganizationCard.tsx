import type { Organization } from "@/types/newsAssignment";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  organization: Organization;
  assignedCount: number;
  selected: boolean;
  onSelect: (id: number) => void;
}

export default function OrganizationCard({ organization, assignedCount, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(organization.id)}
      className={cn(
        "w-full text-left rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border/60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{organization.name}</p>
          <p className="text-xs text-muted-foreground truncate">{organization.industry}</p>
        </div>
        <Badge variant="secondary" className="text-[10px] font-semibold">
          {assignedCount}
        </Badge>
      </div>
    </button>
  );
}
