import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PCFOrgChart from "./PCFOrgChart";
import PCFNodeEditorDrawer from "./PCFNodeEditorDrawer";
import { PCFNode } from "./pcfTypes";
import {
  defaultTemplate,
  localStorageStore,
  calculateProductTotal,
  addChildNode,
  addSiblingNode,
  deleteNode,
  moveNode,
  swapNodes,
  getChildren,
  blankNode,
  exportJSON,
  parseImportJSON,
} from "./pcfUtils";
import {
  Plus,
  RotateCcw,
  Save,
  Download,
  Upload,
  Maximize2,
  Leaf,
} from "lucide-react";

export default function PCFBuilderPage() {
  const [nodes, setNodes] = useState<PCFNode[]>([]);
  const [productName, setProductName] = useState("My Product");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fitRef = useRef<(() => void) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load from storage / template on mount
  useEffect(() => {
    (async () => {
      const stored = await localStorageStore.load();
      if (stored && stored.nodes.length) {
        setNodes(stored.nodes);
        setProductName(stored.productName);
      } else {
        setNodes(defaultTemplate());
      }
    })();
  }, []);

  const persist = useCallback((next: PCFNode[], name = productName) => {
    localStorageStore.save(name, next);
  }, [productName]);

  const total = calculateProductTotal(nodes);
  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  const commit = (next: PCFNode[]) => {
    setNodes(next);
    persist(next);
  };

  const handleNodeClick = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const handleAddChild = (parentId: string) => {
    const { nodes: next, newId } = addChildNode(parentId, nodes);
    commit(next);
    setSelectedId(newId);
    setDrawerOpen(true);
    toast.success("Child node added");
  };

  const handleAddSibling = (id: string, position: "before" | "after") => {
    const { nodes: next, newId } = addSiblingNode(id, position, nodes);
    commit(next);
    setSelectedId(newId);
    toast.success("Sibling node added");
  };

  const handleDelete = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const hasChildren = getChildren(id, nodes).length > 0;
    if (node.parentId === null && hasChildren) {
      if (!window.confirm("Delete the root node and ALL its children?")) return;
    } else if (hasChildren) {
      if (!window.confirm("Delete this node and all its children?")) return;
    }
    commit(deleteNode(id, nodes));
    setDrawerOpen(false);
    setSelectedId(null);
    toast.success("Node deleted");
  };

  const handleSaveNode = (updated: PCFNode) => {
    commit(nodes.map((n) => (n.id === updated.id ? updated : n)));
    toast.success("Node saved");
  };

  const handleSwap = (aId: string, bId: string) => {
    const next = swapNodes(aId, bId, nodes);
    if (next === nodes) {
      toast.error("Cannot swap — would break the hierarchy");
      return;
    }
    commit(next);
    toast.success("Nodes swapped");
  };

  // Drop: same parent => reorder after target; else reparent under target
  const handleDropNode = (draggedId: string, targetId: string) => {
    const dragged = nodes.find((n) => n.id === draggedId);
    const target = nodes.find((n) => n.id === targetId);
    if (!dragged || !target) return;

    if (dragged.parentId === target.parentId && dragged.parentId !== null) {
      const next = moveNode(draggedId, target.parentId, target.order + 1, nodes);
      if (next === nodes) return toast.error("Invalid move");
      commit(next);
      toast.success("Reordered");
    } else {
      const newOrder = getChildren(targetId, nodes).length;
      const next = moveNode(draggedId, targetId, newOrder, nodes);
      if (next === nodes) return toast.error("Move would create a cycle");
      commit(next);
      toast.success(`Moved under ${target.name}`);
    }
  };

  const handleAddRoot = () => {
    const orphanOrder = getChildren(null, nodes).length;
    const node = blankNode(null, orphanOrder, { name: "New Root", type: "Product", scope: "Scope 1" });
    commit([...nodes, node]);
    setSelectedId(node.id);
    setDrawerOpen(true);
  };

  const handleReset = () => {
    if (!window.confirm("Reset to the default lifecycle template? This clears current data.")) return;
    const t = defaultTemplate();
    commit(t);
    toast.success("Template reset");
  };

  const handleSave = () => {
    persist(nodes);
    toast.success("Saved to local storage");
  };

  const handleExport = () => {
    const blob = new Blob([exportJSON(productName, nodes)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-pcf.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImportJSON(String(reader.result));
      if (!parsed) return toast.error("Invalid JSON file");
      setNodes(parsed.nodes);
      setProductName(parsed.productName);
      persist(parsed.nodes, parsed.productName);
      toast.success("Imported");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header + totals */}
      <div className="border-b bg-background/80 px-5 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Leaf className="h-5 w-5 text-primary" />
              Product Carbon Footprint Builder
            </h1>
            <p className="text-sm text-muted-foreground">
              Build, connect and calculate the full lifecycle footprint of your product.
            </p>
          </div>
          <div className="rounded-xl border bg-primary/5 px-5 py-2 text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Product PCF</div>
            <div className="text-2xl font-extrabold text-primary">
              {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
              <span className="text-sm font-medium">kgCO₂e</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input
            value={productName}
            onChange={(e) => { setProductName(e.target.value); persist(nodes, e.target.value); }}
            className="h-9 w-56"
            placeholder="Product name"
          />
          <Button size="sm" variant="outline" onClick={handleAddRoot}><Plus className="mr-1 h-4 w-4" />Add Root</Button>
          <Button size="sm" variant="outline" onClick={handleReset}><RotateCcw className="mr-1 h-4 w-4" />Reset</Button>
          <Button size="sm" variant="outline" onClick={handleSave}><Save className="mr-1 h-4 w-4" />Save</Button>
          <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" />Import</Button>
          <Button size="sm" variant="outline" onClick={() => fitRef.current?.()}><Maximize2 className="mr-1 h-4 w-4" />Fit View</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1 overflow-hidden bg-muted/20">
        {nodes.length > 0 ? (
          <PCFOrgChart
            nodes={nodes}
            onNodeClick={handleNodeClick}
            onAddChild={handleAddChild}
            onDropNode={handleDropNode}
            registerFit={(fit) => (fitRef.current = fit)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No nodes. Click “Add Root” or “Reset”.
          </div>
        )}
      </div>

      <PCFNodeEditorDrawer
        node={selectedNode}
        nodes={nodes}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSaveNode}
        onDelete={handleDelete}
        onAddChild={handleAddChild}
        onAddSibling={handleAddSibling}
        onSwap={handleSwap}
      />
    </div>
  );
}
