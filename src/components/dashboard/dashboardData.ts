// Environment Dashboard — shared demo datasets (client-side dummy data, ready to be swapped for API calls).

import type { DashboardFilters, FilterPeriod, ScopeKey } from "@/lib/dashboardLayout";

/** Annual (current FY) emissions per scope, tCO₂e — these sum to the Total Emission KPI. */
export const emissionsByScope: { name: ScopeKey; value: number }[] = [
  { name: "Scope 1", value: 98400 },
  { name: "Scope 2", value: 112600 },
  { name: "Scope 3", value: 60874 },
];

/** Categorical chart palette — CSS tokens validated for colour-blind separation in both themes. */
export const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"] as const;

export const scopeColors: Record<ScopeKey, string> = {
  "Scope 1": chartColors[0],
  "Scope 2": chartColors[1],
  "Scope 3": chartColors[2],
};

// Monthly profile per scope; normalised below so each scope's 12 months add up to its annual total.
const scopeProfile = [
  { month: "Jan", "Scope 1": 7600, "Scope 2": 8900, "Scope 3": 4800 },
  { month: "Feb", "Scope 1": 7200, "Scope 2": 9300, "Scope 3": 5100 },
  { month: "Mar", "Scope 1": 8100, "Scope 2": 8600, "Scope 3": 4600 },
  { month: "Apr", "Scope 1": 7900, "Scope 2": 9100, "Scope 3": 5300 },
  { month: "May", "Scope 1": 7400, "Scope 2": 8800, "Scope 3": 4900 },
  { month: "Jun", "Scope 1": 7000, "Scope 2": 9500, "Scope 3": 5200 },
  { month: "Jul", "Scope 1": 6800, "Scope 2": 9000, "Scope 3": 5400 },
  { month: "Aug", "Scope 1": 7100, "Scope 2": 8700, "Scope 3": 5000 },
  { month: "Sep", "Scope 1": 6600, "Scope 2": 9200, "Scope 3": 4700 },
  { month: "Oct", "Scope 1": 6900, "Scope 2": 8400, "Scope 3": 5100 },
  { month: "Nov", "Scope 1": 6400, "Scope 2": 8900, "Scope 3": 4800 },
  { month: "Dec", "Scope 1": 6100, "Scope 2": 8100, "Scope 3": 4500 },
];

export type ScopeMonth = { month: string } & Record<ScopeKey, number>;

export const scopeTrend: ScopeMonth[] = (() => {
  const scopes = emissionsByScope.map((s) => s.name);
  const factors = Object.fromEntries(
    emissionsByScope.map((s) => [s.name, s.value / scopeProfile.reduce((sum, m) => sum + m[s.name], 0)]),
  ) as Record<ScopeKey, number>;
  const rows = scopeProfile.map((m) => {
    const row = { month: m.month } as ScopeMonth;
    scopes.forEach((scope) => (row[scope] = Math.round(m[scope] * factors[scope])));
    return row;
  });
  // absorb rounding drift in the latest month so the year reconciles exactly
  const last = rows[rows.length - 1];
  emissionsByScope.forEach((s) => (last[s.name] += s.value - rows.reduce((sum, r) => sum + r[s.name], 0)));
  return rows;
})();

export const periodMonths: Record<FilterPeriod, number> = { "12m": 12, "6m": 6, "3m": 3 };

export const periodLabels: Record<FilterPeriod, string> = {
  "12m": "FY 2026 (12 months)",
  "6m": "Last 6 months",
  "3m": "Last quarter",
};

/** Keep the trailing months of a monthly series that fall inside the selected period. */
export function sliceByPeriod<T>(rows: T[], period: FilterPeriod): T[] {
  return rows.slice(-periodMonths[period]);
}

/** Emissions per scope summed over the selected period and scopes. */
export function scopeTotals(filters: DashboardFilters): { name: ScopeKey; value: number }[] {
  const months = sliceByPeriod(scopeTrend, filters.period);
  return filters.scopes.map((scope) => ({ name: scope, value: months.reduce((sum, m) => sum + m[scope], 0) }));
}

export const monthlyTotals = scopeTrend.map((m) => ({ month: m.month, value: m["Scope 1"] + m["Scope 2"] + m["Scope 3"] }));

export const carbonIntensity = [
  { year: "2021", intensity: 640, target: 620 },
  { year: "2022", intensity: 610, target: 580 },
  { year: "2023", intensity: 585, target: 540 },
  { year: "2024", intensity: 558, target: 500 },
  { year: "2025", intensity: 534, target: 470 },
  { year: "2026", intensity: 521, target: 450 },
];

