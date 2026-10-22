import { useMemo, useState } from "react";
import { Check, GripVertical, MoreHorizontal, Pencil, Plus, Search, SlidersHorizontal, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { DashboardWidgetItem, WidgetSize } from "@/lib/dashboardLayout";
import type { UserTemplate } from "@/lib/dashboardLibrary";
import type { WidgetCategory, WidgetDefinition } from "./chartKit";
import { TemplateGallery } from "./TemplateGallery";
import type { BuilderTab } from "./WidgetBuilderDialog";
import { widgetCategories } from "./widgets";

export const NEW_WIDGET_MIME = "application/x-env-widget";

interface WidgetLibraryProps {
  widgets: WidgetDefinition[];
  items: DashboardWidgetItem[];
  templateId?: string;
  templateModified: boolean;
  userTemplates: UserTemplate[];
  onAdd: (id: string, size: WidgetSize) => void;
  onRemove: (id: string) => void;
  onCreateWidget: (tab: BuilderTab) => void;
  onEditWidget: (id: string) => void;
  onDeleteWidget: (id: string) => void;
  onApplyTemplate: (id: string) => void;
  onSaveTemplate: () => void;
  onRenameTemplate: (template: UserTemplate) => void;
  onDeleteTemplate: (template: UserTemplate) => void;
  onDragNewStart: (id: string) => void;
  onDragNewEnd: () => void;
  onClose?: () => void;
}

export function WidgetLibrary(props: WidgetLibraryProps) {
  const { widgets, items, onAdd, onRemove, onCreateWidget, onEditWidget, onDeleteWidget, onDragNewStart, onDragNewEnd, onClose } = props;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WidgetCategory | "All">("All");
  const [pendingDelete, setPendingDelete] = useState<WidgetDefinition | null>(null);

  const customCount = widgets.filter((w) => w.custom).length;
  const categories: (WidgetCategory | "All")[] = ["All", ...widgetCategories, ...(customCount ? (["Custom"] as const) : [])];
  const activeCategory = categories.includes(category) ? category : "All";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return widgets
      .filter((w) => (activeCategory === "All" || w.category === activeCategory) && (!q || `${w.title} ${w.description} ${w.keywords} ${w.category}`.toLowerCase().includes(q)))
      // newest custom widgets first, then the built-in catalogue
      .sort((a, b) => Number(!!b.custom) - Number(!!a.custom));
  }, [query, activeCategory, widgets]);

  const onBoard = new Set(items.map((i) => i.id));
  const available = widgets.filter((w) => !onBoard.has(w.id)).length;

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
          <div className="og-scroll min-h-0 flex-1 overflow-y-auto">
            {/* Create */}
            <div className="px-4 pt-3">
              <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3.5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"><Plus size={17} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Create a widget</p>
                    <p className="text-xs text-muted-foreground">Chart any metric your way, or describe it to OG.</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 bg-card text-xs" onClick={() => onCreateWidget("build")}>
                    <SlidersHorizontal size={13} />Build
                  </Button>
                  <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => onCreateWidget("assistant")}>
                    <Sparkles size={13} />Ask OG
                  </Button>
                </div>
              </div>
            </div>

            <div className="sticky top-0 z-10 space-y-2.5 bg-card px-4 pb-2 pt-3">
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
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    aria-pressed={activeCategory === c}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                      activeCategory === c ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {c}
                    {c === "Custom" && <span className="ml-1 opacity-70">{customCount}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 px-4 pb-4 pt-1">
              {results.length === 0 && (
                <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                  <p className="text-sm font-medium text-foreground">No widgets match “{query}”</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try “water” or “scope” — or create one.</p>
                  <Button size="sm" variant="outline" className="mt-3 h-8 gap-1.5 text-xs" onClick={() => onCreateWidget("assistant")}>
                    <Sparkles size={13} />Ask OG to build it
                  </Button>
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
                    data-testid={`library-${w.id}`}
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
                      <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                        {w.custom ? <span className="rounded bg-primary/10 px-1.5 py-px text-primary">Custom</span> : w.category}
                        {w.chartTypes && <span>· {w.chartTypes.length} views</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <div className="flex items-center gap-0.5">
                        {added ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-success"><Check size={12} />Added</span>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => onAdd(w.id, w.defaultSize)} aria-label={`Add ${w.title}`}>
                            <Plus size={12} />Add
                          </Button>
                        )}
                        {w.custom && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label={`${w.title} options`}>
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem className="gap-2" onSelect={() => onEditWidget(w.id)}><Pencil size={14} />Edit widget</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={() => setPendingDelete(w)}><Trash2 size={14} />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {added && (
                        <button onClick={() => onRemove(w.id)} className="text-[11px] text-muted-foreground underline-offset-2 hover:text-destructive hover:underline">Remove</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="og-scroll mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3 data-[state=inactive]:hidden">
          <TemplateGallery
            userTemplates={props.userTemplates}
            activeId={props.templateId}
            activeModified={props.templateModified}
            onApply={props.onApplyTemplate}
            onRename={props.onRenameTemplate}
            onDelete={props.onDeleteTemplate}
            onSaveCurrent={props.onSaveTemplate}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>This custom widget is removed from the library, your dashboard and any templates that use it. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep widget</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) onDeleteWidget(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete widget
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
