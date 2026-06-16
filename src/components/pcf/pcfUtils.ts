import { PCFNode, PCFNodeType, PCFScope, PCF_STORAGE_KEY } from "./pcfTypes";

let idCounter = 0;
export function genId(prefix = "node"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function calculateNodeEmission(node: PCFNode): number {
  const q = Number(node.quantity) || 0;
  const ef = Number(node.emissionFactor) || 0;
  return Math.round(q * ef * 1000) / 1000;
}

export function getChildren(nodeId: string | null, nodes: PCFNode[]): PCFNode[] {
  return nodes
    .filter((n) => n.parentId === nodeId)
    .sort((a, b) => a.order - b.order);
}

export function calculateBranchTotal(nodeId: string, nodes: PCFNode[]): number {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return 0;
  let total = calculateNodeEmission(node);
  for (const child of getChildren(nodeId, nodes)) {
    total += calculateBranchTotal(child.id, nodes);
  }
  return Math.round(total * 1000) / 1000;
}

export function calculateProductTotal(nodes: PCFNode[]): number {
  return (
    Math.round(
      nodes.reduce((sum, n) => sum + calculateNodeEmission(n), 0) * 1000,
    ) / 1000
  );
}

/** Returns true if making targetParentId the parent of nodeId would create a cycle. */
export function validateNoCycle(
  nodeId: string,
  targetParentId: string | null,
  nodes: PCFNode[],
): boolean {
  if (targetParentId === null) return true;
  if (nodeId === targetParentId) return false;
  // Walk up from target; if we reach nodeId, it's a cycle.
  let current: string | null = targetParentId;
  const map = new Map(nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  while (current) {
    if (current === nodeId) return false;
    if (seen.has(current)) break;
    seen.add(current);
    current = map.get(current)?.parentId ?? null;
  }
  return true;
}

function recalc(nodes: PCFNode[]): PCFNode[] {
  return nodes.map((n) => ({ ...n, calculatedEmissions: calculateNodeEmission(n) }));
}

function reorderSiblings(parentId: string | null, nodes: PCFNode[]): PCFNode[] {
  const siblings = getChildren(parentId, nodes);
  const orderMap = new Map(siblings.map((n, i) => [n.id, i]));
  return nodes.map((n) =>
    n.parentId === parentId && orderMap.has(n.id)
      ? { ...n, order: orderMap.get(n.id)! }
      : n,
  );
}

export function moveNode(
  nodeId: string,
  newParentId: string | null,
  newOrder: number,
  nodes: PCFNode[],
): PCFNode[] {
  if (!validateNoCycle(nodeId, newParentId, nodes)) return nodes;
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return nodes;
  const oldParentId = node.parentId;

  let updated = nodes.map((n) =>
    n.id === nodeId ? { ...n, parentId: newParentId, order: newOrder - 0.5 } : n,
  );
  updated = reorderSiblings(newParentId, updated);
  if (oldParentId !== newParentId) {
    updated = reorderSiblings(oldParentId, updated);
  }
  return recalc(updated);
}

export function swapNodes(
  nodeAId: string,
  nodeBId: string,
  nodes: PCFNode[],
): PCFNode[] {
  const a = nodes.find((n) => n.id === nodeAId);
  const b = nodes.find((n) => n.id === nodeBId);
  if (!a || !b) return nodes;
  // Prevent swapping a node with its own descendant/ancestor (would break tree)
  if (
    !validateNoCycle(a.id, b.parentId, nodes) ||
    !validateNoCycle(b.id, a.parentId, nodes)
  ) {
    return nodes;
  }
  const updated = nodes.map((n) => {
    if (n.id === a.id) return { ...n, parentId: b.parentId, order: b.order };
    if (n.id === b.id) return { ...n, parentId: a.parentId, order: a.order };
    return n;
  });
  return recalc(updated);
}

export function deleteNode(nodeId: string, nodes: PCFNode[]): PCFNode[] {
  // collect node + all descendants
  const toRemove = new Set<string>([nodeId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of nodes) {
      if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n.id)) {
        toRemove.add(n.id);
        changed = true;
      }
    }
  }
  return recalc(nodes.filter((n) => !toRemove.has(n.id)));
}

