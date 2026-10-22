import { Bar, BarChart, Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BarChart3, Bell, Building2, CircleDollarSign, Droplets, Factory, Gauge, Leaf, Recycle, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import * as data from "./dashboardData";

export type WidgetCategory = "KPIs" | "Emissions" | "Energy" | "Resources";

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  icon: typeof BarChart3;
  defaultSize: "small" | "medium" | "large";
  keywords: string;
  /** optional per-widget view switcher */
  chartTypes?: { value: string; label: string }[];
  Content: (props: { chartType: string }) => JSX.Element;
}

const axisProps = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const legendProps = {
  wrapperStyle: { fontSize: 11 },
  iconSize: 9,
  iconType: "circle" as const,
};

function ChartShell({ height = 260, children }: { height?: number; children: React.ReactElement }) {
  return <div style={{ height }} className="w-full">{children}</div>;
}

/* ── KPI overview ─────────────────────────────────────────── */

const toneClass = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
};

function KpiOverview() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {data.kpiTiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-border/70 bg-muted/30 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{tile.label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-foreground">{tile.value}</span>
            <span className="text-[10px] text-muted-foreground">{tile.unit}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn("text-[10px] font-semibold", tile.trend === "down" ? "text-success" : tile.trend === "up" ? "text-primary" : "text-warning")}>{tile.delta}</span>
          </div>
          <Progress value={tile.progress} className="mt-3 h-1" />
        </div>
      ))}
    </div>
  );
}

/* ── Emissions by scope ───────────────────────────────────── */

function EmissionsByScope({ chartType }: { chartType: string }) {
  const total = data.emissionsByScope.reduce((sum, s) => sum + s.value, 0);
  if (chartType === "list") {
    return (
      <div className="space-y-3">
        {data.emissionsByScope.map((scope) => (
          <div key={scope.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{scope.name}</span>
              <span className="text-muted-foreground">{scope.value.toLocaleString()} tCO₂e · {Math.round((scope.value / total) * 100)}%</span>
            </div>
            <Progress value={(scope.value / total) * 100} className="h-1.5" />
          </div>
        ))}
      </div>
    );
  }
  if (chartType === "bar") {
    return (
      <ChartShell height={230}>
        <ResponsiveContainer>
          <BarChart data={data.emissionsByScope}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
            <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} tCO₂e`, "Emissions"]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Emissions">
              {data.emissionsByScope.map((scope) => <Cell key={scope.name} fill={data.scopeColors[scope.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }
  return (
    <ChartShell height={230}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data.emissionsByScope} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3} cornerRadius={6} animationDuration={700}>
            {data.emissionsByScope.map((scope) => <Cell key={scope.name} fill={data.scopeColors[scope.name]} stroke="hsl(var(--card))" strokeWidth={2} />)}
          </Pie>
          <Legend {...legendProps} />
          <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} tCO₂e`, "Emissions"]} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/* ── Scope breakdown over time ────────────────────────────── */

function ScopeBreakdown({ chartType }: { chartType: string }) {
  const stacked = chartType === "stacked";
  return (
    <ChartShell height={250}>
      <ResponsiveContainer>
        <BarChart data={data.scopeTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" {...axisProps} interval={1} />
          <YAxis {...axisProps} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} tCO₂e`, undefined]} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
          <Legend {...legendProps} />
          {(stacked ? Object.keys(data.scopeColors) : ["Scope 1", "Scope 2"]).map((key, i) => (
            <Bar key={key} dataKey={key} stackId={stacked ? "a" : `b${i}`} fill={data.scopeColors[key]} radius={stacked && i === 2 ? [5, 5, 0, 0] : undefined} animationDuration={700} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/* ── Carbon intensity ─────────────────────────────────────── */

function CarbonIntensity({ chartType }: { chartType: string }) {
  const Chart = chartType === "line" ? LineChart : AreaChart;
  return (
    <ChartShell height={230}>
      <ResponsiveContainer>
        <Chart data={data.carbonIntensity}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="year" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v} tCO₂e/unit`, undefined]} />
          <Legend {...legendProps} />
          {chartType === "line" ? (
            <Line type="monotone" dataKey="intensity" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} animationDuration={700} />
          ) : (
            <Area type="monotone" dataKey="intensity" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="hsl(var(--primary) / 0.14)" animationDuration={700} />
          )}
          <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 5" dot={false} animationDuration={700} />
        </Chart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/* ── Green energy ─────────────────────────────────────────── */

