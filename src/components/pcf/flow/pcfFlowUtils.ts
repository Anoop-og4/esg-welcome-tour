import {
  PCFFlowDocument,
  PCFFlowNode,
  PCFNodeData,
  PCFNodeType,
  PCFScope,
  PCF_FLOW_STORAGE_KEY,
} from "./pcfFlowTypes";

// ─── ids ───
let idCounter = 0;
export function genId(prefix = "n"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

// ─── emission math ───
export function selfEmission(data: PCFNodeData): number {
  const q = Number(data.quantity) || 0;
  const ef = Number(data.emissionFactor) || 0;
  return Math.round(q * ef * 1000) / 1000;
}

/** all parents of a node: primary (if any) + shared */
export function parentsOf(node: PCFFlowNode): string[] {
  const ps = node.data.parentId ? [node.data.parentId] : [];
  return [...ps, ...(node.data.sharedParentIds ?? [])];
}

/** primary children of a node, sorted by order */
export function childrenOf(parentId: string | null, nodes: PCFFlowNode[]): PCFFlowNode[] {
  return nodes
    .filter((n) => n.data.parentId === parentId)
    .sort((a, b) => a.data.order - b.data.order);
}

/** every node that draws on `parentId` (primary OR shared) */
export function combinedChildren(parentId: string, nodes: PCFFlowNode[]): PCFFlowNode[] {
  return nodes.filter(
    (n) => n.data.parentId === parentId || (n.data.sharedParentIds ?? []).includes(parentId),
  );
}

export function rootNodes(nodes: PCFFlowNode[]): PCFFlowNode[] {
  return nodes.filter((n) => n.data.parentId === null).sort((a, b) => a.data.order - b.data.order);
}

/** normalized allocation (0..1) of a child's footprint attributed to `parentId` */
export function allocationFor(node: PCFFlowNode, parentId: string): number {
  const parents = parentsOf(node);
  if (parents.length === 0) return 0;
  const weights = node.data.parentAllocations ?? {};
  const total = parents.reduce((s, p) => s + (weights[p] ?? 1), 0);
  if (total <= 0) return 1 / parents.length;
  return (weights[parentId] ?? 1) / total;
}

/** branch total = self + allocated share of every child (primary + shared). cycle-safe + memoized. */
export function computeBranchTotals(nodes: PCFFlowNode[]): Map<string, number> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const memo = new Map<string, number>();
  const onPath = new Set<string>();

  const visit = (id: string): number => {
    if (memo.has(id)) return memo.get(id)!;
    if (onPath.has(id)) return 0;
    const node = byId.get(id);
    if (!node) return 0;
    onPath.add(id);
    let total = selfEmission(node.data);
    for (const child of combinedChildren(id, nodes)) {
      total += allocationFor(child, id) * visit(child.id);
    }
    onPath.delete(id);
    total = Math.round(total * 1000) / 1000;
    memo.set(id, total);
    return total;
  };

  for (const n of nodes) visit(n.id);
  return memo;
}

/** each node's self emission counted once — no double counting */
export function productTotal(nodes: PCFFlowNode[]): number {
  return (
    Math.round(nodes.reduce((sum, n) => sum + selfEmission(n.data), 0) * 1000) / 1000
  );
}

/** depth = shortest hops from any root following any parent link */
export function computeDepths(nodes: PCFFlowNode[]): Map<string, number> {
  const depth = new Map<string, number>();
  const roots = rootNodes(nodes);
  const queue: { id: string; d: number }[] = roots.map((r) => ({ id: r.id, d: 0 }));
  for (const r of roots) depth.set(r.id, 0);
  while (queue.length) {
    const { id, d } = queue.shift()!;
    for (const child of combinedChildren(id, nodes)) {
      const nd = d + 1;
      if (!depth.has(child.id) || nd < depth.get(child.id)!) {
        depth.set(child.id, nd);
        queue.push({ id: child.id, d: nd });
      }
    }
  }
  for (const n of nodes) if (!depth.has(n.id)) depth.set(n.id, 0);
  return depth;
}

