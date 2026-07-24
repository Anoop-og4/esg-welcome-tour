import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { News, Organization, Assignment } from "@/types/newsAssignment";
import * as svc from "@/lib/newsAssignmentService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Pencil, Trash2, Link2, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import EditNewsDialog from "./EditNewsDialog";
import AssignmentDialog, { AssignmentFormValue } from "./AssignmentDialog";

export default function ApprovedNews() {
  const [news, setNews] = useState<News[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<News | null>(null);
  const [assigning, setAssigning] = useState<News | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);

  const load = async () => {
    setLoading(true);
    const [n, o, a] = await Promise.all([svc.getNews(), svc.getOrganizations(), svc.listAssignments()]);
    setNews(n.filter((x) => x.status === "approved"));
    setOrgs(o); setAssignments(a); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    news.filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase())),
    [news, search]);

  const asgCount = (nid: number) => assignments.filter((a) => a.newsId === nid).length;

  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected((s) => s.size === filtered.length ? new Set() : new Set(filtered.map((n) => n.id)));

  const doDelete = (n: News) => { svc.deleteNews(n.id); toast("Deleted"); setDeleteTarget(null); setSelected(new Set()); load(); };
  const bulkDelete = () => { selected.forEach((id) => svc.deleteNews(id)); toast(`Deleted ${selected.size} articles`); setSelected(new Set()); load(); };

  const handleAssignSave = (v: AssignmentFormValue) => {
    if (!assigning || v.orgId == null) return;
    svc.createAssignment({
      newsId: assigning.id, orgId: v.orgId, category: v.category, topic: v.topic,
      tags: v.tags, priority: v.priority, displayOrder: v.displayOrder,
      visibility: v.visibility, notes: v.notes,
    });
    toast.success("Assignment created");
    setAssigning(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search approved news…" className="pl-9" />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <Button size="sm" variant="outline" onClick={bulkDelete} className="gap-1 text-red-600"><Trash2 className="w-3.5 h-3.5" />Delete</Button>
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Pillar</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7}>
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8" />
                  <p className="text-sm">No approved articles yet. Approve some from the Incoming tab.</p>
                </div>
              </TableCell></TableRow>
            )}
            {!loading && filtered.map((n) => (
              <TableRow key={n.id} className="hover:bg-muted/40">
                <TableCell><Checkbox checked={selected.has(n.id)} onCheckedChange={() => toggle(n.id)} /></TableCell>
                <TableCell className="max-w-sm">
                  <p className="font-medium text-sm text-foreground line-clamp-1">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{n.source} · {new Date(n.published).toLocaleDateString()}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{n.pillar}</Badge></TableCell>
                <TableCell className="hidden lg:table-cell">
                  {n.category && <Badge variant="secondary" className="text-[10px]">{n.category}</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant={asgCount(n.id) > 0 ? "default" : "outline"} className="text-[10px]">
                    {asgCount(n.id)}
                  </Badge>
                </TableCell>
                <TableCell><StatusBadge status={n.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(n)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setAssigning(n)} title="Assign" className="text-primary"><Link2 className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(n)} title="Delete" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditNewsDialog
        news={editing}
        onClose={() => setEditing(null)}
        onSave={(id, patch) => { svc.updateNews(id, patch); toast.success("Saved"); load(); }}
      />

      <AssignmentDialog
        open={!!assigning}
        news={assigning}
        organizations={orgs}
        onClose={() => setAssigning(null)}
        onSave={handleAssignSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove all assignments for "{deleteTarget?.title}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && doDelete(deleteTarget)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