export function blankNode(parentId: string | null, order: number, overrides: Partial<PCFNode> = {}): PCFNode {
  const base: PCFNode = {
    id: genId(),
    parentId,
    name: "New Node",
    type: "Process",
    scope: "Scope 3",
    quantity: 0,
    unit: "kg",
    emissionFactor: 0,
    emissionFactorUnit: "kgCO2e/kg",
    calculatedEmissions: 0,
    supplier: "",
    location: "",
    notes: "",
    order,
    ...overrides,
  };
  base.calculatedEmissions = calculateNodeEmission(base);
  return base;
}

export function addChildNode(parentId: string, nodes: PCFNode[]): { nodes: PCFNode[]; newId: string } {
  const order = getChildren(parentId, nodes).length;
  const node = blankNode(parentId, order);
  return { nodes: [...nodes, node], newId: node.id };
}

export function addSiblingNode(
  nodeId: string,
  position: "before" | "after",
  nodes: PCFNode[],
): { nodes: PCFNode[]; newId: string } {
  const ref = nodes.find((n) => n.id === nodeId);
  if (!ref) return { nodes, newId: "" };
  const order = position === "before" ? ref.order - 0.5 : ref.order + 0.5;
  const node = blankNode(ref.parentId, order);
  let updated = [...nodes, node];
  updated = reorderSiblings(ref.parentId, updated);
  return { nodes: updated, newId: node.id };
}

export function isDescendant(
  nodeId: string,
  possibleAncestorId: string,
  nodes: PCFNode[],
): boolean {
  const map = new Map(nodes.map((n) => [n.id, n]));
  let current = map.get(nodeId)?.parentId ?? null;
  const seen = new Set<string>();
  while (current) {
    if (current === possibleAncestorId) return true;
    if (seen.has(current)) break;
    seen.add(current);
    current = map.get(current)?.parentId ?? null;
  }
  return false;
}

// ─── Default lifecycle template ───
export function defaultTemplate(): PCFNode[] {
  const product = blankNode(null, 0, {
    name: "Product",
    type: "Product",
    scope: "Scope 1",
  });
  const steps: { name: string; type: PCFNodeType; scope: PCFScope }[] = [
    { name: "Raw Materials", type: "Lifecycle Step", scope: "Scope 3" },
    { name: "Manufacturing", type: "Lifecycle Step", scope: "Scope 1" },
    { name: "Packaging", type: "Lifecycle Step", scope: "Scope 3" },
    { name: "Transport", type: "Transport", scope: "Scope 3" },
    { name: "Use Phase", type: "Lifecycle Step", scope: "Scope 2" },
    { name: "End of Life", type: "Waste", scope: "Scope 3" },
  ];
  const nodes: PCFNode[] = [product];
  steps.forEach((s, i) => {
    nodes.push(blankNode(product.id, i, s));
  });
  return nodes;
}

// ─── Persistence (localStorage abstraction) ───
export interface PCFStore {
  load(): Promise<{ productName: string; nodes: PCFNode[] } | null>;
  save(productName: string, nodes: PCFNode[]): Promise<void>;
}

export const localStorageStore: PCFStore = {
  async load() {
    try {
      const raw = localStorage.getItem(PCF_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.nodes)) return null;
      return { productName: parsed.productName ?? "My Product", nodes: parsed.nodes };
    } catch {
      return null;
    }
  },
  async save(productName, nodes) {
    localStorage.setItem(
      PCF_STORAGE_KEY,
      JSON.stringify({ productName, nodes }),
    );
  },
};

export function exportJSON(productName: string, nodes: PCFNode[]): string {
  return JSON.stringify({ productName, nodes }, null, 2);
}

export function parseImportJSON(raw: string): { productName: string; nodes: PCFNode[] } | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.nodes)) return null;
    const nodes = recalc(parsed.nodes as PCFNode[]);
    return { productName: parsed.productName ?? "Imported Product", nodes };
  } catch {
    return null;
  }
}
