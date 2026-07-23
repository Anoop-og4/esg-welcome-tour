import { useState, useMemo } from "react";
import type { News, Organization } from "@/types/newsAssignment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send } from "lucide-react";
import OrganizationCard from "./OrganizationCard";
import AssignedNewsList from "./AssignedNewsList";

interface Props {
  organizations: Organization[];
  news: News[];
  selectedNewsId: number | null;
  selectedOrgId: number | null;
  onSelectOrg: (id: number) => void;
  onAssign: () => void;
  onRemove: (newsId: number) => void;
}

export default function AssignmentPanel({
  organizations, news, selectedNewsId, selectedOrgId, onSelectOrg, onAssign, onRemove,
}: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => organizations.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()) || o.industry.toLowerCase().includes(q.toLowerCase())),
    [organizations, q]
  );
  const counts = useMemo(() => {
    const m: Record<number, number> = {};
    news.forEach((n) => { if (n.assignedTo != null) m[n.assignedTo] = (m[n.assignedTo] || 0) + 1; });
    return m;
  }, [news]);

  const canAssign = selectedNewsId != null && selectedOrgId != null;

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">Organizations</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search organizations…" className="pl-9 h-9" />
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 -mr-1" style={{ maxHeight: 320 }}>
        {filtered.map((o) => (
          <OrganizationCard
            key={o.id}
            organization={o}
            assignedCount={counts[o.id] || 0}
            selected={selectedOrgId === o.id}
            onSelect={onSelectOrg}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No organizations match.</p>
        )}
      </div>

      <Button onClick={onAssign} disabled={!canAssign} className="w-full h-10 gap-2">
        <Send className="w-4 h-4" />
        {canAssign ? "Assign selected news" : "Select news + organization"}
      </Button>

      <div className="pt-3 border-t border-border/60">
        <h3 className="text-sm font-semibold text-foreground mb-2">Assigned News</h3>
        <AssignedNewsList news={news} organizations={organizations} onRemove={onRemove} />
      </div>
    </div>
  );
}
