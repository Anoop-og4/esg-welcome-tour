import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Trash2, Plus, ChevronLeft, ChevronRight, ArrowLeftRight, Save,
} from "lucide-react";
import { PCFFlowNode, PCFNodeData, NODE_TYPES, SCOPES } from "./pcfFlowTypes";
import { selfEmission, parentsOf, allocationFor } from "./pcfFlowUtils";

interface Props {
  node: PCFFlowNode | null;
  nodes: PCFFlowNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: PCFNodeData) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  onAddSibling: (id: string, position: "before" | "after") => void;
  onSwap: (aId: string, bId: string) => void;
  onAllocationChange: (childId: string, parentId: string, weightPercent: number) => void;
  onRemoveSharedParent: (childId: string, parentId: string) => void;
}

export default function PCFFlowNodeEditor({
  node, nodes, open, onOpenChange,
  onSave, onDelete, onAddChild, onAddSibling, onSwap,
  onAllocationChange, onRemoveSharedParent,
}: Props) {
  const [draft, setDraft] = useState<PCFNodeData | null>(node?.data ?? null);
  const [swapTarget, setSwapTarget] = useState("");

  useEffect(() => {
    setDraft(node ? { ...node.data } : null);
    setSwapTarget("");
  }, [node]);

  if (!node || !draft) return null;

  const update = (patch: Partial<PCFNodeData>) =>
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));

  const liveEmission = selfEmission(draft);
  const isRoot = draft.parentId === null;
  const nameById = new Map(nodes.map((n) => [n.id, n.data.name]));
  const parents = parentsOf(node);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Node</SheetTitle>
          <SheetDescription>
            Configure this node, its emissions and how parents share its footprint.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => update({ name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={draft.type} onValueChange={(v) => update({ type: v as PCFNodeData["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select value={draft.scope} onValueChange={(v) => update({ scope: v as PCFNodeData["scope"] })}>
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
              <span className="text-muted-foreground">Calculated (self) emissions</span>
              <span className="font-bold text-foreground">{liveEmission.toLocaleString()} kgCO₂e</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Branch total</span>
              <span className="font-semibold text-primary">
                {(node.data.branchTotal ?? 0).toLocaleString()} kgCO₂e
              </span>
            </div>
          </div>

          {/* Parents & allocation (the DAG part) */}
          {parents.length > 1 && (
            <div className="space-y-2">
              <Label>Shared across {parents.length} parents</Label>
              <p className="text-xs text-muted-foreground">
                Each parent is attributed a share of this node's footprint (auto-balanced to 100%).
              </p>
              {parents.map((pid) => {
                const isPrimary = pid === draft.parentId;
                return (
                  <div key={pid} className="flex items-center gap-2">
                    <span className="flex-1 truncate text-sm">
                      {nameById.get(pid) ?? pid}
                      {isPrimary && <span className="ml-1 text-xs text-muted-foreground">(primary)</span>}
                    </span>
                    <Input
                      type="number" min={0} max={100} className="h-8 w-20"
                      value={Math.round(allocationFor(node, pid) * 100)}
                      onChange={(ev) => onAllocationChange(node.id, pid, parseFloat(ev.target.value) || 0)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                    {!isPrimary && (
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        title="Remove this shared parent"
                        onClick={() => onRemoveSharedParent(node.id, pid)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

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

          {/* Explicit swap */}
          <div className="space-y-1.5">
            <Label>Swap position with</Label>
            <div className="flex gap-2">
              <Select value={swapTarget} onValueChange={setSwapTarget}>
                <SelectTrigger><SelectValue placeholder="Select a node…" /></SelectTrigger>
                <SelectContent>
                  {nodes.filter((n) => n.id !== node.id).map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.data.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" disabled={!swapTarget}
                onClick={() => { if (swapTarget) { onSwap(node.id, swapTarget); setSwapTarget(""); } }}>
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => onSave(node.id, draft)} className="flex-1">
              <Save className="mr-1 h-4 w-4" /> Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => onAddChild(node.id)}>
              <Plus className="mr-1 h-4 w-4" /> Add Child
            </Button>
            <Button variant="outline" onClick={() => onAddSibling(node.id, "after")} disabled={isRoot}>
              <ChevronRight className="mr-1 h-4 w-4" /> Sibling After
            </Button>
            <Button variant="outline" onClick={() => onAddSibling(node.id, "before")} disabled={isRoot}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Sibling Before
            </Button>
            <Button variant="destructive" onClick={() => onDelete(node.id)}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete Node
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
