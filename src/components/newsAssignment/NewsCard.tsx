import { Badge } from "@/components/ui/badge";
import type { News, Organization } from "@/types/newsAssignment";
import { Calendar, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

const pillarStyles: Record<string, string> = {
  ESG: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  "Green Energy": "bg-lime-500/15 text-lime-500 border-lime-500/30",
  "Green Tech": "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
  "Electric Mobility": "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "Policy & Regulation": "bg-amber-500/15 text-amber-500 border-amber-500/30",
  "Green Finance & Markets": "bg-violet-500/15 text-violet-500 border-violet-500/30",
};

interface Props {
  news: News;
  organization?: Organization;
  selected: boolean;
  onSelect: (id: number) => void;
}

export default function NewsCard({ news, organization, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(news.id)}
      className={cn(
        "w-full text-left rounded-xl border bg-card p-4 transition-all",
        "hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5",
        selected ? "border-primary ring-2 ring-primary/30 shadow-lg" : "border-border/60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground leading-snug flex-1">{news.title}</h3>
        <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
          <Signal className="w-3 h-3" />
          <span className="font-medium">{news.relevance}/5</span>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{news.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn("text-[10px] font-medium border", pillarStyles[news.pillar])}>
          {news.pillar}
        </Badge>
        <span className="text-[11px] text-muted-foreground font-medium">{news.source}</span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(news.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        {organization && (
          <Badge className="ml-auto bg-emerald-500/15 text-emerald-600 border-emerald-500/30 border text-[10px] font-semibold">
            Assigned to {organization.name}
          </Badge>
        )}
      </div>
    </button>
  );
}
