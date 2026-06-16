import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PCFNode, NODE_TYPES, SCOPES } from "./pcfTypes";
import { calculateNodeEmission, calculateBranchTotal } from "./pcfUtils";
import { Trash2, Plus, ChevronLeft, ChevronRight, ArrowLeftRight, Save } from "lucide-react";

interface Props {
  node: PCFNode | null;
  nodes: PCFNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (node: PCFNode) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  onAddSibling: (id: string, position: "before" | "after") => void;
  onSwap: (aId: string, bId: string) => void;
}

export default function PCFNodeEditorDrawer({
  node,
  nodes,
  open,
  onOpenChange,
  onSave,
  onDelete,
  onAddChild,
  onAddSibling,
  onSwap,
}: Props) {
  const [draft, setDraft] = useState<PCFNode | null>(node);
  const [swapTarget, setSwapTarget] = useState<string>("");

  useEffect(() => {
    setDraft(node);
    setSwapTarget("");
  }, [node]);

  if (!draft) return null;

  const update = (patch: Partial<PCFNode>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      next.calculatedEmissions = calculateNodeEmission(next);
      return next;
    });
  };

  const liveEmission = calculateNodeEmission(draft);
  const branchTotal = calculateBranchTotal(draft.id, nodes);
  const isRoot = draft.parentId === null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Node</SheetTitle>
          <SheetDescription>Configure this lifecycle node and its emissions.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => update({ name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={draft.type} onValueChange={(v) => update({ type: v as PCFNode["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select value={draft.scope} onValueChange={(v) => update({ scope: v as PCFNode["scope"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" value={draft.quantity}
                onChange={(e) => update({ quantity: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input value={draft.unit} onChange={(e) => update({ unit: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Emission Factor</Label>
              <Input type="number" value={draft.emissionFactor}
                onChange={(e) => update({ emissionFactor: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>EF Unit</Label>
              <Input value={draft.emissionFactorUnit}
                onChange={(e) => update({ emissionFactorUnit: e.target.value })} />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Calculated emissions</span>
              <span className="font-bold text-foreground">{liveEmission.toLocaleString()} kgCO₂e</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Branch total</span>
              <span className="font-semibold text-primary">{branchTotal.toLocaleString()} kgCO₂e</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input value={draft.supplier ?? ""} onChange={(e) => update({ supplier: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={draft.location ?? ""} onChange={(e) => update({ location: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={draft.notes ?? ""} onChange={(e) => update({ notes: e.target.value })} />
          </div>

          {/* Swap */}
          <div className="space-y-1.5">
            <Label>Swap position with</Label>
            <div className="flex gap-2">
              <Select value={swapTarget} onValueChange={setSwapTarget}>
                <SelectTrigger><SelectValue placeholder="Select a node…" /></SelectTrigger>
                <SelectContent>
                  {nodes.filter((n) => n.id !== draft.id).map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" disabled={!swapTarget}
                onClick={() => { if (swapTarget) { onSwap(draft.id, swapTarget); setSwapTarget(""); } }}>
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => onSave(draft)} className="flex-1">
              <Save className="mr-1 h-4 w-4" /> Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => onAddChild(draft.id)}>
              <Plus className="mr-1 h-4 w-4" /> Add Child
            </Button>
            <Button variant="outline" onClick={() => onAddSibling(draft.id, "after")} disabled={isRoot}>
              <ChevronRight className="mr-1 h-4 w-4" /> Sibling After
            </Button>
            <Button variant="outline" onClick={() => onAddSibling(draft.id, "before")} disabled={isRoot}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Sibling Before
            </Button>
            <Button variant="destructive" onClick={() => onDelete(draft.id)}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete Node
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
