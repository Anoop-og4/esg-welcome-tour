import { useMemo, useState } from "react";
import { Check, GripVertical, LayoutTemplate, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DASHBOARD_TEMPLATES, type DashboardWidgetItem, type WidgetSize } from "@/lib/dashboardLayout";
import { widgetCategories, WIDGETS, type WidgetCategory } from "./widgets";

export const NEW_WIDGET_MIME = "application/x-env-widget";

interface WidgetLibraryProps {
  items: DashboardWidgetItem[];
  templateId?: string;
  onAdd: (id: string, size: WidgetSize) => void;
  onRemove: (id: string) => void;
  onApplyTemplate: (id: string) => void;
  onDragNewStart: (id: string) => void;
  onDragNewEnd: () => void;
  onClose?: () => void;
}

const spanFor: Record<WidgetSize, string> = { small: "col-span-1", medium: "col-span-2", large: "col-span-4" };

/** Tiny 4-column schematic of a template's layout. */
function TemplatePreview({ items }: { items: DashboardWidgetItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted/50 p-1.5">
      {items.map((item, i) => (
        <span key={`${item.id}-${i}`} className={cn("h-3 rounded-[3px]", spanFor[item.size], i === 0 ? "bg-primary/50" : "bg-primary/20")} />
      ))}
    </div>
  );
}

export function WidgetLibrary({ items, templateId, onAdd, onRemove, onApplyTemplate, onDragNewStart, onDragNewEnd, onClose }: WidgetLibraryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WidgetCategory | "All">("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WIDGETS.filter((w) => (category === "All" || w.category === category) && (!q || `${w.title} ${w.description} ${w.keywords} ${w.category}`.toLowerCase().includes(q)));
  }, [query, category]);

  const onBoard = new Set(items.map((i) => i.id));
  const available = WIDGETS.filter((w) => !onBoard.has(w.id)).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3.5">
        <div>
          <h2 className="font-display text-sm font-semibold text-foreground">Add widgets</h2>
          <p className="text-xs text-muted-foreground">{available ? `${available} available · drag onto the grid or click Add` : "Every widget is on your dashboard"}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close widget library">
            <X size={16} />
          </Button>
        )}
      </div>

      <Tabs defaultValue="widgets" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-2">
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
          <div className="space-y-2.5 px-4 pb-2 pt-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search widgets…" className="h-9 pl-8 text-sm" aria-label="Search widgets" />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["All", ...widgetCategories] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    category === c ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="og-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4 pt-1">
            {results.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No widgets match “{query}”</p>
                <p className="mt-1 text-xs text-muted-foreground">Try “water”, “scope” or “energy”.</p>
              </div>
            )}
            {results.map((w) => {
              const added = onBoard.has(w.id);
              const Icon = w.icon;
              return (
                <div
                  key={w.id}
                  draggable={!added}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(NEW_WIDGET_MIME, w.id);
                    e.dataTransfer.setData("text/plain", w.id);
                    e.dataTransfer.effectAllowed = "copy";
                    onDragNewStart(w.id);
                  }}
                  onDragEnd={onDragNewEnd}
                  className={cn(
                    "group/lib flex items-start gap-3 rounded-xl border p-3 transition-all",
                    added ? "border-border/60 bg-muted/30" : "cursor-grab border-border bg-card hover:-translate-y-px hover:border-primary/40 hover:shadow-card active:cursor-grabbing",
                  )}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", added ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">{w.title}</p>
                      {!added && <GripVertical size={13} className="shrink-0 text-muted-foreground/0 transition-colors group-hover/lib:text-muted-foreground" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{w.description}</p>
                    <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                      {w.category}
                      {w.chartTypes && ` · ${w.chartTypes.length} views`}
                    </p>
                  </div>
                  {added ? (
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-success"><Check size={12} />Added</span>
                      <button onClick={() => onRemove(w.id)} className="text-[11px] text-muted-foreground underline-offset-2 hover:text-destructive hover:underline">Remove</button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 shrink-0 gap-1 px-2 text-xs" onClick={() => onAdd(w.id, w.defaultSize)} aria-label={`Add ${w.title}`}>
                      <Plus size={12} />Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="og-scroll mt-0 min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pb-4 pt-3 data-[state=inactive]:hidden">
          <p className="text-xs text-muted-foreground">Start from a prebuilt layout. You can still adjust it before saving.</p>
          {DASHBOARD_TEMPLATES.map((t) => {
            const active = t.id === templateId;
            return (
              <button
                key={t.id}
                onClick={() => onApplyTemplate(t.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-all hover:border-primary/40 hover:shadow-card",
                  active ? "border-primary/50 bg-primary/5" : "border-border bg-card",
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground"><LayoutTemplate size={14} className="text-primary" />{t.name}</span>
                  {active && <span className="flex items-center gap-1 text-[11px] font-medium text-primary"><Check size={12} />Current</span>}
                </div>
                <p className="mb-2.5 text-xs text-muted-foreground">{t.description} · {t.items.length} widgets</p>
                <TemplatePreview items={t.items} />
              </button>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
