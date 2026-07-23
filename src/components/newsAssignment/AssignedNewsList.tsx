import type { News, Organization } from "@/types/newsAssignment";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  news: News[];
  organizations: Organization[];
  onRemove: (newsId: number) => void;
}

export default function AssignedNewsList({ news, organizations, onRemove }: Props) {
  const grouped = organizations
    .map((org) => ({ org, items: news.filter((n) => n.assignedTo === org.id) }))
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
        No news assigned yet. Select a news card, then pick an organization.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map(({ org, items }) => (
        <div key={org.id}>
          <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-2">
            {org.name}
            <span className="text-[10px] font-medium text-muted-foreground">({items.length})</span>
          </p>
          <div className="space-y-1.5">
            {items.map((n) => (
              <div key={n.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors group">
                <p className="text-xs text-foreground flex-1 line-clamp-2">{n.title}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 shrink-0 opacity-60 group-hover:opacity-100"
                  onClick={() => onRemove(n.id)}
                  title="Remove assignment"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
