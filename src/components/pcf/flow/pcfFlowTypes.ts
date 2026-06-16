// ─── Model: a primary TREE (parentId + order) with optional SHARED parents ───
// Every node has exactly one primary parent (or null = root) which forms a
// clean tree used for layout + all drag behaviors. A node may additionally be
// linked to extra "shared" parents (the DAG feature) purely for splitting its
// emissions across multiple parents without double-counting the product total.

export type PCFNodeType =
  | "Product"
  | "Lifecycle Step"
  | "Material"
  | "Component"
  | "Process"
  | "Transport"
  | "Energy"
  | "Waste";

export type PCFScope = "Scope 1" | "Scope 2" | "Scope 3";

export interface PCFNodeData {
  name: string;
  type: PCFNodeType;
  scope: PCFScope;
  quantity: number;
  unit: string;
  emissionFactor: number;
  emissionFactorUnit: string;
  // emission-factor library provenance (stamped when picked from the library)
  factorId?: string;
  factorSource?: string;
  factorYear?: number;
  factorRegion?: string;
  supplier?: string;
  location?: string;
  notes?: string;

  // structure (source of truth)
  parentId: string | null;
  order: number;
  /** extra parents (besides parentId) that also draw on this node */
  sharedParentIds: string[];
  /** raw allocation weights per parentId; normalized at calc time. default equal */
  parentAllocations?: Record<string, number>;

  // computed at render time (not authoritative)
  selfEmission?: number;
  branchTotal?: number;
  depth?: number;
  /** share (0..1) of the product total contributed by this node's self emission */
  hotspotShare?: number;
  /** whether the canvas is currently in hotspot (heatmap) mode */
  hotspotMode?: boolean;
  [key: string]: unknown;
}

export interface PCFFlowNode {
  id: string;
  type: "pcf";
  position: { x: number; y: number };
  data: PCFNodeData;
}

export interface PCFFlowDocument {
  productName: string;
  nodes: PCFFlowNode[];
}

export const NODE_TYPES: PCFNodeType[] = [
  "Product",
  "Lifecycle Step",
  "Material",
  "Component",
  "Process",
  "Transport",
  "Energy",
  "Waste",
];

export const SCOPES: PCFScope[] = ["Scope 1", "Scope 2", "Scope 3"];

export const PCF_FLOW_STORAGE_KEY = "pcf-flow-builder-data";
