// Environment Dashboard — shared demo datasets (client-side dummy data, ready to be swapped for API calls).

export const kpiTiles = [
  { label: "Total Emission", value: "271,874.7", unit: "tCO₂e", delta: "+6% YoY", trend: "up" as const, tone: "primary" as const, progress: 64 },
  { label: "Carbon Intensity", value: "521.34", unit: "tCO₂e / unit", delta: "-3.2% vs target", trend: "down" as const, tone: "info" as const, progress: 78 },
  { label: "Green Energy", value: "20,399.6", unit: "MWh", delta: "+11% YoY", trend: "up" as const, tone: "primary" as const, progress: 71 },
  { label: "Goals On Track", value: "1", unit: "of 3", delta: "2 need attention", trend: "flat" as const, tone: "warning" as const, progress: 33 },
  { label: "YoY Growth", value: "6%", unit: "emission prediction", delta: "within budget", trend: "up" as const, tone: "info" as const, progress: 60 },
];

export const emissionsByScope = [
  { name: "Scope 1", value: 98400 },
  { name: "Scope 2", value: 112600 },
  { name: "Scope 3", value: 60874 },
];

export const scopeColors: Record<string, string> = {
  "Scope 1": "hsl(var(--primary))",
  "Scope 2": "hsl(var(--info))",
  "Scope 3": "hsl(var(--warning))",
};

export const scopeTrend = [
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
  Recycled: "hsl(var(--primary))",
  Landfill: "hsl(var(--destructive))",
  Incinerated: "hsl(var(--warning))",
  Composted: "hsl(var(--info))",
};

export const wasteMonthly = [
  { month: "Q1", recycled: 140, landfill: 68, other: 44 },
  { month: "Q2", recycled: 158, landfill: 61, other: 41 },
  { month: "Q3", recycled: 166, landfill: 57, other: 38 },
  { month: "Q4", recycled: 156, landfill: 54, other: 36 },
];

export const facilityEmissions = [
  { facility: "Berlin HQ", value: 42300, share: 16 },
  { facility: "Osaka Plant", value: 56800, share: 21 },
  { facility: "Austin Campus", value: 39100, share: 14 },
  { facility: "Pune Center", value: 48600, share: 18 },
  { facility: "Rotterdam Ops", value: 31700, share: 12 },
  { facility: "Other sites", value: 53374, share: 19 },
];

export const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 10,
    fontSize: 12,
    color: "hsl(var(--popover-foreground))",
    boxShadow: "var(--shadow-elevated)",
  },
  itemStyle: { color: "hsl(var(--popover-foreground))" },
  labelStyle: { color: "hsl(var(--muted-foreground))", fontWeight: 600 },
};
