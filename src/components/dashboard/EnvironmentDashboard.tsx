import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Check, ChevronDown, LayoutGrid, LayoutTemplate, PanelRightOpen, Pencil, Plus, RefreshCw, RotateCcw, Save, Settings2, SlidersHorizontal, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ALL_SCOPES, DASHBOARD_TEMPLATES, DEFAULT_FILTERS, type FilterPeriod, type ScopeKey, type WidgetSize } from "@/lib/dashboardLayout";
import { periodLabels, scopeColors } from "./dashboardData";
import { useDashboardLayout } from "./useDashboardLayout";
import { type DropSide, WidgetCard } from "./WidgetCard";
import type { CustomWidgetDraft, CustomWidgetSpec, UserTemplate } from "@/lib/dashboardLibrary";
import { ManageTemplatesDialog, SaveTemplateDialog } from "./TemplateGallery";
import { type BuilderMode, type BuilderTab, WidgetBuilderDialog } from "./WidgetBuilderDialog";
import { NEW_WIDGET_MIME, WidgetLibrary } from "./WidgetLibrary";
import { useWidgetRegistry } from "./useWidgetRegistry";

type DragState = { kind: "move"; from: number } | { kind: "new"; id: string };
type DropTarget = { index: number; side: DropSide } | "end";

const PERIODS: { value: FilterPeriod; label: string }[] = [
  { value: "12m", label: "12M" },
  { value: "6m", label: "6M" },
  { value: "3m", label: "3M" },
];

/**
 * Columns follow the dashboard's own width (not the viewport). While editing, the 4-column
 * layout is held down to a narrower width so opening the side panel doesn't reflow the grid
 * into something different from what will be saved.
 */
function useGridColumns(editing: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const four = editing ? 760 : 1060;
  const columns = !width || width >= four ? 4 : width >= 620 ? 2 : 1;
  return { ref, columns };
}

function useIsDesktop() {
  const query = "(min-width: 1024px)";
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return matches;
}

const spanFor = (size: WidgetSize, columns: number) => (size === "large" ? columns : size === "medium" ? Math.min(2, columns) : 1);

