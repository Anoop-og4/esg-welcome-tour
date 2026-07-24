import { useEffect, useMemo, useState } from "react";
import type { News, Organization, Assignment, ActivityEvent } from "@/types/newsAssignment";
import * as svc from "@/lib/newsAssignmentService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  Newspaper, CheckCircle2, XCircle, Clock, Building2, Link2, Layers, Activity,
} from "lucide-react";

interface KPI { label: string; value: number; icon: typeof Newspaper; tint: string; }

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(38 92% 55%)",
  approved: "hsl(160 84% 39%)",
  rejected: "hsl(0 84% 60%)",
};

export default function NewsDashboard() {
  const [news, setNews] = useState<News[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [n, o, a, e] = await Promise.all([svc.getNews(), svc.getOrganizations(), svc.listAssignments(), svc.getActivity()]);
      setNews(n); setOrgs(o); setAssignments(a); setActivity(e); setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const assignedIds = new Set(assignments.map((a) => a.newsId));
    return {
      total: news.length,
      pending: news.filter((n) => n.status === "pending").length,
      approved: news.filter((n) => n.status === "approved").length,
      rejected: news.filter((n) => n.status === "rejected").length,
      assigned: assignedIds.size,
      unassigned: news.filter((n) => n.status === "approved" && !assignedIds.has(n.id)).length,
      orgs: orgs.length,
      assignments: assignments.length,
    };
  }, [news, orgs, assignments]);

  const kpis: KPI[] = [
    { label: "Total News", value: stats.total, icon: Newspaper, tint: "hsl(217 91% 60%)" },
    { label: "Pending", value: stats.pending, icon: Clock, tint: "hsl(38 92% 55%)" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, tint: "hsl(160 84% 39%)" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, tint: "hsl(0 84% 60%)" },
    { label: "Assigned", value: stats.assigned, icon: Link2, tint: "hsl(280 65% 60%)" },
    { label: "Unassigned", value: stats.unassigned, icon: Layers, tint: "hsl(200 70% 50%)" },
    { label: "Organizations", value: stats.orgs, icon: Building2, tint: "hsl(340 75% 55%)" },
    { label: "Assignments", value: stats.assignments, icon: Activity, tint: "hsl(160 60% 45%)" },
  ];

  const perOrg = useMemo(() => {
    const m = new Map<number, number>();
    assignments.forEach((a) => m.set(a.orgId, (m.get(a.orgId) ?? 0) + 1));
    return orgs.map((o) => ({ name: o.name, count: m.get(o.id) ?? 0 })).sort((a, b) => b.count - a.count);
  }, [assignments, orgs]);

  const byStatus = [
    { name: "Pending", value: stats.pending, key: "pending" },
    { name: "Approved", value: stats.approved, key: "approved" },
    { name: "Rejected", value: stats.rejected, key: "rejected" },
  ].filter((s) => s.value > 0);

  const overTime = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ date: iso.slice(5), count: news.filter((n) => n.createdAt.slice(0, 10) === iso).length });
    }
    return days;
  }, [news]);

  const categories = useMemo(() => {
    const m = new Map<string, number>();
    news.forEach((n) => { const c = n.category ?? "Uncategorized"; m.set(c, (m.get(c) ?? 0) + 1); });
    return Array.from(m.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [news]);

  const orgById = useMemo(() => Object.fromEntries(orgs.map((o) => [o.id, o])), [orgs]);
  const newsById = useMemo(() => Object.fromEntries(news.map((n) => [n.id, n])), [news]);
  const recent = assignments.slice().sort((a, b) => +new Date(b.assignedAt) - +new Date(a.assignedAt)).slice(0, 8);

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>;
  }

  return (
    <div className="space-y-5">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${k.tint}20`, color: k.tint }}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">News per Organization</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perOrg} margin={{ left: -10, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">News by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byStatus.map((s) => <Cell key={s.key} fill={STATUS_COLORS[s.key]} />)}
              </Pie>
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">News ingestion (last 14 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={overTime} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Top Categories</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categories} layout="vertical" margin={{ left: 10, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <RTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(280 65% 60%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Assignments</h3>
          {recent.length === 0 && <p className="text-xs text-muted-foreground py-6 text-center">No assignments yet.</p>}
          <div className="space-y-2">
            {recent.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Link2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium line-clamp-1">{newsById[a.newsId]?.title ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    → {orgById[a.orgId]?.name} · <span className="capitalize">{a.priority}</span> · {new Date(a.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">{a.category}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Latest Activity</h3>
          {activity.length === 0 && <p className="text-xs text-muted-foreground py-6 text-center">No activity yet.</p>}
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {activity.slice(0, 15).map((e) => (
              <div key={e.id} className="flex items-start gap-3 py-1.5 border-b border-border/40 last:border-0">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{
                  backgroundColor:
                    e.type === "approved" ? "hsl(160 84% 39%)" :
                    e.type === "rejected" || e.type === "deleted" ? "hsl(0 84% 60%)" :
                    e.type === "assigned" ? "hsl(217 91% 60%)" :
                    "hsl(38 92% 55%)"
                }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground line-clamp-1">{e.message}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(e.at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