export const greenEnergyMonthly = [
  { month: "Jan", mwh: 1450, renewableShare: 61 },
  { month: "Feb", mwh: 1520, renewableShare: 63 },
  { month: "Mar", mwh: 1680, renewableShare: 66 },
  { month: "Apr", mwh: 1740, renewableShare: 68 },
  { month: "May", mwh: 1810, renewableShare: 70 },
  { month: "Jun", mwh: 1905, renewableShare: 73 },
  { month: "Jul", mwh: 1880, renewableShare: 72 },
  { month: "Aug", mwh: 1840, renewableShare: 71 },
  { month: "Sep", mwh: 1795, renewableShare: 69 },
  { month: "Oct", mwh: 1700, renewableShare: 67 },
  { month: "Nov", mwh: 1620, renewableShare: 64 },
  { month: "Dec", mwh: 1560, renewableShare: 62 },
];

export const waterStats = [
  { label: "Withdrawal", value: "48,200", unit: "m³", delta: "-4% YoY" },
  { label: "Discharge", value: "31,600", unit: "m³", delta: "-2% YoY" },
  { label: "Consumption", value: "16,600", unit: "m³", delta: "-8% YoY" },
  { label: "Recycled", value: "37%", unit: "of total", delta: "+5 pts" },
];

export const waterBreakdown = [
  { site: "Berlin", withdrawal: 12400, recycled: 41 },
  { site: "Osaka", withdrawal: 10900, recycled: 36 },
  { site: "Austin", withdrawal: 9800, recycled: 33 },
  { site: "Pune", withdrawal: 8300, recycled: 39 },
  { site: "Rotterdam", withdrawal: 6800, recycled: 34 },
];

export const wasteAnalytics = [
  { name: "Recycled", value: 620 },
  { name: "Landfill", value: 240 },
  { name: "Incinerated", value: 110 },
  { name: "Composted", value: 90 },
];

export const wasteColors: Record<string, string> = {
  Recycled: chartColors[0],
  Composted: chartColors[1],
  Landfill: chartColors[2],
  Incinerated: chartColors[3],
};

export const wasteQuarterly = [
  { quarter: "Q1", Recycled: 140, Composted: 21, Landfill: 68, Incinerated: 29 },
  { quarter: "Q2", Recycled: 158, Composted: 23, Landfill: 61, Incinerated: 27 },
  { quarter: "Q3", Recycled: 166, Composted: 24, Landfill: 57, Incinerated: 28 },
  { quarter: "Q4", Recycled: 156, Composted: 22, Landfill: 54, Incinerated: 26 },
];

export const facilityEmissions = [
  { facility: "Berlin HQ", value: 42300, share: 16 },
  { facility: "Osaka Plant", value: 56800, share: 21 },
  { facility: "Austin Campus", value: 39100, share: 14 },
  { facility: "Pune Center", value: 48600, share: 18 },
  { facility: "Rotterdam Ops", value: 31700, share: 12 },
  { facility: "Other sites", value: 53374, share: 19 },
];

export type KpiTone = "good" | "bad" | "neutral";

export interface KpiTile {
  id: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
  direction: "up" | "down" | "flat";
  /** whether the movement is favourable for sustainability */
  tone: KpiTone;
  spark: number[];
}

export const kpiTiles: KpiTile[] = [
  { id: "total", label: "Total Emission", value: "271,874.7", unit: "tCO₂e", delta: "6% YoY", direction: "up", tone: "bad", spark: monthlyTotals.map((m) => m.value) },
  { id: "intensity", label: "Carbon Intensity", value: "521.34", unit: "tCO₂e / unit", delta: "3.2% vs LY", direction: "down", tone: "good", spark: carbonIntensity.map((c) => c.intensity) },
  { id: "green", label: "Green Energy", value: "20,399.6", unit: "MWh", delta: "11% YoY", direction: "up", tone: "good", spark: greenEnergyMonthly.map((g) => g.mwh) },
  { id: "goals", label: "Goals On Track", value: "1", unit: "of 3", delta: "2 need attention", direction: "flat", tone: "neutral", spark: [] },
  { id: "growth", label: "YoY Growth", value: "6%", unit: "emission forecast", delta: "Within budget", direction: "flat", tone: "neutral", spark: [] },
];