// ─── cycle prevention ───
/** would making `newParentId` a parent of `nodeId` create a cycle? */
export function wouldCreateCycle(
  nodeId: string,
  newParentId: string | null,
  nodes: PCFFlowNode[],
): boolean {
  if (newParentId === null) return false;
  if (newParentId === nodeId) return true;
  // cycle iff nodeId can already reach newParentId via children (newParentId is a descendant)
  const stack = [nodeId];
  const seen = new Set<string>();
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === newParentId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const child of combinedChildren(cur, nodes)) stack.push(child.id);
  }
  return false;
}

// ─── structural ops (operate on the primary tree) ───
function reorderSiblings(parentId: string | null, nodes: PCFFlowNode[]): PCFFlowNode[] {
  const sibs = childrenOf(parentId, nodes);
  const orderMap = new Map(sibs.map((n, i) => [n.id, i]));
  return nodes.map((n) =>
    n.data.parentId === parentId && orderMap.has(n.id)
      ? { ...n, data: { ...n.data, order: orderMap.get(n.id)! } }
      : n,
  );
}

/** reparent/reorder. newOrder may be fractional; siblings are renormalized. */
export function moveNode(
  nodeId: string,
  newParentId: string | null,
  newOrder: number,
  nodes: PCFFlowNode[],
): PCFFlowNode[] {
  if (wouldCreateCycle(nodeId, newParentId, nodes)) return nodes;
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return nodes;
  const oldParentId = node.data.parentId;

  let updated = nodes.map((n) =>
    n.id === nodeId
      ? {
          ...n,
          data: {
            ...n.data,
            parentId: newParentId,
            order: newOrder - 0.5,
            // dropping it elsewhere clears a shared link to the new parent (avoid dup)
            sharedParentIds: (n.data.sharedParentIds ?? []).filter((p) => p !== newParentId),
          },
        }
      : n,
  );
  updated = reorderSiblings(newParentId, updated);
  if (oldParentId !== newParentId) updated = reorderSiblings(oldParentId, updated);
  return updated;
}

/** swap two nodes' positions in the tree (primary parent + order) */
export function swapNodes(aId: string, bId: string, nodes: PCFFlowNode[]): PCFFlowNode[] {
  const a = nodes.find((n) => n.id === aId);
  const b = nodes.find((n) => n.id === bId);
  if (!a || !b) return nodes;
  // can't swap a node with its own ancestor/descendant
  if (
    wouldCreateCycle(a.id, b.data.parentId, nodes) ||
    wouldCreateCycle(b.id, a.data.parentId, nodes)
  ) {
    return nodes;
  }
  return nodes.map((n) => {
    if (n.id === a.id)
      return { ...n, data: { ...n.data, parentId: b.data.parentId, order: b.data.order } };
    if (n.id === b.id)
      return { ...n, data: { ...n.data, parentId: a.data.parentId, order: a.data.order } };
    return n;
  });
}

/** delete a node + its primary subtree; strip the removed ids from survivors' shared links */
export function deleteNode(nodeId: string, nodes: PCFFlowNode[]): PCFFlowNode[] {
  const toRemove = new Set<string>([nodeId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of nodes) {
      if (n.data.parentId && toRemove.has(n.data.parentId) && !toRemove.has(n.id)) {
        toRemove.add(n.id);
        changed = true;
      }
    }
  }
  return nodes
    .filter((n) => !toRemove.has(n.id))
    .map((n) => {
      const shared = (n.data.sharedParentIds ?? []).filter((p) => !toRemove.has(p));
      const alloc = { ...(n.data.parentAllocations ?? {}) };
      for (const id of toRemove) delete alloc[id];
      return { ...n, data: { ...n.data, sharedParentIds: shared, parentAllocations: alloc } };
    });
}

/** add `parentId` as a shared (extra) parent of `childId` */
export function addSharedParent(
  childId: string,
  parentId: string,
  nodes: PCFFlowNode[],
): PCFFlowNode[] {
  const child = nodes.find((n) => n.id === childId);
  if (!child) return nodes;
  if (child.data.parentId === parentId) return nodes; // already the primary parent
  if ((child.data.sharedParentIds ?? []).includes(parentId)) return nodes;
  if (wouldCreateCycle(childId, parentId, nodes)) return nodes;
  return nodes.map((n) =>
    n.id === childId
      ? { ...n, data: { ...n.data, sharedParentIds: [...(n.data.sharedParentIds ?? []), parentId] } }
      : n,
  );
}

