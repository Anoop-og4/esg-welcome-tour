export type ScopeType = "Scope 1" | "Scope 2" | "Scope 3";
export type Feasibility = "Quick win" | "Achievable" | "High impact";

export interface Scenario {
  id: string;
  action: string;
  scope: ScopeType;
  tco2eSaved: number;
  costDelta: number; // in Lakhs/yr; negative = saving
  costDeltaLabel: string;
  payback: string;
  targetCovered: number; // %
  feasibility: Feasibility;
  reasoning: string;
}

export const baselineCards = [
  { title: "Scope 1 Emissions", value: "1,842", unit: "tCO₂e", subtitle: "Direct combustion", trend: -4.2 },
  { title: "Scope 2 Emissions", value: "3,210", unit: "tCO₂e", subtitle: "Grid electricity", trend: 1.8 },
  { title: "Scope 3 Emissions", value: "8,940", unit: "tCO₂e", subtitle: "Supply chain", trend: -2.1 },
  { title: "Total Footprint", value: "13,992", unit: "tCO₂e", subtitle: "Combined all scopes", trend: -1.9 },
];

export const lockedTargets = [
  { scope: "Scope 1", value: "−8.5%/yr" },
  { scope: "Scope 2", value: "−12%/yr" },
  { scope: "Scope 3", value: "−6.5%/yr" },
];

export const actionTypes = [
  "Fleet electrification / CNG switch",
  "Renewable energy procurement",
  "Supplier switch (low-carbon)",
  "Business travel reduction",
  "Energy efficiency upgrade",
  "Waste reduction program",
  "Green building retrofit",
];

export const actionToScope: Record<string, ScopeType> = {
  "Fleet electrification / CNG switch": "Scope 1",
  "Renewable energy procurement": "Scope 2",
  "Supplier switch (low-carbon)": "Scope 3",
  "Business travel reduction": "Scope 3",
  "Energy efficiency upgrade": "Scope 2",
  "Waste reduction program": "Scope 3",
  "Green building retrofit": "Scope 2",
};

export const initialScenarios: Scenario[] = [
  {
    id: "s1",
    action: "Switch 40% fleet to CNG",
    scope: "Scope 1",
    tco2eSaved: 142,
    costDelta: -1.8,
    costDeltaLabel: "−₹1.8L/yr",
    payback: "2.4 yrs",
    targetCovered: 34,
    feasibility: "Achievable",
    reasoning:
      "Converting 40% of the diesel fleet to CNG reduces direct combustion emissions and fuel costs. Pilot data from logistics hubs confirms a stable 12-15% efficiency gain.",
  },
  {
    id: "s2",
    action: "Green tariff — office electricity",
    scope: "Scope 2",
    tco2eSaved: 210,
    costDelta: 3.2,
    costDeltaLabel: "+₹3.2L/yr",
    payback: "No capex",
    targetCovered: 61,
    feasibility: "Achievable",
    reasoning:
      "Switching office sites to a green tariff via the open-access route eliminates grid emissions. Slightly higher tariff is offset by RECs and avoided carbon penalty.",
  },
  {
    id: "s3",
    action: "Reduce air travel by 30%",
    scope: "Scope 3",
    tco2eSaved: 58,
    costDelta: -4.5,
    costDeltaLabel: "−₹4.5L/yr",
    payback: "Immediate",
    targetCovered: 12,
    feasibility: "Quick win",
    reasoning:
      "Replacing 30% of business air travel with virtual meetings yields immediate cost savings and emission cuts. No capex required, productivity neutral.",
  },
  {
    id: "s4",
    action: "Switch to low-carbon steel supplier",
    scope: "Scope 3",
    tco2eSaved: 390,
    costDelta: 11,
    costDeltaLabel: "+₹11L/yr",
    payback: "3.1 yrs",
    targetCovered: 78,
    feasibility: "High impact",
    reasoning:
      "Sourcing steel from an EAF-based low-carbon supplier cuts embodied emissions by ~60%. Premium pricing offset by carbon credit value and brand premium.",
  },
];

export const trajectoryData = [
  { year: "FY25", bau: 13992, scenarios: 13992, target: 13992 },
  { year: "FY26", bau: 14280, scenarios: 13100, target: 12950 },
  { year: "FY27", bau: 14510, scenarios: 12250, target: 11900 },
  { year: "FY28", bau: 14760, scenarios: 11400, target: 10850 },
  { year: "FY29", bau: 15020, scenarios: 10600, target: 9800 },
  { year: "FY30", bau: 15200, scenarios: 9800, target: 8750 },
];

export const rankings = [
  { rank: 1, name: "Reduce air travel by 30%", efficiency: 58, width: 100, chip: "Best ROI" },
  { rank: 2, name: "Switch 40% fleet to CNG", efficiency: 7.9, width: 68 },
  { rank: 3, name: "Green tariff electricity", efficiency: 4.2, width: 42 },
  { rank: 4, name: "Low-carbon steel supplier", efficiency: 3.5, width: 32 },
];

export const scopeColors: Record<ScopeType, string> = {
  "Scope 1": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Scope 2": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Scope 3": "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export const feasibilityColors: Record<Feasibility, string> = {
  "Quick win": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  Achievable: "bg-green-500/15 text-green-400 border-green-500/30",
  "High impact": "bg-blue-500/15 text-blue-400 border-blue-500/30",
};
