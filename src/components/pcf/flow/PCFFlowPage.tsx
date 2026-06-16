import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Panel,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, RotateCcw, Save, Download, Upload, Maximize2, LayoutGrid, Leaf, Flame,
} from "lucide-react";
import PCFFlowNode from "./PCFFlowNode";
import PCFFlowNodeEditor from "./PCFFlowNodeEditor";
import { PCFFlowNode as TPCFFlowNode, PCFNodeData } from "./pcfFlowTypes";
import {
  defaultTemplate, flowStore, productTotal, computeBranchTotals, computeDepths,
  selfEmission, makeNode, treeLayout, addChildNode, addSiblingNode, deleteNode,
  moveNode, swapNodes, addSharedParent, removeSharedParent, setAllocationWeight,
  combinedChildren, parentsOf, allocationFor, exportJSON, parseImportJSON,
} from "./pcfFlowUtils";

const nodeTypes = { pcf: PCFFlowNode };

function PCFFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [productName, setProductName] = useState("My Product");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hotspotMode, setHotspotMode] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { fitView, screenToFlowPosition, getIntersectingNodes } = useReactFlow();
  const loaded = useRef(false);

  const typed = () => nodes as unknown as TPCFFlowNode[];
  const relayout = useCallback(
    (next: TPCFFlowNode[]) => setNodes(treeLayout(next) as unknown as Node[]),
    [setNodes],
  );
  const fit = useCallback(
    () => setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 60),
    [fitView],
  );

  // ── load ──
  useEffect(() => {
    const stored = flowStore.load();
    const doc = stored && stored.nodes.length ? stored : defaultTemplate();
    setNodes(treeLayout(doc.nodes) as unknown as Node[]);
    setProductName(doc.productName);
    loaded.current = true;
    fit();
  }, [setNodes, fit]);

  // ── persist ──
  useEffect(() => {
    if (!loaded.current) return;
    flowStore.save({ productName, nodes: nodes as unknown as TPCFFlowNode[] });
  }, [nodes, productName]);

  // ── derived totals / edges ──
  const total = useMemo(() => productTotal(typed()), [nodes]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayNodes = useMemo(() => {
    const t = nodes as unknown as TPCFFlowNode[];
    const branch = computeBranchTotals(t);
    const depths = computeDepths(t);
    const grand = productTotal(t);
    return nodes.map((n) => {
      const self = selfEmission(n.data as PCFNodeData);
      return {
        ...n,
        data: {
          ...(n.data as PCFNodeData),
          selfEmission: self,
          branchTotal: branch.get(n.id) ?? 0,
          depth: depths.get(n.id) ?? 0,
          hotspotMode,
          hotspotShare: grand > 0 ? self / grand : 0,
        },
      };
    });
  }, [nodes, hotspotMode]);

  // ranked contributors for the Pareto panel
  const hotspots = useMemo(() => {
    const t = nodes as unknown as TPCFFlowNode[];
    const grand = productTotal(t);
    const ranked = t
      .map((n) => ({ id: n.id, name: n.data.name, self: selfEmission(n.data) }))
      .filter((x) => x.self > 0)
      .sort((a, b) => b.self - a.self);
    let cum = 0;
    return ranked.map((x) => {
      const share = grand > 0 ? x.self / grand : 0;
      cum += share;
      return { ...x, share, cumulative: cum };
    });
  }, [nodes]);

  const edges = useMemo<Edge[]>(() => {
    const t = nodes as unknown as TPCFFlowNode[];
    const out: Edge[] = [];
    for (const n of t) {
      if (n.data.parentId) {
        out.push({
          id: `p-${n.id}`,
          source: n.data.parentId,
          target: n.id,
          deletable: false,
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8", width: 18, height: 18 },
        });
      }
      for (const pid of n.data.sharedParentIds ?? []) {
        out.push({
          id: `s-${pid}-${n.id}`,
          source: pid,
          target: n.id,
          type: "smoothstep",
          animated: true,
          style: { strokeDasharray: "6 4", stroke: "#0ea5e9", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#0ea5e9", width: 18, height: 18 },
          label: `${Math.round(allocationFor(n, pid) * 100)}%`,
        });
      }
    }
    return out;
  }, [nodes]);

  const selectedNode = useMemo(
    () => (displayNodes.find((x) => x.id === selectedId) as unknown as TPCFFlowNode) ?? null,
    [displayNodes, selectedId],
  );

  // ── drag to restructure: plain = reparent/reorder, Shift = swap ──
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent | MouseEvent | TouchEvent, node: Node) => {
      const hits = getIntersectingNodes(node).filter((n) => n.id !== node.id);
      const target = hits[0];
      const t = nodes as unknown as TPCFFlowNode[];
      if (!target) {
        relayout(t); // snap back to tidy layout
        return;
      }
      const shiftKey = "shiftKey" in event && event.shiftKey;
      let next: TPCFFlowNode[];
      if (shiftKey) {
        next = swapNodes(node.id, target.id, t);
        if (next === t) { toast.error("Can't swap — would break the hierarchy"); relayout(t); return; }
        toast.success("Swapped");
      } else {
        const dragged = t.find((n) => n.id === node.id)!;
        const tgt = t.find((n) => n.id === target.id)!;
        if (dragged.data.parentId === tgt.data.parentId && dragged.data.parentId !== null) {
          next = moveNode(node.id, tgt.data.parentId, tgt.data.order + 1, t);
          if (next === t) { toast.error("Invalid move"); relayout(t); return; }
          toast.success("Reordered");
        } else {
          const order = combinedChildren(target.id, t).length;
          next = moveNode(node.id, target.id, order, t);
          if (next === t) { toast.error("Move would create a cycle"); relayout(t); return; }
          toast.success(`Moved under ${tgt.data.name}`);
        }
      }
      relayout(next);
    },
    [nodes, getIntersectingNodes, relayout],
  );

  // ── connect handle->handle: become the PRIMARY parent if the child has none,
  //    otherwise add a SHARED parent (the DAG case) ──
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || params.source === params.target) return;
      const t = nodes as unknown as TPCFFlowNode[];
      const child = t.find((n) => n.id === params.target);
      if (!child) return;
      if (child.data.parentId === null) {
        const order = combinedChildren(params.source, t).length;
        const next = moveNode(params.target, params.source, order, t);
        if (next === t) return toast.error("Can't connect — would create a cycle");
        relayout(next);
        toast.success("Connected");
      } else {
        const next = addSharedParent(params.target, params.source, t);
        if (next === t) return toast.error("Can't share — duplicate or would create a cycle");
        setNodes(next as unknown as Node[]);
        toast.success("Shared parent added");
      }
    },
    [nodes, setNodes, relayout],
  );

  // delete a shared (dashed) edge -> remove that shared parent
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      let t = nodes as unknown as TPCFFlowNode[];
      for (const e of deleted) {
        if (e.id.startsWith("s-")) t = removeSharedParent(e.target, e.source, t);
      }
      setNodes(t as unknown as Node[]);
    },
    [nodes, setNodes],
  );

  // ── editor + node handlers ──
  const onNodeClick: NodeMouseHandler = useCallback((_e, node) => {
    setSelectedId(node.id);
    setDrawerOpen(true);
  }, []);

  const handleSaveNode = useCallback((id: string, data: PCFNodeData) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...data } } : n)));
    toast.success("Node saved");
  }, [setNodes]);

  const handleDelete = useCallback((id: string) => {
    relayout(deleteNode(id, nodes as unknown as TPCFFlowNode[]));
    setDrawerOpen(false);
    setSelectedId(null);
    toast.success("Node deleted");
  }, [nodes, relayout]);

  const handleAddChild = useCallback((parentId: string) => {
    const { nodes: next, newId } = addChildNode(parentId, nodes as unknown as TPCFFlowNode[]);
    relayout(next);
    setSelectedId(newId);
    setDrawerOpen(true);
    toast.success("Child node added");
  }, [nodes, relayout]);

  const handleAddSibling = useCallback((id: string, position: "before" | "after") => {
    const { nodes: next, newId } = addSiblingNode(id, position, nodes as unknown as TPCFFlowNode[]);
    relayout(next);
    setSelectedId(newId);
    toast.success("Sibling added");
  }, [nodes, relayout]);

  const handleSwap = useCallback((aId: string, bId: string) => {
    const t = nodes as unknown as TPCFFlowNode[];
    const next = swapNodes(aId, bId, t);
    if (next === t) return toast.error("Can't swap — would break the hierarchy");
    relayout(next);
    toast.success("Swapped");
  }, [nodes, relayout]);

  const handleAllocationChange = useCallback((childId: string, parentId: string, weightPercent: number) => {
    setNodes((nds) =>
      setAllocationWeight(childId, parentId, weightPercent, nds as unknown as TPCFFlowNode[]) as unknown as Node[],
    );
  }, [setNodes]);

  const handleRemoveSharedParent = useCallback((childId: string, parentId: string) => {
    setNodes((nds) =>
      removeSharedParent(childId, parentId, nds as unknown as TPCFFlowNode[]) as unknown as Node[],
    );
  }, [setNodes]);

  // delegated "+" add-child button inside nodes
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement)?.closest?.("[data-pcf-add]");
      if (btn) {
        e.stopPropagation();
        const pid = btn.getAttribute("data-pcf-add");
        if (pid) handleAddChild(pid);
      }
    };
    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, [handleAddChild]);

  // ── toolbar ──
  const handleAddRoot = useCallback(() => {
    const node = makeNode({ x: 0, y: 0 }, {
      name: "New Root", type: "Product", scope: "Scope 1", parentId: null,
      order: (nodes as unknown as TPCFFlowNode[]).filter((n) => n.data.parentId === null).length,
    });
    relayout([...(nodes as unknown as TPCFFlowNode[]), node]);
    setSelectedId(node.id);
    setDrawerOpen(true);
  }, [nodes, relayout]);

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset to the default lifecycle template? This clears current data.")) return;
    const doc = defaultTemplate();
    setNodes(treeLayout(doc.nodes) as unknown as Node[]);
    setProductName(doc.productName);
    fit();
    toast.success("Template reset");
  }, [setNodes, fit]);

  const handleExport = useCallback(() => {
    const blob = new Blob(
      [exportJSON({ productName, nodes: nodes as unknown as TPCFFlowNode[] })],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-pcf.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [productName, nodes]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImportJSON(String(reader.result));
      if (!parsed) { toast.error("Invalid JSON file"); return; }
      setNodes(treeLayout(parsed.nodes) as unknown as Node[]);
      setProductName(parsed.productName);
      fit();
      toast.success("Imported");
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [setNodes, fit]);

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
              Drag a node onto another to reparent/reorder · Shift+drag to swap · drag a handle to share across parents.
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input value={productName} onChange={(e) => setProductName(e.target.value)}
            className="h-9 w-56" placeholder="Product name" />
          <Button size="sm" variant={hotspotMode ? "default" : "outline"} onClick={() => setHotspotMode((v) => !v)}><Flame className="mr-1 h-4 w-4" />Hotspots</Button>
          <Button size="sm" variant="outline" onClick={handleAddRoot}><Plus className="mr-1 h-4 w-4" />Add Root</Button>
          <Button size="sm" variant="outline" onClick={() => relayout(typed())}><LayoutGrid className="mr-1 h-4 w-4" />Tidy Layout</Button>
          <Button size="sm" variant="outline" onClick={handleReset}><RotateCcw className="mr-1 h-4 w-4" />Reset</Button>
          <Button size="sm" variant="outline" onClick={() => { flowStore.save({ productName, nodes: typed() }); toast.success("Saved"); }}><Save className="mr-1 h-4 w-4" />Save</Button>
          <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" />Import</Button>
          <Button size="sm" variant="outline" onClick={() => fitView({ duration: 400, padding: 0.2 })}><Maximize2 className="mr-1 h-4 w-4" />Fit View</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Canvas */}
      <div ref={wrapperRef} className="relative flex-1 overflow-hidden bg-muted/20">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} />
          <Controls />
          <MiniMap pannable zoomable />
          {hotspotMode && (
            <Panel position="top-right">
              <div className="w-72 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
                <div className="mb-2 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold">Emission Hotspots</span>
                </div>
                {hotspots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No emissions yet — set quantities or pick factors to see hotspots.
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-[11px] text-muted-foreground">
                      Ranked by share of total. The line marks the 80% cut-off (the vital few).
                    </p>
                    <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
                      {hotspots.map((h, i) => {
                        const crossed80 = h.cumulative >= 0.8 && (i === 0 || hotspots[i - 1].cumulative < 0.8);
                        return (
                          <div key={h.id}>
                            {crossed80 && (
                              <div className="my-1 flex items-center gap-2">
                                <div className="h-px flex-1 bg-orange-400/60" />
                                <span className="text-[9px] font-semibold uppercase tracking-wide text-orange-500">80%</span>
                                <div className="h-px flex-1 bg-orange-400/60" />
                              </div>
                            )}
                            <button
                              onClick={() => { setSelectedId(h.id); setDrawerOpen(true); }}
                              className="w-full rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted/60"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate">{i + 1}. {h.name}</span>
                                <span className="shrink-0 font-bold tabular-nums">{(h.share * 100).toFixed(1)}%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.max(2, h.share * 100)}%`,
                                    background:
                                      h.share >= 0.25 ? "#dc2626" :
                                      h.share >= 0.15 ? "#ea580c" :
                                      h.share >= 0.07 ? "#f59e0b" :
                                      h.share >= 0.02 ? "#eab308" : "#84cc16",
                                  }}
                                />
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      <PCFFlowNodeEditor
        node={selectedNode}
        nodes={typed()}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSaveNode}
        onDelete={handleDelete}
        onAddChild={handleAddChild}
        onAddSibling={handleAddSibling}
        onSwap={handleSwap}
        onAllocationChange={handleAllocationChange}
        onRemoveSharedParent={handleRemoveSharedParent}
      />
    </div>
  );
}

export default function PCFFlowPage() {
  return (
    <ReactFlowProvider>
      <PCFFlowInner />
    </ReactFlowProvider>
  );
}