export function removeSharedParent(
  childId: string,
  parentId: string,
  nodes: PCFFlowNode[],
): PCFFlowNode[] {
  return nodes.map((n) => {
    if (n.id !== childId) return n;
    const alloc = { ...(n.data.parentAllocations ?? {}) };
    delete alloc[parentId];
    return {
      ...n,
      data: {
        ...n.data,
        sharedParentIds: (n.data.sharedParentIds ?? []).filter((p) => p !== parentId),
        parentAllocations: alloc,
      },
    };
  });
}

export function setAllocationWeight(
  childId: string,
  parentId: string,
  weight: number,
  nodes: PCFFlowNode[],
): PCFFlowNode[] {
  return nodes.map((n) =>
    n.id === childId
      ? {
          ...n,
          data: {
            ...n.data,
            parentAllocations: { ...(n.data.parentAllocations ?? {}), [parentId]: Math.max(0, weight) },
          },
        }
      : n,
  );
}

// ─── node factory + add helpers ───
export function blankNodeData(overrides: Partial<PCFNodeData> = {}): PCFNodeData {
  return {
    name: "New Node",
    type: "Process",
    scope: "Scope 3",
    quantity: 0,
    unit: "kg",
    emissionFactor: 0,
    emissionFactorUnit: "kgCO2e/kg",
    supplier: "",
    location: "",
    notes: "",
    parentId: null,
    order: 0,
    sharedParentIds: [],
    ...overrides,
  };
}

export function makeNode(
  position: { x: number; y: number },
  overrides: Partial<PCFNodeData> = {},
): PCFFlowNode {
  return { id: genId(), type: "pcf", position, data: blankNodeData(overrides) };
}

export function addChildNode(
  parentId: string,
  nodes: PCFFlowNode[],
): { nodes: PCFFlowNode[]; newId: string } {
  const order = childrenOf(parentId, nodes).length;
  const node = makeNode({ x: 0, y: 0 }, { parentId, order });
  return { nodes: [...nodes, node], newId: node.id };
}

export function addSiblingNode(
  refId: string,
  position: "before" | "after",
  nodes: PCFFlowNode[],
): { nodes: PCFFlowNode[]; newId: string } {
  const ref = nodes.find((n) => n.id === refId);
  if (!ref) return { nodes, newId: "" };
  const order = position === "before" ? ref.data.order - 0.5 : ref.data.order + 0.5;
  const node = makeNode({ x: 0, y: 0 }, { parentId: ref.data.parentId, order });
  let updated = [...nodes, node];
  updated = reorderSiblings(ref.data.parentId, updated);
  return { nodes: updated, newId: node.id };
}

// ─── tidy tree layout over the primary tree ───
const COL_W = 290;
const ROW_H = 200;
const ROOT_GAP = COL_W;
export function treeLayout(nodes: PCFFlowNode[]): PCFFlowNode[] {
  const pos = new Map<string, { x: number; y: number }>();
  let cursor = 0;
  const place = (id: string, depth: number) => {
    const kids = childrenOf(id, nodes);
    let x: number;
    if (kids.length === 0) {
      x = cursor;
      cursor += COL_W;
    } else {
      kids.forEach((k) => place(k.id, depth + 1));
      x = (pos.get(kids[0].id)!.x + pos.get(kids[kids.length - 1].id)!.x) / 2;
    }
    pos.set(id, { x, y: depth * ROW_H });
  };
  for (const root of rootNodes(nodes)) {
    place(root.id, 0);
    cursor += ROOT_GAP;
  }
  return nodes.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position }));
}

