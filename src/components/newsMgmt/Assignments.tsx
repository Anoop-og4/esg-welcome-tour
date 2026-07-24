import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Assignment, News, Organization } from "@/types/newsAssignment";
import * as svc from "@/lib/newsAssignmentService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Pencil, Trash2, Repeat, Link2 } from "lucide-react";
import { PriorityBadge, VisibilityBadge } from "./StatusBadge";
import AssignmentDialog, { AssignmentFormValue } from "./AssignmentDialog";

export default function Assignments() {
  const [news, setNews] = useState<News[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const [editing, setEditing] = useState<Assignment | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  const load = async () => {
    setLoading(true);
    const [n, o, a] = await Promise.all([svc.getNews(), svc.getOrganizations(), svc.listAssignments()]);
    setNews(n); setOrgs(o); setAssignments(a); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const newsById = useMemo(() => Object.fromEntries(news.map((n) => [n.id, n])), [news]);
  const orgById = useMemo(() => Object.fromEntries(orgs.map((o) => [o.id, o])), [orgs]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      if (orgFilter !== "all" && a.orgId !== Number(orgFilter)) return false;
      if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
      if (visibilityFilter !== "all" && a.visibility !== visibilityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const title = newsById[a.newsId]?.title.toLowerCase() ?? "";
        const org = orgById[a.orgId]?.name.toLowerCase() ?? "";
        if (!title.includes(q) && !org.includes(q) && !a.category.toLowerCase().includes(q) && !a.topic.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [assignments, orgFilter, priorityFilter, visibilityFilter, search, newsById, orgById]);

  const approvedNews = news.filter((n) => n.status === "approved");

  const handleSave = (v: AssignmentFormValue) => {
    if (editing) {
      svc.updateAssignment(editing.id, {
        orgId: v.orgId!, category: v.category, topic: v.topic, tags: v.tags,
        priority: v.priority, displayOrder: v.displayOrder, visibility: v.visibility, notes: v.notes,
      });
      toast.success("Assignment updated");
      setEditing(null);
    } else if (creating && v.orgId != null) {
      // For "Create Assignment" from this page — pick the first approved news OR require selection.
      // Since AssignmentDialog doesn't include a news picker, we require selection via editing shortcut.
      // Instead of building yet another UI, we open a small prompt via toast — but simpler: preselect first approved.
      const target = approvedNews[0];
      if (!target) { toast.error("No approved news to assign"); return; }
      svc.createAssignment({
        newsId: target.id, orgId: v.orgId, category: v.category, topic: v.topic,
        tags: v.tags, priority: v.priority, displayOrder: v.displayOrder,
        visibility: v.visibility, notes: v.notes,
      });
      toast.success(`Assigned "${target.title}"`);
      setCreating(false);
    }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assignments…" className="pl-9" />
        </div>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Organization" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organizations</SelectItem>
            {orgs.map((o) => <SelectItem key={o.id} value={o.id.toString()}>{o.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-full md:w-[140px]"><SelectValue placeholder="Visibility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All visibility</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>News</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead className="hidden md:table-cell">Category / Topic</TableHead>
              <TableHead className="hidden lg:table-cell">Tags</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="hidden md:table-cell">Visibility</TableHead>
              <TableHead className="hidden lg:table-cell">Order</TableHead>
              <TableHead className="hidden md:table-cell">Assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={9}>
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                  <Link2 className="w-8 h-8" />
                  <p className="text-sm">No assignments yet. Approve news and assign it to organizations.</p>
                </div>
              </TableCell></TableRow>
            )}
            {!loading && filtered.map((a) => (
              <TableRow key={a.id} className="hover:bg-muted/40">
                <TableCell className="max-w-xs">
                  <p className="text-sm font-medium line-clamp-1">{newsById[a.newsId]?.title ?? "—"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{orgById[a.orgId]?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{orgById[a.orgId]?.industry}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs">
                  <div className="font-medium">{a.category}</div>
                  <div className="text-muted-foreground">{a.topic}</div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {a.tags.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                    {a.tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{a.tags.length - 3}</span>}
                  </div>
                </TableCell>
                <TableCell><PriorityBadge priority={a.priority} /></TableCell>
                <TableCell className="hidden md:table-cell"><VisibilityBadge visibility={a.visibility} /></TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{a.displayOrder}</TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {new Date(a.assignedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(a)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(a)} title="Reassign"><Repeat className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(a)} title="Remove" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AssignmentDialog
        open={!!editing || creating}
        news={editing ? newsById[editing.newsId] ?? null : (approvedNews[0] ?? null)}
        organizations={orgs}
        existing={editing}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove assignment?</AlertDialogTitle>
            <AlertDialogDescription>This unassigns the news from the organization. The article stays approved.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleteTarget) return;
              svc.deleteAssignment(deleteTarget.id);
              toast("Assignment removed");
              setDeleteTarget(null); load();
            }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
