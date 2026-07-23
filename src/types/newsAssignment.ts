export type Pillar =
  | "ESG"
  | "Green Energy"
  | "Green Tech"
  | "Electric Mobility"
  | "Policy & Regulation"
  | "Green Finance & Markets";

export interface Organization {
  id: number;
  name: string;
  industry: string;
}

export interface News {
  id: number;
  title: string;
  source: string;
  published: string; // ISO
  pillar: Pillar;
  relevance: 1 | 2 | 3 | 4 | 5;
  summary: string;
  assignedTo: number | null;
}
