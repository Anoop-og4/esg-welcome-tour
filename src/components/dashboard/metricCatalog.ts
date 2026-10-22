// Data sources available to user-created widgets. Each metric declares its shape once
// (time series vs. categories, series, unit, aggregation) and the visuals that suit it,
// so the builder, the assistant and the renderer all agree on what is valid.

import type { DashboardFilters, ScopeKey } from "@/lib/dashboardLayout";
import type { CustomVisual } from "@/lib/dashboardLibrary";
import * as data from "./dashboardData";

export type MetricCategory = "Emissions" | "Energy" | "Resources";

export interface MetricSeries {
  key: string;
  label: string;
  color: string;
}

export type MetricRow = Record<string, string | number>;

export interface MetricDef {
  id: string;
  label: string;
  description: string;
  category: MetricCategory;
  unit: string;
  /** time = ordered periods on x; category = unordered items (sites, facilities) */
  kind: "time" | "category";
  xKey: string;
  series: MetricSeries[];
  /** how a series collapses to one number for stat tiles and donut slices */
  aggregate: "sum" | "average" | "latest";
  periodAware: boolean;
  /** series are emission scopes and follow the dashboard scope filter */
  scopeAware?: boolean;
  visuals: CustomVisual[];
  rows: (filters: DashboardFilters) => MetricRow[];
}

const single = (key: string, label: string): MetricSeries[] => [{ key, label, color: data.chartColors[0] }];
const quarters = { "12m": 4, "6m": 2, "3m": 1 } as const;

export const METRICS: MetricDef[] = [
  {
    id: "scope-emissions",
    label: "Emissions by scope (monthly)",
    description: "Scope 1, 2 and 3 emissions per month",
    category: "Emissions",
    unit: "tCO₂e",
    kind: "time",
    xKey: "month",
    series: (["Scope 1", "Scope 2", "Scope 3"] as ScopeKey[]).map((s) => ({ key: s, label: s, color: data.scopeColors[s] })),
    aggregate: "sum",
    periodAware: true,
    scopeAware: true,
    visuals: ["line", "area", "bar", "donut", "stat"],
    rows: (f) => data.sliceByPeriod(data.scopeTrend, f.period),
  },
  {
    id: "total-emissions",
    label: "Total emissions (monthly)",
    description: "Combined footprint of the selected scopes",
    category: "Emissions",
    unit: "tCO₂e",
    kind: "time",
    xKey: "month",
    series: single("total", "Total emissions"),
    aggregate: "sum",
    periodAware: true,
    scopeAware: true,
    visuals: ["area", "line", "bar", "stat"],
    rows: (f) => data.sliceByPeriod(data.scopeTrend, f.period).map((m) => ({ month: m.month, total: f.scopes.reduce((sum, s) => sum + m[s], 0) })),
  },
  {
    id: "carbon-intensity",
    label: "Carbon intensity vs target",
    description: "Annual intensity against the reduction pathway",
    category: "Emissions",
    unit: "tCO₂e/unit",
    kind: "time",
    xKey: "year",
    series: [
      { key: "intensity", label: "Intensity", color: data.chartColors[0] },
      { key: "target", label: "Target", color: data.chartColors[1] },
    ],
    aggregate: "latest",
    periodAware: false,
    visuals: ["line", "area", "bar", "stat"],
    rows: () => data.carbonIntensity,
  },
  {
    id: "facility-emissions",
    label: "Emissions by facility",
    description: "Footprint per operating site",
    category: "Emissions",
    unit: "tCO₂e",
    kind: "category",
    xKey: "facility",
    series: single("value", "Emissions"),
    aggregate: "sum",
    periodAware: false,
    visuals: ["bar", "donut", "stat"],
    rows: () => [...data.facilityEmissions].sort((a, b) => b.value - a.value),
  },
  {
    id: "green-energy",
    label: "Green energy generated",
    description: "Renewable electricity per month",
    category: "Energy",
    unit: "MWh",
    kind: "time",
    xKey: "month",
    series: single("mwh", "Green energy"),
    aggregate: "sum",
    periodAware: true,
    visuals: ["area", "line", "bar", "stat"],
    rows: (f) => data.sliceByPeriod(data.greenEnergyMonthly, f.period),
  },
  {
    id: "renewable-share",
    label: "Renewable share",
    description: "Share of electricity from renewable sources",
    category: "Energy",
    unit: "%",
    kind: "time",
    xKey: "month",
    series: single("renewableShare", "Renewable share"),
    aggregate: "average",
    periodAware: true,
    visuals: ["line", "area", "bar", "stat"],
    rows: (f) => data.sliceByPeriod(data.greenEnergyMonthly, f.period),
  },
  {
    id: "water-withdrawal",
    label: "Water withdrawal by site",
    description: "Annual withdrawal per facility",
    category: "Resources",
    unit: "m³",
    kind: "category",
    xKey: "site",
    series: single("withdrawal", "Withdrawal"),
    aggregate: "sum",
    periodAware: false,
    visuals: ["bar", "donut", "stat"],
    rows: () => data.waterBreakdown,
  },
  {
    id: "water-recycling",
    label: "Water recycling rate by site",
    description: "Share of water recycled per facility",
    category: "Resources",
    unit: "%",
    kind: "category",
    xKey: "site",
    series: single("recycled", "Recycled"),
    aggregate: "average",
    periodAware: false,
    visuals: ["bar", "stat"],
    rows: () => data.waterBreakdown,
  },
  {
    id: "waste-streams",
    label: "Waste by disposal route",
    description: "Quarterly tonnes recycled, composted, landfilled and incinerated",
    category: "Resources",
    unit: "t",
    kind: "time",
    xKey: "quarter",
    series: ["Recycled", "Composted", "Landfill", "Incinerated"].map((k) => ({ key: k, label: k, color: data.wasteColors[k] })),
    aggregate: "sum",
    periodAware: true,
    visuals: ["bar", "donut", "area", "line", "stat"],
    rows: (f) => data.wasteQuarterly.slice(-quarters[f.period]),
  },
];

const byId = new Map(METRICS.map((m) => [m.id, m]));
export const getMetric = (id: string): MetricDef | undefined => byId.get(id);

export const VISUAL_LABELS: Record<CustomVisual, string> = {
  line: "Line",
  area: "Area",
  bar: "Bar",
  donut: "Donut",
  stat: "KPI",
};

/** Series actually shown: the spec's selection (or all), narrowed by the scope filter for scope metrics. */
export function activeSeries(metric: MetricDef, selected: string[], filters: DashboardFilters): MetricSeries[] {
  let list = selected.length ? metric.series.filter((s) => selected.includes(s.key)) : metric.series;
  if (!list.length) list = metric.series;
  if (metric.id === "scope-emissions") {
    const scoped = list.filter((s) => filters.scopes.includes(s.key as ScopeKey));
    if (scoped.length) list = scoped;
  }
  return list;
}

export function aggregateSeries(metric: MetricDef, rows: MetricRow[], key: string): number {
  const values = rows.map((r) => Number(r[key]) || 0);
  if (!values.length) return 0;
  if (metric.aggregate === "latest") return values[values.length - 1];
  const sum = values.reduce((a, b) => a + b, 0);
  return metric.aggregate === "average" ? sum / values.length : sum;
}