// ─── default lifecycle template ───
export function defaultTemplate(): PCFFlowDocument {
  const product = makeNode({ x: 0, y: 0 }, {
    name: "Product", type: "Product", scope: "Scope 1", quantity: 1, unit: "unit",
    parentId: null, order: 0,
  });
  const stepSpecs: { name: string; type: PCFNodeType; scope: PCFScope }[] = [
    { name: "Raw Materials", type: "Lifecycle Step", scope: "Scope 3" },
    { name: "Manufacturing", type: "Lifecycle Step", scope: "Scope 1" },
    { name: "Packaging", type: "Lifecycle Step", scope: "Scope 3" },
    { name: "Transport", type: "Transport", scope: "Scope 3" },
    { name: "Use Phase", type: "Lifecycle Step", scope: "Scope 2" },
    { name: "End of Life", type: "Waste", scope: "Scope 3" },
  ];
  const steps = stepSpecs.map((s, i) =>
    makeNode({ x: 0, y: 0 }, { ...s, parentId: product.id, order: i }),
  );

  // shared "Grid Electricity": primary under Manufacturing, also shared by Use Phase
  const shared = makeNode({ x: 0, y: 0 }, {
    name: "Grid Electricity", type: "Energy", scope: "Scope 2",
    quantity: 500, unit: "kWh", emissionFactor: 0.4, emissionFactorUnit: "kgCO2e/kWh",
    parentId: steps[1].id, order: 0, sharedParentIds: [steps[4].id],
  });

  const nodes = treeLayout([product, ...steps, shared]);
  return { productName: "My Product", nodes };
}

// ─── migration ───
// Older formats stored relationships in a separate `edges:[{source,target,allocation}]`
// array with no parentId on the node data. Convert any such document to the
// current parentId/order/sharedParentIds model so existing saves/exports keep working.
interface LegacyEdge {
  id?: string;
  source: string;
  target: string;
  allocation?: number;
}

export function migrateNodes(rawNodes: unknown[], rawEdges?: LegacyEdge[]): PCFFlowNode[] {
  const nodes: PCFFlowNode[] = (rawNodes as PCFFlowNode[]).map((n) => ({
    ...n,
    type: "pcf",
    position: n.position ?? { x: 0, y: 0 },
    data: {
      ...n.data,
      parentId: n.data?.parentId ?? null,
      order: n.data?.order ?? 0,
      sharedParentIds: n.data?.sharedParentIds ?? [],
    },
  }));

  if (Array.isArray(rawEdges) && rawEdges.length) {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const incoming = new Map<string, LegacyEdge[]>();
    for (const e of rawEdges) {
      if (!byId.has(e.source) || !byId.has(e.target)) continue;
      const arr = incoming.get(e.target) ?? [];
      arr.push(e);
      incoming.set(e.target, arr);
    }
    for (const [target, es] of incoming) {
      const node = byId.get(target)!;
      const [primary, ...shared] = es;
      node.data.parentId = primary.source;
      node.data.sharedParentIds = shared.map((e) => e.source);
      const alloc: Record<string, number> = {};
      for (const e of es) if (typeof e.allocation === "number") alloc[e.source] = e.allocation;
      if (Object.keys(alloc).length) node.data.parentAllocations = alloc;
    }
    // assign sibling order within each parent group
    const byParent = new Map<string | null, PCFFlowNode[]>();
    for (const n of nodes) {
      const p = n.data.parentId;
      const a = byParent.get(p) ?? [];
      a.push(n);
      byParent.set(p, a);
    }
    for (const [, group] of byParent) group.forEach((n, i) => (n.data.order = i));
  }

  // drop dangling parent / shared links
  const ids = new Set(nodes.map((n) => n.id));
  for (const n of nodes) {
    if (n.data.parentId && !ids.has(n.data.parentId)) n.data.parentId = null;
    n.data.sharedParentIds = (n.data.sharedParentIds ?? []).filter((p) => ids.has(p) && p !== n.id);
  }
  return nodes;
}

// ─── persistence ───
export const flowStore = {
  load(): PCFFlowDocument | null {
    try {
      const raw = localStorage.getItem(PCF_FLOW_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.nodes)) return null;
      const nodes = migrateNodes(parsed.nodes, parsed.edges);
      return { productName: parsed.productName ?? "My Product", nodes: treeLayout(nodes) };
    } catch {
      return null;
    }
  },
  save(doc: PCFFlowDocument) {
    localStorage.setItem(PCF_FLOW_STORAGE_KEY, JSON.stringify(doc));
  },
};

// ─── import / export ───
export function exportJSON(doc: PCFFlowDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function parseImportJSON(raw: string): PCFFlowDocument | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.nodes)) return null;
    const nodes = migrateNodes(parsed.nodes, parsed.edges);
    return { productName: parsed.productName ?? "Imported Product", nodes: treeLayout(nodes) };
  } catch {
    return null;
  }
}
