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

export type PCFNode = {
  id: string;
  parentId: string | null;
  name: string;
  type: PCFNodeType;
  scope: PCFScope;
  quantity: number;
  unit: string;
  emissionFactor: number;
  emissionFactorUnit: string;
  calculatedEmissions: number;
  supplier?: string;
  location?: string;
  notes?: string;
  order: number;
};

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

export const PCF_STORAGE_KEY = "pcf-builder-data";
