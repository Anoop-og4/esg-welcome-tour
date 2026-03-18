// ─────────────────────────────────────────────
//  ESG SYSTEM — Data Models & Type Definitions
// ─────────────────────────────────────────────

export type Category = "Energy" | "Tech" | "Manufacturing" | "Finance" | "Logistics";
export type Severity = "Low" | "Medium" | "High";
export type IssueStatus = "Open" | "In Progress" | "Resolved";
export type IssueType =
  | "Carbon Emission"
  | "Labor Practices"
  | "Water Usage"
  | "Supply Chain"
  | "Board Diversity"
  | "Data Privacy"
  | "Waste Management";

// ── ESG Issue ───────────────────────────────
export interface ESGIssue {
  id: string;
  type: IssueType;
  severity: Severity;
  status: IssueStatus;
  description: string;
  detectedAt: string; // ISO date
}

// ── ESG Metrics ─────────────────────────────
export interface ESGMetrics {
  environmental: number; // 0–100
  social: number;        // 0–100
  governance: number;    // 0–100
  overall: number;       // computed avg
}

// ── Company ─────────────────────────────────
export interface Company {
  id: string;
  name: string;
  sector: string;
  country: string;
  foundedYear: number;
}

// ── Asset ────────────────────────────────────
export interface Asset {
  id: string;
  name: string;
  companyId: string;
  category: Category;
  esgScore: number;          // 0–100
  dataCompleteness: number;  // 0–100 %
  lastUpdated: string;       // ISO date
  issuesCount: number;
  issues: ESGIssue[];
  metrics: ESGMetrics;
}

// ── Ranked Asset (output of ranking fn) ──────
export interface RankedAsset extends Asset {
  compositeScore: number;
  rank: number;
  freshnesScore: number;
}

// ── ESG Entity (union view) ──────────────────
export interface ESGEntity {
  company: Company;
  assets: Asset[];
}

// ── Companies ────────────────────────────────
export const COMPANIES: Company[] = [
  { id: "c1", name: "Orion Energy", sector: "Energy", country: "Germany", foundedYear: 1994 },
  { id: "c2", name: "Nexus Technologies", sector: "Tech", country: "USA", foundedYear: 2001 },
  { id: "c3", name: "Titan Manufacturing", sector: "Manufacturing", country: "Japan", foundedYear: 1978 },
  { id: "c4", name: "Apex Logistics", sector: "Logistics", country: "Singapore", foundedYear: 2005 },
  { id: "c5", name: "Summit Finance", sector: "Finance", country: "UK", foundedYear: 1987 },
  { id: "c6", name: "Verdant Power", sector: "Energy", country: "Sweden", foundedYear: 2010 },
  { id: "c7", name: "CoreTech Solutions", sector: "Tech", country: "India", foundedYear: 2015 },
];

// ── Issues per Asset ─────────────────────────
const orionIssues: ESGIssue[] = [
  { id: "i1", type: "Carbon Emission", severity: "High", status: "Open", description: "Scope 3 emissions exceed sector threshold by 18%", detectedAt: "2025-10-14" },
  { id: "i2", type: "Water Usage", severity: "Medium", status: "In Progress", description: "Plant water intensity up 12% YoY", detectedAt: "2025-11-02" },
];

const nexusIssues: ESGIssue[] = [
  { id: "i3", type: "Data Privacy", severity: "Medium", status: "Resolved", description: "GDPR audit flagged 3 non-compliant data flows", detectedAt: "2025-09-01" },
];

const titanIssues: ESGIssue[] = [
  { id: "i4", type: "Labor Practices", severity: "High", status: "Open", description: "Overtime violations at Osaka facility", detectedAt: "2025-10-22" },
  { id: "i5", type: "Waste Management", severity: "High", status: "Open", description: "Industrial waste disposal not meeting ISO 14001", detectedAt: "2025-11-10" },
  { id: "i6", type: "Carbon Emission", severity: "Medium", status: "In Progress", description: "Carbon intensity target missed by 9%", detectedAt: "2025-12-01" },
];

const apexIssues: ESGIssue[] = [
  { id: "i7", type: "Supply Chain", severity: "Medium", status: "In Progress", description: "3 tier-2 suppliers lack ESG certifications", detectedAt: "2025-11-18" },
];

const summitIssues: ESGIssue[] = [
  { id: "i8", type: "Board Diversity", severity: "Low", status: "Open", description: "Board gender diversity below 30% target", detectedAt: "2025-10-05" },
  { id: "i9", type: "Data Privacy", severity: "Low", status: "Resolved", description: "Minor audit trail gap patched", detectedAt: "2025-08-12" },
];

const verdantIssues: ESGIssue[] = [];

const coretechIssues: ESGIssue[] = [
  { id: "i10", type: "Labor Practices", severity: "Low", status: "In Progress", description: "Contractor pay equity review underway", detectedAt: "2025-12-15" },
];

