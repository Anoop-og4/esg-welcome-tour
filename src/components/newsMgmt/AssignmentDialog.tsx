import { useState, useEffect } from "react";
import type { Assignment, Organization, News, Priority, Visibility } from "@/types/newsAssignment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export interface AssignmentFormValue {
  orgId: number | null;
  category: string;
  topic: string;
  tags: string[];
  priority: Priority;
  displayOrder: number;
  visibility: Visibility;
  notes: string;
}

const emptyForm: AssignmentFormValue = {
  orgId: null, category: "", topic: "", tags: [],
  priority: "medium", displayOrder: 1, visibility: "public", notes: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  news: News | null;
  organizations: Organization[];
  existing?: Assignment | null;
  onSave: (value: AssignmentFormValue) => void;
}

export default function AssignmentDialog({ open, onClose, news, organizations, existing, onSave }: Props) {
  const [form, setForm] = useState<AssignmentFormValue>(emptyForm);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setForm({
        orgId: existing.orgId, category: existing.category, topic: existing.topic,
        tags: [...existing.tags], priority: existing.priority, displayOrder: existing.displayOrder,
        visibility: existing.visibility, notes: existing.notes,
      });
    } else {
      setForm({ ...emptyForm, category: news?.category ?? "", topic: news?.pillar ?? "" });
    }
    setTagInput("");
  }, [open, existing, news]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };
  const removeTag = (t: string) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const canSave = form.orgId != null && form.category.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Update assignment" : "Assign to organization"}</DialogTitle>
          {news && <DialogDescription className="line-clamp-2">{news.title}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label className="text-xs">Organization *</Label>
            <Select value={form.orgId?.toString() ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, orgId: Number(v) }))}>
              <SelectTrigger><SelectValue placeholder="Choose organization" /></SelectTrigger>
              <SelectContent>
                {organizations.map((o) => (
                  <SelectItem key={o.id} value={o.id.toString()}>{o.name} — <span className="text-muted-foreground">{o.industry}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Custom category *</Label>
            <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Sustainability update" />
          </div>
          <div>
            <Label className="text-xs">Related topic</Label>
            <Input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="e.g. Scope 3 emissions" />
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 pr-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Visibility</Label>
            <Select value={form.visibility} onValueChange={(v) => setForm((f) => ({ ...f, visibility: v as Visibility }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Display order</Label>
            <Input type="number" min={1} value={form.displayOrder}
              onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) || 1 }))} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Editorial notes for this org…" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!canSave} onClick={() => onSave(form)}>
            {existing ? "Update assignment" : "Create assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