export default function EnvironmentDashboard() {
  const dash = useDashboardLayout();
  const registry = useWidgetRegistry();
  const { items, editing, dirty, filters, template } = dash;
  const { ref: gridRef, columns } = useGridColumns(editing);
  const isDesktop = useIsDesktop();

  const [libraryOpen, setLibraryOpen] = useState(true);
  const [confirm, setConfirm] = useState<"cancel" | "reset" | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);
  const [, forceTick] = useState(0);
  const [templateDialog, setTemplateDialog] = useState<{ mode: "create" | "rename"; template?: UserTemplate } | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [builder, setBuilder] = useState<BuilderMode | null>(null);
  const filtersActive = filters.period !== DEFAULT_FILTERS.period || filters.scopes.length !== ALL_SCOPES.length;

  // keep the "saved x minutes ago" label fresh
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const scrollToWidget = (id: string) =>
    setTimeout(() => document.querySelector(`[data-testid="widget-${id}"]`)?.scrollIntoView?.({ behavior: "smooth", block: "nearest" }), 80);

  /* ── edit lifecycle ── */

  const startEditing = () => {
    dash.startEditing();
    setLibraryOpen(isDesktop);
  };

  const save = useCallback(() => {
    dash.save();
    toast.success("Dashboard saved", { description: "Your layout will be restored next time you visit." });
  }, [dash]);

  const requestCancel = () => (dirty ? setConfirm("cancel") : dash.cancel());

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, save]);

  const applyTemplate = (id: string) => {
    const name = DASHBOARD_TEMPLATES.find((t) => t.id === id)?.name ?? dash.userTemplates.find((t) => t.id === id)?.name;
    if (editing) {
      dash.applyTemplate(id);
      return;
    }
    const previous = dash.saved;
    dash.applyTemplate(id);
    toast(`Switched to ${name}`, { action: { label: "Undo", onClick: () => dash.restore(previous) } });
  };

  const addWidget = (id: string, size: WidgetSize, slot?: number) => {
    dash.add(id, size, slot);
    scrollToWidget(id);
    if (!isDesktop) toast.success(`${registry.byId(id)?.title} added`);
  };

  /* ── templates ── */

  const submitTemplateDialog = (name: string, description: string) => {
    if (templateDialog?.mode === "rename" && templateDialog.template) {
      dash.renameTemplate(templateDialog.template.id, name, description);
      toast.success("Template renamed");
    } else {
      dash.saveAsTemplate(name, description);
      toast.success(`Saved as “${name}”`, { description: "Your layout is saved and listed under My templates." });
    }
    setTemplateDialog(null);
  };

  const updateCurrentTemplate = () => {
    if (!template?.isUser) return;
    dash.updateTemplate(template.id);
    toast.success(`“${template.name}” updated`, { description: "The template now matches this layout." });
  };

  const deleteTemplate = (t: UserTemplate) => {
    dash.deleteTemplate(t.id);
    toast(`Deleted “${t.name}”`);
  };

  /* ── custom widgets ── */

  const openBuilder = (tab: BuilderTab) => {
    if (!isDesktop) setLibraryOpen(false);
    setBuilder({ kind: "create", tab });
  };

  const editCustomWidget = (id: string) => {
    const spec = registry.specs.find((w) => w.id === id);
    if (!spec) return;
    if (!isDesktop) setLibraryOpen(false);
    setBuilder({ kind: "edit", spec });
  };

  const createCustomWidget = (draft: CustomWidgetDraft, source: CustomWidgetSpec["source"], addNow: boolean) => {
    const spec = dash.createCustomWidget(draft, source, addNow);
    setBuilder(null);
    if (addNow) scrollToWidget(spec.id);
    toast.success(`“${spec.title}” created`, {
      description: addNow ? (editing ? "Added to your dashboard — save the layout to keep it." : "Added to your dashboard.") : "Find it under Custom in the widget library.",
    });
  };

  const updateCustomWidget = (id: string, draft: CustomWidgetDraft) => {
    const spec = dash.editCustomWidget(id, draft);
    setBuilder(null);
    toast.success(`“${spec.title}” updated`);
  };

  /* ── drag & drop ── */

  const slotOf = (t: DropTarget) => (t === "end" ? items.length : t.side === "before" ? t.index : t.index + 1);
  const isNoop = (t: DropTarget) => drag?.kind === "move" && (slotOf(t) === drag.from || slotOf(t) === drag.from + 1);

  const updateTarget = (next: DropTarget) =>
    setTarget((prev) => (prev === next || (prev && next !== "end" && prev !== "end" && prev.index === next.index && prev.side === next.side) ? prev : next));

  const endDrag = () => {
    setDrag(null);
    setTarget(null);
  };

  const handleDrop = (e: React.DragEvent, fallback: DropTarget = "end") => {
    e.preventDefault();
    e.stopPropagation();
    const t = target ?? fallback;
    const newId = drag?.kind === "new" ? drag.id : e.dataTransfer.getData(NEW_WIDGET_MIME);
    if (drag?.kind === "move") {
      if (!isNoop(t)) dash.moveToSlot(drag.from, slotOf(t));
    } else if (newId) {
      const def = registry.byId(newId);
      if (def) addWidget(def.id, def.defaultSize, slotOf(t));
    }
    endDrag();
  };

  const visibleTarget = target && drag && !isNoop(target) ? target : null;

  /* ── render ── */

  const library = (
    <WidgetLibrary
      widgets={registry.all}
      items={items}
      templateId={dash.templateId}
      templateModified={dash.templateModified}
      userTemplates={dash.userTemplates}
      onAdd={(id, size) => addWidget(id, size)}
      onRemove={(id) => dash.remove(items.findIndex((i) => i.id === id))}
      onCreateWidget={openBuilder}
      onEditWidget={editCustomWidget}
      onDeleteWidget={(id) => {
        const title = registry.byId(id)?.title;
        dash.deleteCustomWidget(id);
        toast(`Deleted “${title}”`);
      }}
      onApplyTemplate={dash.applyTemplate}
      onSaveTemplate={() => setTemplateDialog({ mode: "create" })}
      onRenameTemplate={(t) => setTemplateDialog({ mode: "rename", template: t })}
      onDeleteTemplate={deleteTemplate}
      onDragNewStart={(id) => setDrag({ kind: "new", id })}
      onDragNewEnd={endDrag}
      onClose={() => setLibraryOpen(false)}
    />
  );

  return (
    <div className="flex min-h-0 flex-1">
      <main className="og-scroll min-w-0 flex-1 overflow-y-auto">
        {/* Edit bar */}
        <AnimatePresence initial={false}>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="sticky top-0 z-30 border-b border-primary/20 bg-card/90 px-4 py-3 shadow-card backdrop-blur-md sm:px-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><LayoutGrid size={17} /></span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      Editing dashboard
                      {dirty ? (
                        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">Unsaved changes</span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">No changes</span>
                      )}
                    </p>
                    <p className="hidden truncate text-xs text-muted-foreground sm:block">Drag cards to rearrange · use S / M / L to resize · settings for chart type</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={libraryOpen ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setLibraryOpen((o) => !o)}
                    aria-pressed={libraryOpen}
                  >
                    {libraryOpen && isDesktop ? <PanelRightOpen size={14} /> : <Plus size={14} />}
                    Add widgets
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setConfirm("reset")}>
                    <RotateCcw size={14} />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={requestCancel}>Cancel</Button>
                  <div className="flex rounded-md shadow-sm">
                    <Button size="sm" className="gap-1.5 rounded-r-none" onClick={save}>
                      <Save size={14} />
                      Save layout
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="rounded-l-none border-l border-primary-foreground/25 px-2" aria-label="More save options">
                          <ChevronDown size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-72">
                        <DropdownMenuItem onSelect={() => setTemplateDialog({ mode: "create" })} className="flex items-start gap-2.5 py-2">
                          <LayoutTemplate size={15} className="mt-0.5 text-primary" />
                          <span>
                            <span className="block text-sm font-medium">Save as new template…</span>
                            <span className="block text-xs text-muted-foreground">Name this layout so you can switch back to it</span>
                          </span>
                        </DropdownMenuItem>
                        {template?.isUser && (
                          <DropdownMenuItem onSelect={updateCurrentTemplate} className="flex items-start gap-2.5 py-2">
                            <RefreshCw size={15} className="mt-0.5 text-primary" />
                            <span>
                              <span className="block text-sm font-medium">Save and update “{template.name}”</span>
                              <span className="block text-xs text-muted-foreground">Overwrite your template with this layout</span>
                            </span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-6 sm:px-6">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Environment Dashboard</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                {template ? (
                  <span className="flex items-center gap-1.5">
                    {template.isUser ? <User size={13} className="text-primary" /> : <LayoutTemplate size={13} className="text-primary" />}
                    <span className="font-medium text-foreground">{template.name}</span>
                    {dash.templateModified && <span className="rounded-full bg-muted px-1.5 py-px text-[11px] font-medium text-muted-foreground">edited</span>}
                  </span>
                ) : (
                  <span>Custom layout</span>
                )}
                <span aria-hidden>·</span>
                <span>{items.length} widgets</span>
                {dash.saved.savedAt && !editing && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Saved {formatDistanceToNow(new Date(dash.saved.savedAt), { addSuffix: true })}</span>
                  </>
                )}
              </p>
            </div>
            {!editing && (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 bg-card">
                      <LayoutTemplate size={14} />
                      Templates
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-[70vh] w-72 overflow-y-auto">
                    {dash.userTemplates.length > 0 && (
                      <>
                        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground"><User size={12} />My templates</DropdownMenuLabel>
                        {dash.userTemplates.map((t) => (
                          <DropdownMenuItem key={t.id} onSelect={() => applyTemplate(t.id)} className="flex items-start gap-2 py-2">
                            <span className="mt-0.5 w-4 shrink-0 text-primary">{t.id === dash.templateId && <Check size={14} />}</span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">{t.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">{t.description || `${t.items.length} widgets`}</span>
                            </span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground"><LayoutTemplate size={12} />Built-in</DropdownMenuLabel>
                    {DASHBOARD_TEMPLATES.map((t) => (
                      <DropdownMenuItem key={t.id} onSelect={() => applyTemplate(t.id)} className="flex items-start gap-2 py-2">
                        <span className="mt-0.5 w-4 shrink-0 text-primary">{t.id === dash.templateId && <Check size={14} />}</span>
                        <span>
                          <span className="block text-sm font-medium text-foreground">{t.name}</span>
                          <span className="block text-xs text-muted-foreground">{t.description}</span>
                        </span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setTemplateDialog({ mode: "create" })} className="gap-2">
                      <Plus size={14} className="text-primary" />Save current layout as template…
                    </DropdownMenuItem>
                    {template?.isUser && dash.templateModified && (
                      <DropdownMenuItem onSelect={updateCurrentTemplate} className="gap-2">
                        <RefreshCw size={14} className="text-primary" />Update “{template.name}”
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => setManageOpen(true)} className="gap-2">
                      <Settings2 size={14} className="text-muted-foreground" />Manage templates…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" className="gap-1.5 shadow-sm" onClick={startEditing}>
                  <Pencil size={14} />
                  Customize
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-card">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><SlidersHorizontal size={13} />Filters</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Period</span>
              <div role="radiogroup" aria-label="Period" className="flex rounded-lg bg-muted/70 p-0.5">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    role="radio"
                    aria-checked={filters.period === p.value}
                    title={periodLabels[p.value]}
                    onClick={() => dash.setFilters({ ...filters, period: p.value })}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-all",
                      filters.period === p.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-xs text-muted-foreground">Scopes</span>
              {ALL_SCOPES.map((scope: ScopeKey) => {
                const on = filters.scopes.includes(scope);
                const only = on && filters.scopes.length === 1;
                return (
                  <button
                    key={scope}
                    aria-pressed={on}
                    disabled={only}
                    title={only ? "At least one scope stays selected" : undefined}
                    onClick={() => dash.setFilters({ ...filters, scopes: on ? filters.scopes.filter((s) => s !== scope) : ALL_SCOPES.filter((s) => s === scope || filters.scopes.includes(s)) })}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed",
                      on ? "border-border bg-card text-foreground shadow-sm" : "border-dashed border-border text-muted-foreground opacity-70 hover:opacity-100",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full transition-opacity", !on && "opacity-40")} style={{ background: scopeColors[scope] }} />
                    {scope}
                  </button>
                );
              })}
            </div>
            <span className="ml-auto text-xs text-muted-foreground">{periodLabels[filters.period]}</span>
            {filtersActive && (
              <button onClick={() => dash.setFilters({ ...DEFAULT_FILTERS, scopes: [...ALL_SCOPES] })} className="text-xs font-medium text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>

          {/* Grid */}
          <div ref={gridRef} className="relative mt-5">
            {editing && (
              <div aria-hidden className="pointer-events-none absolute inset-0 grid gap-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {Array.from({ length: columns }, (_, i) => (
                  <div key={i} className="rounded-2xl border border-dashed border-primary/15 bg-primary/[0.025]" />
                ))}
              </div>
            )}

            {items.length === 0 && !editing ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LayoutGrid size={22} /></span>
                <p className="font-display text-base font-semibold text-foreground">Your dashboard is empty</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Add widgets from the library or start from a prebuilt template.</p>
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => applyTemplate("sustainability-overview")}>Use default template</Button>
                  <Button size="sm" onClick={startEditing} className="gap-1.5"><Plus size={14} />Add widgets</Button>
                </div>
              </div>
            ) : (
              <div
                className="relative grid gap-5"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                onDragOver={(e) => editing && drag && e.preventDefault()}
                onDrop={(e) => editing && handleDrop(e)}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((item, index) => {
                    const def = registry.byId(item.id);
                    if (!def) return null;
                    return (
                        <WidgetCard
                          key={item.id}
                          def={def}
                          item={item}
                          index={index}
                          count={items.length}
                          span={spanFor(item.size, columns)}
                          fullRow={spanFor(item.size, columns) === columns}
                          editing={editing}
                          filters={filters}
                          dragging={drag?.kind === "move" && drag.from === index}
                          dropSide={visibleTarget && visibleTarget !== "end" && visibleTarget.index === index ? visibleTarget.side : null}
                          onChartType={(v) => dash.setSetting(index, "chartType", v)}
                          onResize={(size) => dash.resize(index, size)}
                          onRemove={() => dash.remove(index)}
                          onNudge={(dir) => dash.nudge(index, dir)}
                          onEditCustom={def.custom ? () => editCustomWidget(def.id) : undefined}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", item.id);
                            setDrag({ kind: "move", from: index });
                          }}
                          onDragEnd={endDrag}
                          onDragOver={(_, side) => updateTarget({ index, side })}
                          onDrop={(e) => handleDrop(e, { index, side: "after" })}
                        />
                    );
                  })}
                </AnimatePresence>

                {editing && (
                  <motion.button
                    layout
                    type="button"
                    onClick={() => setLibraryOpen(true)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      updateTarget("end");
                    }}
                    onDrop={(e) => handleDrop(e, "end")}
                    style={{ gridColumn: `span ${columns} / span ${columns}` }}
                    className={cn(
                      "flex min-h-[112px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-sm transition-colors",
                      visibleTarget === "end" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    <Plus size={20} />
                    <span className="font-medium">{drag ? "Drop here to place at the end" : items.length ? "Add a widget" : "Your dashboard is empty — add a widget to get started"}</span>
                    {!drag && <span className="text-xs text-muted-foreground">Browse the library or drag a widget here</span>}
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Widget library: docked on desktop, sheet on smaller screens */}
      <AnimatePresence initial={false}>
        {editing && libraryOpen && isDesktop && (
          <motion.aside
            key="library"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="shrink-0 overflow-hidden border-l border-border bg-card"
            aria-label="Widget library"
          >
            <div className="h-full w-[340px]">{library}</div>
          </motion.aside>
        )}
      </AnimatePresence>
      {!isDesktop && (
        <Sheet open={editing && libraryOpen} onOpenChange={setLibraryOpen}>
          <SheetContent side="right" className="w-full max-w-sm p-0 [&>button]:hidden">
            <SheetTitle className="sr-only">Widget library</SheetTitle>
            {library}
          </SheetContent>
        </Sheet>
      )}

      <SaveTemplateDialog
        open={templateDialog !== null}
        onOpenChange={(open) => !open && setTemplateDialog(null)}
        mode={templateDialog?.mode ?? "create"}
        template={templateDialog?.template}
        items={items}
        userTemplates={dash.userTemplates}
        onSubmit={submitTemplateDialog}
      />
      <ManageTemplatesDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        userTemplates={dash.userTemplates}
        activeId={dash.templateId}
        activeModified={dash.templateModified}
        onApply={applyTemplate}
        onRename={(t) => setTemplateDialog({ mode: "rename", template: t })}
        onDelete={deleteTemplate}
        onSaveCurrent={() => setTemplateDialog({ mode: "create" })}
      />
      <WidgetBuilderDialog
        open={builder !== null}
        onOpenChange={(open) => !open && setBuilder(null)}
        mode={builder ?? { kind: "create", tab: "build" }}
        filters={filters}
        onCreate={createCustomWidget}
        onUpdate={updateCustomWidget}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "reset" ? "Reset to the default layout?" : "Discard unsaved changes?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "reset"
                ? "This replaces your current arrangement with the Sustainability Overview template. Nothing is saved until you click Save layout."
                : "Your edits to this dashboard will be lost and the last saved layout restored."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{confirm === "reset" ? "Keep current" : "Keep editing"}</AlertDialogCancel>
            <AlertDialogAction
              className={cn(confirm === "cancel" && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              onClick={() => {
                if (confirm === "reset") dash.resetToDefault();
                else dash.cancel();
                setConfirm(null);
              }}
            >
              {confirm === "reset" ? "Reset layout" : "Discard changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
