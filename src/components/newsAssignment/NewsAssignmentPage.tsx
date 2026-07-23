import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { News, Organization } from "@/types/newsAssignment";
import { getNews, getOrganizations, assignNews, removeAssignment } from "@/lib/newsAssignmentService";
import StatsCards from "./StatsCards";
import NewsFilters, { type PillarFilter, type SortMode } from "./NewsFilters";
import NewsCard from "./NewsCard";
import AssignmentPanel from "./AssignmentPanel";
import { Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsAssignmentPage() {
  const [news, setNews] = useState<News[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pillar, setPillar] = useState<PillarFilter>("All");
  const [sort, setSort] = useState<SortMode>("newest");

  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getNews(), getOrganizations()]).then(([n, o]) => {
      if (!alive) return;
      setNews(n); setOrgs(o); setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const orgById = useMemo(() => Object.fromEntries(orgs.map((o) => [o.id, o])), [orgs]);

  const filtered = useMemo(() => {
    let list = news.filter((n) => {
      if (pillar !== "All" && n.pillar !== pillar) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "newest"
        ? +new Date(b.published) - +new Date(a.published)
        : b.relevance - a.relevance
    );
    return list;
  }, [news, pillar, search, sort]);

  const assignedCount = news.filter((n) => n.assignedTo != null).length;

  const handleAssign = () => {
    if (selectedNewsId == null || selectedOrgId == null) return;
    setNews((prev) => assignNews(prev, selectedNewsId, selectedOrgId));
    const org = orgById[selectedOrgId];
    toast.success(`Assigned to ${org?.name}`);
    setSelectedNewsId(null);
  };

  const handleRemove = (newsId: number) => {
    setNews((prev) => removeAssignment(prev, newsId));
    toast("Assignment removed");
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-background">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">News Assignment</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Review AI-curated ESG news and route each story to the right organization.
            </p>
          </div>
        </div>

        <StatsCards
          total={news.length}
          assigned={assignedCount}
          unassigned={news.length - assignedCount}
          organizations={orgs.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-5">
          {/* Left — News feed */}
          <div className="min-w-0 space-y-3">
            <NewsFilters
              search={search} onSearch={setSearch}
              pillar={pillar} onPillarChange={setPillar}
              sort={sort} onSortChange={setSort}
            />
            <div className="space-y-3">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[110px] w-full rounded-xl" />
              ))}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-16 border border-dashed rounded-xl text-sm text-muted-foreground">
                  No news matches these filters.
                </div>
              )}
              {!loading && filtered.map((n) => (
                <NewsCard
                  key={n.id}
                  news={n}
                  organization={n.assignedTo ? orgById[n.assignedTo] : undefined}
                  selected={selectedNewsId === n.id}
                  onSelect={(id) => setSelectedNewsId((prev) => (prev === id ? null : id))}
                />
              ))}
            </div>
          </div>

          {/* Right — Assignment panel */}
          <div className="lg:sticky lg:top-4 self-start rounded-xl border border-border/60 bg-card p-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <AssignmentPanel
                organizations={orgs}
                news={news}
                selectedNewsId={selectedNewsId}
                selectedOrgId={selectedOrgId}
                onSelectOrg={(id) => setSelectedOrgId((prev) => (prev === id ? null : id))}
                onAssign={handleAssign}
                onRemove={handleRemove}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