// ── Assets ────────────────────────────────────
export const ASSETS: Asset[] = [
  {
    id: "a1",
    name: "Orion Energy Portfolio",
    companyId: "c1",
    category: "Energy",
    esgScore: 62,
    dataCompleteness: 74,
    lastUpdated: "2025-12-10",
    issuesCount: orionIssues.length,
    issues: orionIssues,
    metrics: { environmental: 55, social: 68, governance: 71, overall: 62 },
  },
  {
    id: "a2",
    name: "Nexus Cloud Infrastructure",
    companyId: "c2",
    category: "Tech",
    esgScore: 81,
    dataCompleteness: 96,
    lastUpdated: "2026-01-15",
    issuesCount: nexusIssues.length,
    issues: nexusIssues,
    metrics: { environmental: 79, social: 85, governance: 79, overall: 81 },
  },
  {
    id: "a3",
    name: "Titan Heavy Manufacturing",
    companyId: "c3",
    category: "Manufacturing",
    esgScore: 48,
    dataCompleteness: 61,
    lastUpdated: "2025-10-28",
    issuesCount: titanIssues.length,
    issues: titanIssues,
    metrics: { environmental: 42, social: 44, governance: 58, overall: 48 },
  },
  {
    id: "a4",
    name: "Apex Supply Chain",
    companyId: "c4",
    category: "Logistics",
    esgScore: 70,
    dataCompleteness: 83,
    lastUpdated: "2025-12-28",
    issuesCount: apexIssues.length,
    issues: apexIssues,
    metrics: { environmental: 66, social: 72, governance: 74, overall: 70 },
  },
  {
    id: "a5",
    name: "Summit Capital Fund",
    companyId: "c5",
    category: "Finance",
    esgScore: 76,
    dataCompleteness: 88,
    lastUpdated: "2026-01-05",
    issuesCount: summitIssues.length,
    issues: summitIssues,
    metrics: { environmental: 70, social: 75, governance: 83, overall: 76 },
  },
  {
    id: "a6",
    name: "Verdant Renewable Grid",
    companyId: "c6",
    category: "Energy",
    esgScore: 91,
    dataCompleteness: 98,
    lastUpdated: "2026-01-20",
    issuesCount: verdantIssues.length,
    issues: verdantIssues,
    metrics: { environmental: 96, social: 88, governance: 89, overall: 91 },
  },
  {
    id: "a7",
    name: "CoreTech SaaS Platform",
    companyId: "c7",
    category: "Tech",
    esgScore: 73,
    dataCompleteness: 79,
    lastUpdated: "2025-11-30",
    issuesCount: coretechIssues.length,
    issues: coretechIssues,
    metrics: { environmental: 68, social: 74, governance: 79, overall: 73 },
  },
];

// ── ESG Entities (company + linked assets) ────
export const ESG_ENTITIES: ESGEntity[] = COMPANIES.map((company) => ({
  company,
  assets: ASSETS.filter((a) => a.companyId === company.id),
}));

// ── Ranking Engine ────────────────────────────
/**
 * Compute data-freshness score (0–100) based on how recently the asset was updated.
 * < 30 days  → 100
 * < 90 days  → 70
 * < 180 days → 40
 * >= 180 days → 10
 */
export function computeFreshnessScore(lastUpdated: string): number {
  const now = new Date("2026-01-25"); // fixed "today" for demo
  const updated = new Date(lastUpdated);
  const daysDiff = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 30) return 100;
  if (daysDiff < 90) return 70;
  if (daysDiff < 180) return 40;
  return 10;
}

/**
 * Composite ranking formula:
 *   score = (0.4 × ESG) + (0.3 × completeness) + (0.2 × freshness) − (0.1 × issues × 10)
 *
 * Issues penalty is scaled: each issue reduces score by 1 point (issues × 10 × 0.1)
 */
export function computeCompositeScore(asset: Asset): number {
  const freshness = computeFreshnessScore(asset.lastUpdated);
  const issuesPenalty = Math.min(asset.issuesCount * 10, 50); // cap penalty at 50
  return (
    0.4 * asset.esgScore +
    0.3 * asset.dataCompleteness +
    0.2 * freshness -
    0.1 * issuesPenalty
  );
}

/** Rank all assets and return sorted RankedAsset array */
export function rankAssets(assets: Asset[]): RankedAsset[] {
  return assets
    .map((asset) => ({
      ...asset,
      compositeScore: parseFloat(computeCompositeScore(asset).toFixed(2)),
      freshnesScore: computeFreshnessScore(asset.lastUpdated),
      rank: 0, // will be assigned after sort
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((asset, idx) => ({ ...asset, rank: idx + 1 }));
}

export const RANKED_ASSETS: RankedAsset[] = rankAssets(ASSETS);