export type Pillar =
  | "ESG"
  | "Green Energy"
  | "Green Tech"
  | "Electric Mobility"
  | "Policy & Regulation"
  | "Green Finance & Markets";

export type NewsStatus = "pending" | "approved" | "rejected";
export type Priority = "low" | "medium" | "high";
export type Visibility = "public" | "internal" | "hidden";

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
  /** @deprecated legacy single-assignment field; kept for backward compat */
  assignedTo: number | null;
  status: NewsStatus;
  category?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  newsId: number;
  orgId: number;
  category: string;
  topic: string;
  tags: string[];
  priority: Priority;
  displayOrder: number;
  visibility: Visibility;
  notes: string;
  assignedAt: string;
}

export interface ActivityEvent {
  id: string;
  type: "approved" | "rejected" | "assigned" | "unassigned" | "edited" | "deleted" | "fetched";
  at: string;
  message: string;
}
