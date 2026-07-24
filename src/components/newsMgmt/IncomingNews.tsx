import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { News } from "@/types/newsAssignment";
import * as svc from "@/lib/newsAssignmentService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, RefreshCw, Eye, Check, X, Inbox } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import PreviewDrawer from "./PreviewDrawer";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 10;

export default function IncomingNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pillar, setPillar] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [preview, setPreview] = useState<News | null>(null);
  const [rejectTarget, setRejectTarget] = useState<News | null>(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    const n = await svc.getNews();
    setNews(n.filter((x) => x.status === "pending"));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const sources = useMemo(() => Array.from(new Set(news.map((n) => n.source))), [news]);
  const pillars = useMemo(() => Array.from(new Set(news.map((n) => n.pillar))), [news]);

  const filtered = useMemo(() => {
    return news.filter((n) => {
      if (pillar !== "all" && n.pillar !== pillar) return false;
      if (source !== "all" && n.source !== source) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [news, pillar, source, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  const toggle = (id: number) => {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    setSelected((s) => s.size === pageItems.length ? new Set() : new Set(pageItems.map((n) => n.id)));
  };

  const approve = (id: number) => { svc.updateNewsStatus(id, "approved"); toast.success("Approved"); load(); };
  const reject = (id: number) => { svc.updateNewsStatus(id, "rejected"); toast("Rejected"); setRejectTarget(null); load(); };

  const bulkApprove = () => {
    selected.forEach((id) => svc.updateNewsStatus(id, "approved"));
    toast.success(`Approved ${selected.size} articles`);
    setSelected(new Set()); load();
  };
  const bulkReject = () => {
    selected.forEach((id) => svc.updateNewsStatus(id, "rejected"));
    toast(`Rejected ${selected.size} articles`);
    setSelected(new Set()); load();
  };

  const fetchNew = () => {
    const added = svc.fetchIncomingNews();
    toast.success(`Fetched ${added.length} new articles`);
    load();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search incoming news…" className="pl-9" />
        </div>
        <Select value={pillar} onValueChange={setPillar}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Pillar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pillars</SelectItem>
            {pillars.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={fetchNew} className="gap-2"><RefreshCw className="w-4 h-4" />Fetch News</Button>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={bulkReject} className="gap-1"><X className="w-3.5 h-3.5" />Reject</Button>
            <Button size="sm" onClick={bulkApprove} className="gap-1"><Check className="w-3.5 h-3.5" />Approve</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={pageItems.length > 0 && selected.size === pageItems.length} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Source</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ))}
            {!loading && pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <Inbox className="w-8 h-8" />
                    <p className="text-sm">No pending news. Try fetching new articles.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && pageItems.map((n) => (
              <TableRow key={n.id} className="hover:bg-muted/40">
                <TableCell><Checkbox checked={selected.has(n.id)} onCheckedChange={() => toggle(n.id)} /></TableCell>
                <TableCell className="max-w-sm">
                  <p className="font-medium text-sm text-foreground line-clamp-1">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{n.summary}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs">{n.source}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {n.category && <Badge variant="secondary" className="text-[10px]">{n.category}</Badge>}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {new Date(n.published).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </TableCell>
                <TableCell><StatusBadge status={n.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setPreview(n)} title="Preview"><Eye className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => approve(n.id)} title="Approve" className="text-emerald-600 hover:text-emerald-700"><Check className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectTarget(n)} title="Reject" className="text-red-600 hover:text-red-700"><X className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} /></PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem><PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <PreviewDrawer news={preview} onClose={() => setPreview(null)} />

      <AlertDialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this article?</AlertDialogTitle>
            <AlertDialogDescription>
              "{rejectTarget?.title}" will be marked rejected and hidden from the approval queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => rejectTarget && reject(rejectTarget.id)}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
