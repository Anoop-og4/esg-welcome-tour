import type { News } from "@/types/newsAssignment";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { Calendar, Signal } from "lucide-react";

interface Props {
  news: News | null;
  onClose: () => void;
}

export default function PreviewDrawer({ news, onClose }: Props) {
  return (
    <Sheet open={!!news} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {news && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={news.status} />
                <Badge variant="outline" className="text-[10px]">{news.pillar}</Badge>
                {news.category && <Badge variant="secondary" className="text-[10px]">{news.category}</Badge>}
              </div>
              <SheetTitle className="text-left leading-snug">{news.title}</SheetTitle>
              <SheetDescription className="text-left flex items-center gap-3 text-xs">
                <span className="font-medium">{news.source}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                  {new Date(news.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1"><Signal className="w-3 h-3" />{news.relevance}/5</span>
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Summary</p>
                <p className="text-foreground leading-relaxed">{news.summary}</p>
              </div>
              <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
                Full article preview would render here from the source API.
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
