import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical, MoreHorizontal, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type DashboardFilters, type DashboardWidgetItem, WIDGET_SIZES, type WidgetSize } from "@/lib/dashboardLayout";
import { periodLabels } from "./dashboardData";
import type { WidgetDefinition } from "./widgets";

export type DropSide = "before" | "after";

const sizeLabel: Record<WidgetSize, string> = { small: "Small", medium: "Medium", large: "Large" };
const sizeShort: Record<WidgetSize, string> = { small: "S", medium: "M", large: "L" };

interface WidgetCardProps {
  def: WidgetDefinition;
  item: DashboardWidgetItem;
  index: number;
  count: number;
  /** grid columns this card spans at the current breakpoint */
  span: number;
  /** card fills its whole row — drop indicators then sit above/below instead of left/right */
  fullRow: boolean;
  editing: boolean;
  filters: DashboardFilters;
  dragging: boolean;
  dropSide: DropSide | null;
  onChartType: (value: string) => void;
  onResize: (size: WidgetSize) => void;
  onRemove: () => void;
  onNudge: (direction: -1 | 1) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, side: DropSide) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const WidgetCard = forwardRef<HTMLDivElement, WidgetCardProps>(function WidgetCard(
  { def, item, index, count, span, fullRow, editing, filters, dragging, dropSide, onChartType, onResize, onRemove, onNudge, onDragStart, onDragEnd, onDragOver, onDrop },
  ref,
) {
  const Icon = def.icon;
  const chartType = item.settings?.chartType ?? def.chartTypes?.[0]?.value ?? "";
  const filterNote = [def.periodAware && filters.period !== "12m" && periodLabels[filters.period], def.scopeAware && filters.scopes.length < 3 && filters.scopes.join(", ")]
    .filter(Boolean)
    .join(" · ");

  const handleDragOver = (e: React.DragEvent) => {
    if (!editing) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    // Full-width cards split top/bottom; narrower ones split left/right.
    const side: DropSide = fullRow ? (e.clientY - rect.top < rect.height / 2 ? "before" : "after") : e.clientX - rect.left < rect.width / 2 ? "before" : "after";
    onDragOver(e, side);
  };

  const chartTypeMenu = def.chartTypes && (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">View as</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={chartType} onValueChange={onChartType}>
        {def.chartTypes.map((t) => (
          <DropdownMenuRadioItem key={t.value} value={t.value} className="text-sm">{t.label}</DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: dragging ? 0.4 : 1, scale: dragging ? 0.98 : 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ layout: { type: "spring", stiffness: 420, damping: 38 }, duration: 0.2 }}
      className="relative min-w-0"
      style={{ gridColumn: `span ${span} / span ${span}` }}
      onDragOver={handleDragOver}
      onDrop={editing ? onDrop : undefined}
      data-testid={`widget-${def.id}`}
    >
      {/* drop indicator */}
      {dropSide && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-20 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]",
            fullRow
              ? cn("inset-x-2 h-1", dropSide === "before" ? "-top-[10px]" : "-bottom-[10px]")
              : cn("inset-y-2 w-1", dropSide === "before" ? "-left-[10px]" : "-right-[10px]"),
          )}
        />
      )}

      <section
        draggable={editing}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        aria-roledescription={editing ? "Draggable widget" : undefined}
        className={cn(
          "group/card flex h-full flex-col rounded-2xl border bg-card shadow-card transition-[box-shadow,border-color] duration-200",
          editing
            ? "cursor-grab border-dashed border-primary/35 active:cursor-grabbing hover:border-primary/60 hover:shadow-elevated"
            : "border-border/80 hover:shadow-elevated",
          dropSide && "border-primary/70",
        )}
      >
        {editing && (
          <div className="flex items-center justify-between gap-2 rounded-t-2xl border-b border-dashed border-primary/25 bg-primary/[0.04] py-1.5 pl-2.5 pr-2">
            <span className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover/card:text-primary">
              <GripVertical size={15} className="shrink-0" />
              <span className="truncate">Drag to move</span>
            </span>
            <div className="flex shrink-0 items-center gap-0.5">
              <div role="radiogroup" aria-label="Widget size" className="flex rounded-lg border border-border bg-card p-0.5">
                {WIDGET_SIZES.map((size) => (
                  <Tooltip key={size}>
                    <TooltipTrigger asChild>
                      <button
                        role="radio"
                        aria-checked={item.size === size}
                        aria-label={`${sizeLabel[size]} size`}
                        onClick={() => onResize(size)}
                        className={cn(
                          "h-6 w-7 rounded-md text-[11px] font-semibold transition-all",
                          item.size === size ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card hover:text-foreground",
                        )}
                      >
                        {sizeShort[size]}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{sizeLabel[size]}</TooltipContent>
                  </Tooltip>
                ))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" aria-label={`${def.title} settings`}>
                    <Settings2 size={15} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {chartTypeMenu}
                  {chartTypeMenu && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Size</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={item.size} onValueChange={(v) => onResize(v as WidgetSize)}>
                    {WIDGET_SIZES.map((size) => (
                      <DropdownMenuRadioItem key={size} value={size} className="text-sm">{sizeLabel[size]}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={index === 0} onSelect={() => onNudge(-1)} className="gap-2 text-sm"><ArrowUp size={14} />Move earlier</DropdownMenuItem>
                  <DropdownMenuItem disabled={index === count - 1} onSelect={() => onNudge(1)} className="gap-2 text-sm"><ArrowDown size={14} />Move later</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onRemove} className="gap-2 text-sm text-destructive focus:text-destructive"><X size={14} />Remove widget</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Remove ${def.title}`}>
                    <X size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Remove</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
        <header className="flex items-start gap-3 px-5 pb-3 pt-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[15px] font-semibold leading-tight text-foreground">{def.title}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {def.description}
              {filterNote && <span className="text-primary"> · {filterNote}</span>}
            </p>
          </div>

          {!editing && def.chartTypes && (
            <>
              {/* inline segmented switcher where there's room, menu otherwise */}
              <div role="radiogroup" aria-label="Chart type" className={cn("hidden shrink-0 rounded-lg bg-muted/70 p-0.5", item.size !== "small" && "sm:flex")}>
                {def.chartTypes.map((t) => (
                  <button
                    key={t.value}
                    role="radio"
                    aria-checked={chartType === t.value}
                    onClick={() => onChartType(t.value)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
                      chartType === t.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("h-8 w-8 shrink-0 text-muted-foreground", item.size !== "small" && "sm:hidden")} aria-label={`${def.title} view options`}>
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">{chartTypeMenu}</DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

        </header>

        <div className={cn("flex-1 px-5 pb-5", editing && "pointer-events-none select-none")}>
          <def.Content chartType={chartType} size={item.size} filters={filters} />
        </div>
      </section>
    </motion.div>
  );
});
