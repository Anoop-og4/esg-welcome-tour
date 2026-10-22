import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Building2, Droplets, Factory, Gauge, Leaf, Minus, Recycle, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import * as data from "./dashboardData";
import {
  ANIMATION,
  axisProps,
  ChartFrame,
  chartHeight,
  fmt,
  fmtK,
  gridProps,
  lineCursor,
  SeriesLegend,
  Sparkline,
  Stat,
  tooltip,
  useSeriesToggle,
  type WidgetCategory,
  type WidgetContentProps,
  type WidgetDefinition,
} from "./chartKit";

export type { WidgetCategory, WidgetContentProps, WidgetDefinition } from "./chartKit";

/* ── KPI overview ─────────────────────────────────────────── */

const deltaTone: Record<data.KpiTone, string> = {
  good: "bg-success/10 text-success",
  bad: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

function KpiOverview({ size }: WidgetContentProps) {
  const cols = size === "large" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" : size === "medium" ? "grid-cols-2" : "grid-cols-1";
  const tiles = size === "small" ? data.kpiTiles.slice(0, 3) : data.kpiTiles;
  return (
    <div className={cn("grid gap-3", cols)}>
      {tiles.map((tile) => {
        const DeltaIcon = tile.direction === "up" ? ArrowUpRight : tile.direction === "down" ? ArrowDownRight : Minus;
        return (
          <div key={tile.id} className="group/kpi flex flex-col rounded-xl border border-border/70 bg-muted/25 p-4 transition-colors hover:border-primary/30 hover:bg-muted/40">
            <p className="text-xs font-medium text-muted-foreground">{tile.label}</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">{tile.value}</span>
              <span className="text-[11px] text-muted-foreground">{tile.unit}</span>
            </div>
            <span className={cn("mt-2 inline-flex w-fit items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", deltaTone[tile.tone])}>
              <DeltaIcon size={12} />
              {tile.delta}
            </span>
            {size !== "small" && <div className="mt-auto pt-2"><Sparkline values={tile.spark} id={tile.id} /></div>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Emissions by scope ───────────────────────────────────── */

function EmissionsByScope({ chartType, size, filters }: WidgetContentProps) {
  const totals = data.scopeTotals(filters);
  const total = totals.reduce((sum, s) => sum + s.value, 0);
  const legend = totals.map((s) => ({ key: s.name, label: s.name, color: data.scopeColors[s.name], value: `${Math.round((s.value / total) * 100)}%` }));

  if (chartType === "list") {
    return (
      <div className="space-y-4">
        <Stat label={`Total · ${data.periodLabels[filters.period]}`} value={fmt(total)} unit="tCO₂e" />
        {totals.map((scope) => (
          <div key={scope.name}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: data.scopeColors[scope.name] }} />{scope.name}</span>
              <span className="tabular-nums text-muted-foreground">{fmt(scope.value)} tCO₂e · <span className="font-semibold text-foreground">{Math.round((scope.value / total) * 100)}%</span></span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${(scope.value / total) * 100}%`, background: data.scopeColors[scope.name] }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chartType === "bar") {
    return (
      <div className="space-y-3">
        <SeriesLegend items={legend} />
        <ChartFrame height={chartHeight[size]}>
          <BarChart data={totals} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid {...gridProps} vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={fmtK} />
            {tooltip("tCO₂e")}
            <Bar dataKey="value" name="Emissions" radius={[4, 4, 0, 0]} maxBarSize={56} {...ANIMATION}>
              {totals.map((scope) => <Cell key={scope.name} fill={data.scopeColors[scope.name]} />)}
            </Bar>
          </BarChart>
        </ChartFrame>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-4", size === "small" ? "flex-col" : "flex-col sm:flex-row sm:items-center")}>
      <div className="relative mx-auto w-full max-w-[240px] flex-1">
        <ChartFrame height={chartHeight[size] - 10}>
          <PieChart>
            <Pie data={totals} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="90%" paddingAngle={2} cornerRadius={4} stroke="hsl(var(--card))" strokeWidth={2} {...ANIMATION}>
              {totals.map((scope) => <Cell key={scope.name} fill={data.scopeColors[scope.name]} />)}
            </Pie>
            {tooltip("tCO₂e", false, false)}
          </PieChart>
        </ChartFrame>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold tabular-nums text-foreground">{fmtK(total)}</span>
          <span className="text-[11px] text-muted-foreground">tCO₂e</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 sm:min-w-[150px]">
        {totals.map((scope) => (
          <div key={scope.name} className="flex items-center justify-between gap-3 rounded-lg px-1 text-xs">
            <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: data.scopeColors[scope.name] }} />{scope.name}</span>
            <span className="text-right">
              <span className="block font-semibold tabular-nums text-foreground">{fmt(scope.value)}</span>
              <span className="text-[11px] text-muted-foreground">{Math.round((scope.value / total) * 100)}% of total</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Scope breakdown over time ────────────────────────────── */

function ScopeBreakdown({ chartType, size, filters }: WidgetContentProps) {
  const rows = data.sliceByPeriod(data.scopeTrend, filters.period);
  const { hidden, toggle, visible } = useSeriesToggle(filters.scopes);
  const stacked = chartType !== "grouped";
  return (
    <div className="space-y-3">
      <SeriesLegend items={filters.scopes.map((s) => ({ key: s, label: s, color: data.scopeColors[s] }))} hidden={hidden} onToggle={toggle} />
      <ChartFrame height={chartHeight[size]}>
        <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -12 }} barGap={2}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="month" {...axisProps} interval="equidistantPreserveStart" />
          <YAxis {...axisProps} tickFormatter={fmtK} />
          {tooltip("tCO₂e", stacked)}
          {visible.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stacked ? "scopes" : undefined}
              fill={data.scopeColors[key as keyof typeof data.scopeColors]}
              stroke={stacked ? "hsl(var(--card))" : undefined}
              strokeWidth={stacked ? 1 : 0}
              radius={!stacked || i === visible.length - 1 ? [4, 4, 0, 0] : undefined}
              maxBarSize={stacked ? 34 : 16}
              {...ANIMATION}
            />
          ))}
        </BarChart>
      </ChartFrame>
    </div>
  );
}

/* ── Carbon intensity ─────────────────────────────────────── */

function CarbonIntensity({ chartType, size }: WidgetContentProps) {
  const latest = data.carbonIntensity[data.carbonIntensity.length - 1];
  const gap = latest.intensity - latest.target;
  const Chart = chartType === "line" ? LineChart : AreaChart;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Stat label={`${latest.year} intensity`} value={fmt(latest.intensity)} unit="tCO₂e/unit" />
        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">{gap} above target</span>
      </div>
      <SeriesLegend items={[{ key: "i", label: "Intensity", color: "var(--chart-1)" }, { key: "t", label: "Target", color: "hsl(var(--muted-foreground))", dashed: true }]} />
      <ChartFrame height={chartHeight[size] - 30}>
        <Chart data={data.carbonIntensity} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="intensityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="year" {...axisProps} interval="equidistantPreserveStart" />
          <YAxis {...axisProps} domain={["dataMin - 30", "dataMax + 20"]} />
          {tooltip("tCO₂e/unit", false, lineCursor)}
          {chartType === "line" ? (
            <Line type="monotone" dataKey="intensity" name="Intensity" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-1)" }} activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }} {...ANIMATION} />
          ) : (
            <Area type="monotone" dataKey="intensity" name="Intensity" stroke="var(--chart-1)" strokeWidth={2} fill="url(#intensityFill)" activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }} {...ANIMATION} />
          )}
          <Line type="monotone" dataKey="target" name="Target" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 5" dot={false} {...ANIMATION} />
        </Chart>
      </ChartFrame>
    </div>
  );
}

/* ── Green energy ─────────────────────────────────────────── */

function GreenEnergy({ chartType, size, filters }: WidgetContentProps) {
  const rows = data.sliceByPeriod(data.greenEnergyMonthly, filters.period);
  const total = rows.reduce((sum, r) => sum + r.mwh, 0);
  const share = Math.round(rows.reduce((sum, r) => sum + r.renewableShare, 0) / rows.length);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Stat label="Generated" value={fmt(total)} unit="MWh" />
        <Stat label="Avg. renewable share" value={`${share}%`} />
      </div>
      <ChartFrame height={chartHeight[size] - 30}>
        {chartType === "bar" ? (
          <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
            <CartesianGrid {...gridProps} vertical={false} />
            <XAxis dataKey="month" {...axisProps} interval="equidistantPreserveStart" />
            <YAxis {...axisProps} tickFormatter={fmtK} />
            {tooltip("MWh")}
            <Bar dataKey="mwh" name="Green energy" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={26} {...ANIMATION} />
          </BarChart>
        ) : (
          <AreaChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
            <defs>
              <linearGradient id="greenEnergyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} vertical={false} />
            <XAxis dataKey="month" {...axisProps} interval="equidistantPreserveStart" />
            <YAxis {...axisProps} tickFormatter={fmtK} domain={["dataMin - 200", "auto"]} />
            {tooltip("MWh", false, lineCursor)}
            <Area type="monotone" dataKey="mwh" name="Green energy" stroke="var(--chart-1)" strokeWidth={2} fill="url(#greenEnergyFill)" activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }} {...ANIMATION} />
          </AreaChart>
        )}
      </ChartFrame>
    </div>
  );
}

/* ── Water statistics ─────────────────────────────────────── */

function WaterStatistics({ chartType, size }: WidgetContentProps) {
  if (chartType === "breakdown") {
    return (
      <ChartFrame height={chartHeight[size]}>
        <BarChart data={data.waterBreakdown} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} horizontal={false} />
          <XAxis type="number" {...axisProps} tickFormatter={fmtK} />
          <YAxis type="category" dataKey="site" {...axisProps} width={72} />
          {tooltip("m³")}
          <Bar dataKey="withdrawal" name="Withdrawal" fill="var(--chart-2)" radius={[0, 4, 4, 0]} maxBarSize={18} {...ANIMATION} />
        </BarChart>
      </ChartFrame>
    );
  }
  return (
    <div className={cn("grid gap-3", size === "large" ? "grid-cols-2 lg:grid-cols-4" : size === "small" ? "grid-cols-1" : "grid-cols-2")}>
      {data.waterStats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border/70 bg-muted/25 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Droplets size={12} className="text-[color:var(--chart-2)]" />{stat.label}</p>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="font-display text-xl font-bold tabular-nums text-foreground">{stat.value}</span>
            <span className="text-[11px] text-muted-foreground">{stat.unit}</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-success">{stat.delta}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Waste analytics ──────────────────────────────────────── */

const WASTE_KEYS = ["Recycled", "Composted", "Landfill", "Incinerated"] as const;
const quartersFor = { "12m": 4, "6m": 2, "3m": 1 } as const;

function WasteAnalytics({ chartType, size, filters }: WidgetContentProps) {
  const quarters = data.wasteQuarterly.slice(-quartersFor[filters.period]);
  const totals = WASTE_KEYS.map((name) => ({ name, value: quarters.reduce((sum, q) => sum + q[name], 0) }));
  const total = totals.reduce((sum, t) => sum + t.value, 0);
  const diversion = Math.round(((totals[0].value + totals[1].value) / total) * 100);
  const { hidden, toggle, visible } = useSeriesToggle([...WASTE_KEYS]);
  const legend = totals.map((t) => ({ key: t.name, label: t.name, color: data.wasteColors[t.name], value: chartType === "bar" ? undefined : `${Math.round((t.value / total) * 100)}%` }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Stat label="Waste generated" value={fmt(total)} unit="t" />
        <Stat label="Diversion rate" value={`${diversion}%`} />
      </div>
      {chartType === "bar" ? (
        <>
          <SeriesLegend items={legend} hidden={hidden} onToggle={toggle} />
          <ChartFrame height={chartHeight[size] - 40}>
            <BarChart data={quarters} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid {...gridProps} vertical={false} />
              <XAxis dataKey="quarter" {...axisProps} />
              <YAxis {...axisProps} />
              {tooltip("t", true)}
              {visible.map((key, i) => (
                <Bar key={key} dataKey={key} stackId="waste" fill={data.wasteColors[key]} stroke="hsl(var(--card))" strokeWidth={1} radius={i === visible.length - 1 ? [4, 4, 0, 0] : undefined} maxBarSize={44} {...ANIMATION} />
              ))}
            </BarChart>
          </ChartFrame>
        </>
      ) : (
        <div className={cn("flex gap-4", size === "small" ? "flex-col" : "flex-col sm:flex-row sm:items-center")}>
          <div className="mx-auto w-full max-w-[200px] flex-1">
            <ChartFrame height={chartHeight[size] - 50}>
              <PieChart>
                <Pie data={totals} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" paddingAngle={2} cornerRadius={4} stroke="hsl(var(--card))" strokeWidth={2} {...ANIMATION}>
                  {totals.map((slice) => <Cell key={slice.name} fill={data.wasteColors[slice.name]} />)}
                </Pie>
                {tooltip("t", false, false)}
              </PieChart>
            </ChartFrame>
          </div>
          <SeriesLegend items={legend} className="flex-col items-start sm:min-w-[150px]" />
        </div>
      )}
    </div>
  );
}

/* ── Facility-wise emissions ──────────────────────────────── */

function FacilityEmissions({ chartType, size }: WidgetContentProps) {
  const sorted = [...data.facilityEmissions].sort((a, b) => b.value - a.value);
  const max = sorted[0].value;
  if (chartType === "bar") {
    return (
      <ChartFrame height={chartHeight[size] + 20}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} horizontal={false} />
          <XAxis type="number" {...axisProps} tickFormatter={fmtK} />
          <YAxis type="category" dataKey="facility" {...axisProps} width={96} />
          {tooltip("tCO₂e")}
          <Bar dataKey="value" name="Emissions" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={18} {...ANIMATION} />
        </BarChart>
      </ChartFrame>
    );
  }
  return (
    <div className="space-y-3.5">
      {sorted.map((facility, i) => (
        <div key={facility.facility}>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
              <Building2 size={13} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{facility.facility}</span>
              {i === 0 && <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-semibold text-muted-foreground">Top emitter</span>}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{fmt(facility.value)} · <span className="font-semibold text-foreground">{facility.share}%</span></span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[color:var(--chart-1)] transition-[width] duration-700 ease-out" style={{ width: `${(facility.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Emission trends ──────────────────────────────────────── */

function EmissionTrends({ chartType, size, filters }: WidgetContentProps) {
  const rows = data.sliceByPeriod(data.scopeTrend, filters.period);
  const { hidden, toggle, visible } = useSeriesToggle(filters.scopes);
  const totalOf = (row: data.ScopeMonth) => visible.reduce((sum, k) => sum + row[k as keyof typeof data.scopeColors], 0);
  const first = totalOf(rows[0]);
  const last = totalOf(rows[rows.length - 1]);
  const change = first ? ((last - first) / first) * 100 : 0;
  const color = (key: string) => data.scopeColors[key as keyof typeof data.scopeColors];

  const common = (
    <>
      <CartesianGrid {...gridProps} vertical={false} />
      <XAxis dataKey="month" {...axisProps} interval="equidistantPreserveStart" />
      <YAxis {...axisProps} tickFormatter={fmtK} />
    </>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Stat label="Period total" value={fmt(rows.reduce((sum, r) => sum + totalOf(r), 0))} unit="tCO₂e" />
          <Stat label={`${rows[0].month} → ${rows[rows.length - 1].month}`} value={`${change > 0 ? "+" : ""}${change.toFixed(1)}%`} />
        </div>
        <SeriesLegend items={filters.scopes.map((s) => ({ key: s, label: s, color: color(s) }))} hidden={hidden} onToggle={toggle} />
      </div>
      <ChartFrame height={chartHeight[size]}>
        {chartType === "bar" ? (
          <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -12 }} barGap={2}>
            {common}
            {tooltip("tCO₂e", true)}
            {visible.map((key) => <Bar key={key} dataKey={key} fill={color(key)} radius={[4, 4, 0, 0]} maxBarSize={14} {...ANIMATION} />)}
          </BarChart>
        ) : chartType === "area" ? (
          <AreaChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            <defs>
              {visible.map((key) => (
                <linearGradient key={key} id={`trend-${key.replace(" ", "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color(key)} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={color(key)} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>
            {common}
            {tooltip("tCO₂e", true, lineCursor)}
            {visible.map((key) => (
              <Area key={key} type="monotone" dataKey={key} stroke={color(key)} strokeWidth={2} fill={`url(#trend-${key.replace(" ", "")})`} activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }} {...ANIMATION} />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            {common}
            {tooltip("tCO₂e", true, lineCursor)}
            {visible.map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke={color(key)} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }} {...ANIMATION} />
            ))}
          </LineChart>
        )}
      </ChartFrame>
    </div>
  );
}

/* ── Registry ─────────────────────────────────────────────── */

export const WIDGETS: WidgetDefinition[] = [
  {
    id: "kpi-overview",
    title: "KPI Overview",
    description: "Headline sustainability indicators with year-on-year movement",
    category: "KPIs",
    icon: Gauge,
    defaultSize: "large",
    keywords: "kpi stats summary total emission intensity green energy goals growth",
    Content: KpiOverview,
  },
  {
    id: "emissions-scope",
    title: "Emissions by Scope",
    description: "Scope 1, 2 and 3 distribution",
    category: "Emissions",
    icon: Leaf,
    defaultSize: "medium",
    keywords: "scope 1 2 3 ghg carbon donut pie distribution share",
    chartTypes: [
      { value: "donut", label: "Donut" },
      { value: "bar", label: "Bars" },
      { value: "list", label: "Share" },
    ],
    periodAware: true,
    scopeAware: true,
    Content: EmissionsByScope,
  },
  {
    id: "scope-breakdown",
    title: "Scope Breakdown",
    description: "Monthly emissions split by scope",
    category: "Emissions",
    icon: BarChart3,
    defaultSize: "medium",
    keywords: "monthly scope stacked grouped bar breakdown",
    chartTypes: [
      { value: "stacked", label: "Stacked" },
      { value: "grouped", label: "Grouped" },
    ],
    periodAware: true,
    scopeAware: true,
    Content: ScopeBreakdown,
  },
  {
    id: "carbon-intensity",
    title: "Carbon Intensity",
    description: "Intensity against the reduction target trajectory",
    category: "Emissions",
    icon: TrendingUp,
    defaultSize: "small",
    keywords: "intensity target trajectory reduction per unit",
    chartTypes: [
      { value: "area", label: "Area" },
      { value: "line", label: "Line" },
    ],
    Content: CarbonIntensity,
  },
  {
    id: "green-energy",
    title: "Green Energy",
    description: "Renewable electricity generation",
    category: "Energy",
    icon: Sparkles,
    defaultSize: "small",
    keywords: "renewable solar wind electricity mwh energy share",
    chartTypes: [
      { value: "area", label: "Area" },
      { value: "bar", label: "Bars" },
    ],
    periodAware: true,
    Content: GreenEnergy,
  },
  {
    id: "water-stats",
    title: "Water Statistics",
    description: "Withdrawal, discharge, consumption and recycling",
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
    description: "Disposal mix, diversion rate and quarterly volumes",
    category: "Resources",
    icon: Recycle,
    defaultSize: "medium",
    keywords: "waste recycled landfill incinerated composted circular diversion",
    chartTypes: [
      { value: "donut", label: "Donut" },
      { value: "bar", label: "Quarterly" },
    ],
    periodAware: true,
    Content: WasteAnalytics,
  },
  {
    id: "facility-emissions",
    title: "Facility-wise Emissions",
    description: "Footprint across operating sites",
    category: "Emissions",
    icon: Factory,
    defaultSize: "medium",
    keywords: "facility site location plant footprint",
    chartTypes: [
      { value: "list", label: "Ranked" },
      { value: "bar", label: "Bars" },
    ],
    Content: FacilityEmissions,
  },
  {
    id: "emission-trends",
    title: "Emission Trends",
    description: "Monthly trajectory across all scopes",
    category: "Emissions",
    icon: Activity,
    defaultSize: "large",
    keywords: "trend time series monthly line area forecast trajectory",
    chartTypes: [
      { value: "line", label: "Line" },
      { value: "area", label: "Area" },
      { value: "bar", label: "Bars" },
    ],
    periodAware: true,
    scopeAware: true,
    Content: EmissionTrends,
  },
];

export const widgetById = (id: string): WidgetDefinition | undefined => WIDGETS.find((w) => w.id === id);

export const WIDGET_IDS = WIDGETS.map((w) => w.id);

export const widgetCategories: WidgetCategory[] = ["KPIs", "Emissions", "Energy", "Resources"];
