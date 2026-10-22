// Shared chart building blocks for dashboard widgets (built-in and user-created).
import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardFilters, WidgetSize } from "@/lib/dashboardLayout";

export type WidgetCategory = "KPIs" | "Emissions" | "Energy" | "Resources" | "Custom";

export interface WidgetContentProps {
  chartType: string;
  size: WidgetSize;
  filters: DashboardFilters;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  icon: LucideIcon;
  defaultSize: WidgetSize;
  keywords: string;
  /** optional per-widget view switcher; the first entry is the default */
  chartTypes?: { value: string; label: string }[];
  /** responds to the period filter */
  periodAware?: boolean;
  /** responds to the scope filter */
  scopeAware?: boolean;
  /** user-created (editable / deletable) */
  custom?: boolean;
  Content: (props: WidgetContentProps) => JSX.Element;
}

/* ── Shared chart primitives ──────────────────────────────── */

export const ANIMATION = { animationDuration: 650, animationEasing: "ease-out" as const };

export const axisProps = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
};

export const gridProps = { strokeDasharray: "3 3", stroke: "hsl(var(--border))", strokeOpacity: 0.7 };

export const chartHeight: Record<WidgetSize, number> = { small: 190, medium: 230, large: 280 };

export const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });
export const fmtK = (v: number) => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : `${v}`);

export function ChartFrame({ height, children }: { height: number; children: React.ReactElement }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
    </div>
  );
}

/** Tooltip card shared by every chart: swatch + label + value, optional total row. */
export function ChartTooltip({ active, payload, label, unit, showTotal }: TooltipProps<number, string> & { unit: string; showTotal?: boolean }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);
  return (
    <div className="min-w-[160px] rounded-xl border border-border bg-popover/95 px-3 py-2.5 text-xs shadow-elevated backdrop-blur">
      {label !== undefined && <p className="mb-1.5 font-semibold text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey ?? p.name)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? (p.payload as { fill?: string })?.fill }} />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-foreground">{fmt(Number(p.value))} <span className="font-normal text-muted-foreground">{unit}</span></span>
          </div>
        ))}
      </div>
      {showTotal && payload.length > 1 && (
        <div className="mt-1.5 flex items-center justify-between border-t border-border/70 pt-1.5">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold tabular-nums text-foreground">{fmt(total)} {unit}</span>
        </div>
      )}
    </div>
  );
}

export const tooltip = (unit: string, showTotal = false, cursor: object | boolean = { fill: "hsl(var(--muted) / 0.45)" }) => (
  <Tooltip content={<ChartTooltip unit={unit} showTotal={showTotal} />} cursor={cursor} wrapperStyle={{ outline: "none" }} />
);

export const lineCursor = { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" };

export interface LegendEntry { key: string; label: string; color: string; value?: string; dashed?: boolean }

/** Interactive legend: click an entry to hide/show that series (the last visible one stays on). */
export function SeriesLegend({ items, hidden, onToggle, className }: { items: LegendEntry[]; hidden?: Set<string>; onToggle?: (key: string) => void; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      {items.map((item) => {
        const off = hidden?.has(item.key);
        const content = (
          <>
            {item.dashed ? (
              <span className="h-0 w-3 border-t-2 border-dashed" style={{ borderColor: item.color }} />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            )}
            <span className={cn("text-muted-foreground", off && "line-through")}>{item.label}</span>
            {item.value && <span className="font-semibold tabular-nums text-foreground">{item.value}</span>}
          </>
        );
        return onToggle ? (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            aria-pressed={!off}
            className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs transition-opacity hover:bg-muted/60", off && "opacity-45")}
          >
            {content}
          </button>
        ) : (
          <span key={item.key} className="flex items-center gap-1.5 px-1.5 py-0.5 text-xs">{content}</span>
        );
      })}
    </div>
  );
}

export function useSeriesToggle(allKeys: string[]) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (allKeys.filter((k) => !next.has(k)).length > 1) next.add(key);
      return next;
    });
  return { hidden, toggle, visible: allKeys.filter((k) => !hidden.has(k)) };
}

export function Stat({ label, value, unit, className }: { label: string; value: string; unit?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold tabular-nums text-foreground">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

export function Sparkline({ values, id }: { values: number[]; id: string }) {
  if (values.length < 2) return <div className="h-9" />;
  const rows = values.map((v, i) => ({ i, v }));
  return (
    <div className="h-9 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={1.75} fill={`url(#spark-${id})`} {...ANIMATION} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
