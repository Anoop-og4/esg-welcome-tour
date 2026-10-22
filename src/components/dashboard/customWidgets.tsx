import { useId } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { AlertTriangle, AreaChart as AreaIcon, ArrowDownRight, ArrowUpRight, BarChart3, Hash, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardFilters, WidgetSize } from "@/lib/dashboardLayout";
import type { CustomVisual, CustomWidgetDraft, CustomWidgetSpec } from "@/lib/dashboardLibrary";
import { ANIMATION, axisProps, ChartFrame, chartHeight, fmt, fmtK, gridProps, lineCursor, SeriesLegend, Sparkline, Stat, tooltip, useSeriesToggle, type WidgetDefinition } from "./chartKit";
import { chartColors, periodLabels } from "./dashboardData";
import { activeSeries, aggregateSeries, getMetric, type MetricDef, type MetricRow, type MetricSeries, VISUAL_LABELS } from "./metricCatalog";

export const VISUAL_ICONS: Record<CustomVisual, LucideIcon> = {
  line: LineIcon,
  area: AreaIcon,
  bar: BarChart3,
  donut: PieIcon,
  stat: Hash,
};

/** Pick a visual the metric supports: the requested one, else the spec's, else the metric's first. */
export function resolveVisual(metric: MetricDef, requested: string | undefined, fallback: CustomVisual): CustomVisual {
  if (requested && metric.visuals.includes(requested as CustomVisual)) return requested as CustomVisual;
  return metric.visuals.includes(fallback) ? fallback : metric.visuals[0];
}

const aggregateLabel = { sum: "Total", average: "Average", latest: "Latest" } as const;

interface CustomContentProps {
  spec: CustomWidgetDraft;
  chartType?: string;
  size: WidgetSize;
  filters: DashboardFilters;
}