function GreenEnergy({ chartType }: { chartType: string }) {
  if (chartType === "bar") {
    return (
      <ChartShell height={230}>
        <ResponsiveContainer>
          <BarChart data={data.greenEnergyMonthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" {...axisProps} interval={1} />
            <YAxis {...axisProps} />
            <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} MWh`, "Green energy"]} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Bar dataKey="mwh" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }
  return (
    <ChartShell height={230}>
      <ResponsiveContainer>
        <AreaChart data={data.greenEnergyMonthly}>
          <defs>
            <linearGradient id="greenEnergyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" {...axisProps} interval={1} />
          <YAxis {...axisProps} />
          <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} MWh`, "Green energy"]} />
          <Area type="monotone" dataKey="mwh" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#greenEnergyFill)" animationDuration={700} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/* ── Water statistics ─────────────────────────────────────── */

function WaterStatistics({ chartType }: { chartType: string }) {
  if (chartType === "breakdown") {
    return (
      <ChartShell height={230}>
        <ResponsiveContainer>
          <BarChart data={data.waterBreakdown} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" {...axisProps} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
            <YAxis type="category" dataKey="site" {...axisProps} width={70} />
            <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} m³`, "Withdrawal"]} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Bar dataKey="withdrawal" fill="hsl(var(--info))" radius={[0, 5, 5, 0]} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.waterStats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border/70 bg-muted/30 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-foreground">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground">{stat.unit}</span>
          </div>
          <p className="mt-1 text-[10px] font-semibold text-success">{stat.delta}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Waste analytics ──────────────────────────────────────── */

function WasteAnalytics({ chartType }: { chartType: string }) {
  if (chartType === "bar") {
    return (
      <ChartShell height={230}>
        <ResponsiveContainer>
          <BarChart data={data.wasteMonthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v} t`, undefined]} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Legend {...legendProps} />
            <Bar dataKey="recycled" stackId="a" fill={data.wasteColors.Recycled} animationDuration={700} />
            <Bar dataKey="landfill" stackId="a" fill={data.wasteColors.Landfill} animationDuration={700} />
            <Bar dataKey="other" stackId="a" fill={data.wasteColors.Incinerated} radius={[5, 5, 0, 0]} animationDuration={700} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }
  return (
    <ChartShell height={230}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data.wasteAnalytics} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3} cornerRadius={6} animationDuration={700}>
            {data.wasteAnalytics.map((slice) => <Cell key={slice.name} fill={data.wasteColors[slice.name]} stroke="hsl(var(--card))" strokeWidth={2} />)}
          </Pie>
          <Legend {...legendProps} />
          <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v} t`, "Waste"]} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/* ── Facility-wise emissions ──────────────────────────────── */

function FacilityEmissions() {
  return (
    <div className="space-y-3">
      {data.facilityEmissions.map((facility) => (
        <div key={facility.facility}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-foreground"><Building2 size={12} className="text-muted-foreground" />{facility.facility}</span>
            <span className="text-muted-foreground">{facility.value.toLocaleString()} tCO₂e · {facility.share}%</span>
          </div>
          <Progress value={facility.share * 4} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

/* ── Emission trends ──────────────────────────────────────── */

function EmissionTrends({ chartType }: { chartType: string }) {
  const series = ["Scope 1", "Scope 2", "Scope 3"] as const;
  if (chartType === "bar") {
    return (
      <ChartShell height={280}>
        <ResponsiveContainer>
          <BarChart data={data.scopeTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" {...axisProps} interval={1} />
            <YAxis {...axisProps} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
            <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} tCO₂e`, undefined]} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Legend {...legendProps} />
            {series.map((key) => <Bar key={key} dataKey={key} fill={data.scopeColors[key]} radius={[4, 4, 0, 0]} animationDuration={700} />)}
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }
  const Chart = chartType === "area" ? AreaChart : LineChart;
  return (
    <ChartShell height={280}>
      <ResponsiveContainer>
        <Chart data={data.scopeTrend}>
          <defs>
            {series.map((key) => (
              <linearGradient key={key} id={`trend-${key.replace(" ", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={data.scopeColors[key]} stopOpacity={0.26} />
                <stop offset="100%" stopColor={data.scopeColors[key]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" {...axisProps} interval={1} />
          <YAxis {...axisProps} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <Tooltip {...data.tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} tCO₂e`, undefined]} />
          <Legend {...legendProps} />
          {series.map((key) =>
            chartType === "area" ? (
              <Area key={key} type="monotone" dataKey={key} stroke={data.scopeColors[key]} strokeWidth={2} fill={`url(#trend-${key.replace(" ", "")})`} animationDuration={700} />
            ) : (
              <Line key={key} type="monotone" dataKey={key} stroke={data.scopeColors[key]} strokeWidth={2.2} dot={false} animationDuration={700} />
            ),
          )}
        </Chart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

/* ── Registry ─────────────────────────────────────────────── */

export const WIDGETS: WidgetDefinition[] = [
  {
    id: "kpi-overview",
    title: "KPI Overview",
    description: "Headline sustainability indicators with YoY movement",
    category: "KPIs",
    icon: Gauge,
    defaultSize: "large",
    keywords: "kpi stats summary total emission intensity green energy goals",
    Content: KpiOverview,
  },
  {
    id: "emissions-scope",
    title: "Emissions by Scope",
    description: "Scope 1, 2 and 3 distribution",
    category: "Emissions",
    icon: Leaf,
    defaultSize: "medium",
    keywords: "scope 1 2 3 ghg carbon donut pie distribution",
    chartTypes: [
      { value: "donut", label: "Donut" },
      { value: "bar", label: "Bars" },
      { value: "list", label: "Share" },
    ],
    Content: EmissionsByScope,
  },
  {
    id: "scope-breakdown",
    title: "Scope Breakdown",
    description: "Monthly emissions per scope",
    category: "Emissions",
    icon: BarChart3,
    defaultSize: "medium",
    keywords: "monthly scope stacked grouped bar",
    chartTypes: [
      { value: "stacked", label: "Stacked" },
      { value: "grouped", label: "Grouped" },
    ],
    Content: ScopeBreakdown,
  },
  {
    id: "carbon-intensity",
    title: "Carbon Intensity",
    description: "Intensity vs reduction target trajectory",
    category: "Emissions",
    icon: TrendingUp,
    defaultSize: "small",
    keywords: "intensity target trajectory reduction",
    chartTypes: [
      { value: "area", label: "Area" },
      { value: "line", label: "Line" },
    ],
    Content: CarbonIntensity,
  },
  {
    id: "green-energy",
    title: "Green Energy",
    description: "Renewable electricity generation, MWh",
    category: "Energy",
    icon: Sparkles,
    defaultSize: "small",
    keywords: "renewable solar wind electricity mwh energy",
    chartTypes: [
      { value: "area", label: "Area" },
      { value: "bar", label: "Bars" },
    ],
    Content: GreenEnergy,
  },
  {
    id: "water-stats",
    title: "Water Statistics",
    description: "Withdrawal, discharge and recycling rates",
    category: "Resources",
    icon: Droplets,
    defaultSize: "medium",
    keywords: "water withdrawal discharge consumption recycled site",
    chartTypes: [
      { value: "tiles", label: "Tiles" },
      { value: "breakdown", label: "By site" },
    ],
    Content: WaterStatistics,
  },
  {
    id: "waste-analytics",
    title: "Waste Analytics",
    description: "Diversion mix and quarterly volumes",
    category: "Resources",
    icon: Recycle,
    defaultSize: "medium",
    keywords: "waste recycled landfill incinerated composted circular",
    chartTypes: [
      { value: "donut", label: "Donut" },
      { value: "bar", label: "Bars" },
    ],
    Content: WasteAnalytics,
  },
  {
    id: "facility-emissions",
    title: "Facility-wise Emissions",
    description: "Footprint share across operating sites",
    category: "Emissions",
    icon: Factory,
    defaultSize: "medium",
    keywords: "facility site location plant footprint",
    Content: FacilityEmissions,
  },
  {
    id: "emission-trends",
    title: "Emission Trends",
    description: "12-month trajectory across all scopes",
    category: "Emissions",
    icon: Activity,
    defaultSize: "large",
    keywords: "trend time series monthly line area forecast",
    chartTypes: [
      { value: "line", label: "Line" },
      { value: "area", label: "Area" },
      { value: "bar", label: "Bars" },
    ],
    Content: EmissionTrends,
  },
];

export const widgetById = (id: string): WidgetDefinition | undefined => WIDGETS.find((w) => w.id === id);

export const widgetCategories: WidgetCategory[] = ["KPIs", "Emissions", "Energy", "Resources"];

export const _unusedIcons = { Bell, CircleDollarSign }; // reserved for future widget badges
