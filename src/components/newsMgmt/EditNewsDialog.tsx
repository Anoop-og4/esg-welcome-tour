import { useState, useEffect } from "react";
import type { News, Pillar } from "@/types/newsAssignment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const pillars: Pillar[] = ["ESG", "Green Energy", "Green Tech", "Electric Mobility", "Policy & Regulation", "Green Finance & Markets"];

interface Props {
  news: News | null;
  onClose: () => void;
  onSave: (id: number, patch: Partial<News>) => void;
}

export default function EditNewsDialog({ news, onClose, onSave }: Props) {
  const [form, setForm] = useState<Partial<News>>({});
  useEffect(() => { if (news) setForm({ title: news.title, summary: news.summary, category: news.category, pillar: news.pillar, relevance: news.relevance }); }, [news]);

  if (!news) return null;
  const submit = () => { onSave(news.id, form); onClose(); };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit article</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs">Summary</Label>
            <Textarea rows={4} value={form.summary ?? ""} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Pillar</Label>
              <Select value={form.pillar} onValueChange={(v) => setForm((f) => ({ ...f, pillar: v as Pillar }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{pillars.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Input value={form.category ?? ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Relevance (1–5)</Label>
            <Input type="number" min={1} max={5} value={form.relevance ?? 3}
              onChange={(e) => setForm((f) => ({ ...f, relevance: Math.min(5, Math.max(1, Number(e.target.value))) as News["relevance"] }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