export function CustomWidgetContent({ spec, chartType, size, filters }: CustomContentProps) {
  const uid = useId().replace(/:/g, "");
  const metric = getMetric(spec.metric);
  const baseSeries = metric ? activeSeries(metric, spec.series, filters) : [];
  // single-series charts take the colour the author picked
  const series: MetricSeries[] = baseSeries.length === 1 ? [{ ...baseSeries[0], color: chartColors[spec.color] ?? chartColors[0] }] : baseSeries;
  const { hidden, toggle, visible } = useSeriesToggle(series.map((s) => s.key));

  if (!metric) {
    return (
      <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
        <AlertTriangle size={18} className="text-warning" />
        <p className="text-sm font-medium text-foreground">Data source unavailable</p>
        <p className="text-xs text-muted-foreground">Edit this widget to pick another data source.</p>
      </div>
    );
  }

  const visual = resolveVisual(metric, chartType, spec.visual);
  const rows = metric.rows(filters);
  const shown = series.filter((s) => visible.includes(s.key));
  const height = chartHeight[size];
  const unit = metric.unit;
  const periodNote = metric.periodAware ? periodLabels[filters.period] : metric.kind === "category" ? "Current FY" : "All years";

  // the headline number: sums add across series; averages / latest describe the first series only
  const headlineSeries = metric.aggregate === "sum" ? shown : shown.slice(0, 1);
  const headline = headlineSeries.reduce((sum, s) => sum + aggregateSeries(metric, rows, s.key), 0);
  const rowTotal = (r: MetricRow) => headlineSeries.reduce((sum, s) => sum + (Number(r[s.key]) || 0), 0);

  /* ── KPI tile ── */
  if (visual === "stat") {
    if (metric.kind === "category") {
      const ranked = [...rows].sort((a, b) => rowTotal(b) - rowTotal(a)).slice(0, size === "small" ? 3 : 4);
      const max = rowTotal(ranked[0]) || 1;
      return (
        <div className="space-y-4">
          <Stat label={`${aggregateLabel[metric.aggregate]} · ${periodNote}`} value={fmt(headline)} unit={unit} className="[&>p:last-child]:text-3xl" />
          <div className="space-y-2.5">
            {ranked.map((r) => (
              <div key={String(r[metric.xKey])}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="truncate text-muted-foreground">{r[metric.xKey]}</span>
                  <span className="font-semibold tabular-nums text-foreground">{fmt(rowTotal(r))}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(rowTotal(r) / max) * 100}%`, background: shown[0]?.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    const first = rowTotal(rows[0]);
    const last = rowTotal(rows[rows.length - 1]);
    const change = first ? ((last - first) / first) * 100 : 0;
    const Arrow = change >= 0 ? ArrowUpRight : ArrowDownRight;
    return (
      <div className="flex h-full flex-col">
        <p className="text-xs font-medium text-muted-foreground">{aggregateLabel[metric.aggregate]} · {periodNote}</p>
        <p className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {fmt(headline)}
          <span className="ml-1.5 text-sm font-medium text-muted-foreground">{unit}</span>
        </p>
        {rows.length > 1 && (
          <span className="mt-2 inline-flex w-fit items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            <Arrow size={12} />
            {change >= 0 ? "+" : ""}{change.toFixed(1)}% {String(rows[0][metric.xKey])} → {String(rows[rows.length - 1][metric.xKey])}
          </span>
        )}
        <div className="mt-auto pt-4">
          <Sparkline values={rows.map(rowTotal)} id={`${uid}-spark`} />
        </div>
      </div>
    );
  }

  /* ── Donut ── */
  if (visual === "donut") {
    let slices: { name: string; value: number; color: string }[];
    if (metric.kind === "category") {
      // four palette slots: top three items, the rest folded into "Other"
      const ranked = [...rows].sort((a, b) => rowTotal(b) - rowTotal(a));
      slices = ranked.slice(0, 3).map((r, i) => ({ name: String(r[metric.xKey]), value: rowTotal(r), color: chartColors[i] }));
      const rest = ranked.slice(3).reduce((sum, r) => sum + rowTotal(r), 0);
      if (rest) slices.push({ name: "Other", value: rest, color: "hsl(var(--muted-foreground) / 0.45)" });
    } else {
      slices = shown.map((s) => ({ name: s.label, value: aggregateSeries(metric, rows, s.key), color: s.color }));
    }
    const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
    return (
      <div className={cn("flex gap-4", size === "small" ? "flex-col" : "flex-col sm:flex-row sm:items-center")}>
        <div className="relative mx-auto w-full max-w-[220px] flex-1">
          <ChartFrame height={height - 20}>
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="90%" paddingAngle={2} cornerRadius={4} stroke="hsl(var(--card))" strokeWidth={2} {...ANIMATION}>
                {slices.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              {tooltip(unit, false, false)}
            </PieChart>
          </ChartFrame>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl font-bold tabular-nums text-foreground">{fmtK(Math.round(total))}</span>
            <span className="text-[11px] text-muted-foreground">{unit}</span>
          </div>
        </div>
        <SeriesLegend
          className="flex-col items-start sm:min-w-[140px]"
          items={slices.map((s) => ({ key: s.name, label: s.name, color: s.color, value: `${Math.round((s.value / total) * 100)}%` }))}
        />
      </div>
    );
  }

  /* ── Cartesian charts ── */
  const multi = series.length > 1;
  const summary = (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <Stat label={`${aggregateLabel[metric.aggregate]}${headlineSeries.length === 1 && multi ? ` ${headlineSeries[0].label.toLowerCase()}` : ""} · ${periodNote}`} value={fmt(Math.round(headline * 10) / 10)} unit={unit} />
      {multi && <SeriesLegend items={series.map((s) => ({ key: s.key, label: s.label, color: s.color, dashed: s.key === "target" }))} hidden={hidden} onToggle={toggle} />}
    </div>
  );
  const chartH = height - 40;

  if (metric.kind === "category") {
    return (
      <div className="space-y-3">
        {summary}
        <ChartFrame height={chartH}>
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} horizontal={false} />
            <XAxis type="number" {...axisProps} tickFormatter={fmtK} />
            <YAxis type="category" dataKey={metric.xKey} {...axisProps} width={96} />
            {tooltip(unit)}
            {shown.map((s) => <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[0, 4, 4, 0]} maxBarSize={18} {...ANIMATION} />)}
          </BarChart>
        </ChartFrame>
      </div>
    );
  }

  const axes = (
    <>
      <CartesianGrid {...gridProps} vertical={false} />
      <XAxis dataKey={metric.xKey} {...axisProps} interval="equidistantPreserveStart" />
      <YAxis {...axisProps} tickFormatter={fmtK} />
    </>
  );
  const margin = { top: 4, right: 4, bottom: 0, left: -12 };
  const stackable = metric.aggregate === "sum" && shown.length > 1;

  return (
    <div className="space-y-3">
      {summary}
      <ChartFrame height={chartH}>
        {visual === "bar" ? (
          <BarChart data={rows} margin={margin}>
            {axes}
            {tooltip(unit, stackable)}
            {shown.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                stackId={stackable ? "stack" : undefined}
                stroke={stackable ? "hsl(var(--card))" : undefined}
                strokeWidth={stackable ? 1 : 0}
                radius={!stackable || i === shown.length - 1 ? [4, 4, 0, 0] : undefined}
                maxBarSize={stackable ? 34 : 22}
                {...ANIMATION}
              />
            ))}
          </BarChart>
        ) : visual === "area" ? (
          <AreaChart data={rows} margin={margin}>
            <defs>
              {shown.map((s) => (
                <linearGradient key={s.key} id={`${uid}-${s.key.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>
            {axes}
            {tooltip(unit, stackable, lineCursor)}
            {shown.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} strokeDasharray={s.key === "target" ? "5 5" : undefined} fill={s.key === "target" ? "none" : `url(#${uid}-${s.key.replace(/\W/g, "")})`} activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }} {...ANIMATION} />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={rows} margin={margin}>
            {axes}
            {tooltip(unit, stackable, lineCursor)}
            {shown.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} strokeDasharray={s.key === "target" ? "5 5" : undefined} dot={rows.length <= 6 ? { r: 3, strokeWidth: 0, fill: s.color } : false} activeDot={{ r: 5, stroke: "hsl(var(--card))", strokeWidth: 2 }} {...ANIMATION} />
            ))}
          </LineChart>
        )}
      </ChartFrame>
    </div>
  );
}

/** Wrap a stored spec as a regular widget definition so the grid, library and settings treat it like a built-in. */
export function customWidgetDefinition(spec: CustomWidgetSpec): WidgetDefinition {
  const metric = getMetric(spec.metric);
  const visuals = metric ? [resolveVisual(metric, spec.visual, spec.visual), ...metric.visuals.filter((v) => v !== spec.visual)] : [];
  return {
    id: spec.id,
    title: spec.title,
    description: spec.description || metric?.description || "Custom widget",
    category: "Custom",
    icon: VISUAL_ICONS[spec.visual],
    defaultSize: spec.size,
    keywords: `custom ${metric?.label ?? ""} ${metric?.category ?? ""} ${spec.visual}`,
    chartTypes: visuals.length > 1 ? visuals.map((v) => ({ value: v, label: VISUAL_LABELS[v] })) : undefined,
    periodAware: metric?.periodAware,
    scopeAware: metric?.scopeAware,
    custom: true,
    Content: (props) => <CustomWidgetContent spec={spec} {...props} />,
  };
}
