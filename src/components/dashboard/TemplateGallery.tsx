import { useEffect, useState } from "react";
import { Check, LayoutTemplate, MoreHorizontal, Pencil, Plus, Trash2, User } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DASHBOARD_TEMPLATES, type DashboardWidgetItem, type WidgetSize } from "@/lib/dashboardLayout";
import { isCustomWidgetId, TEMPLATE_NAME_MAX, type UserTemplate, validateTemplateName } from "@/lib/dashboardLibrary";

const spanFor: Record<WidgetSize, string> = { small: "col-span-1", medium: "col-span-2", large: "col-span-4" };

/** Tiny 4-column schematic of a layout. */
export function TemplatePreview({ items, className }: { items: DashboardWidgetItem[]; className?: string }) {
  if (!items.length) return <div className={cn("rounded-lg bg-muted/50 p-1.5 text-center text-[10px] text-muted-foreground", className)}>Empty layout</div>;
  return (
    <div className={cn("grid grid-cols-4 gap-1 rounded-lg bg-muted/50 p-1.5", className)}>
      {items.map((item, i) => (
        <span
          key={`${item.id}-${i}`}
          className={cn("h-3 rounded-[3px]", spanFor[item.size], i === 0 ? "bg-primary/50" : "bg-primary/20")}
          style={isCustomWidgetId(item.id) ? { background: "color-mix(in srgb, var(--chart-2) 45%, transparent)" } : undefined}
        />
      ))}
    </div>
  );
}

/* ── Save / rename dialog ─────────────────────────────────── */

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "rename";
  items: DashboardWidgetItem[];
  userTemplates: UserTemplate[];
  /** template being renamed */
  template?: UserTemplate;
  onSubmit: (name: string, description: string) => void;
}

export function SaveTemplateDialog({ open, onOpenChange, mode, items, userTemplates, template, onSubmit }: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setTouched(false);
  }, [open, template]);

  const error = validateTemplateName(name, userTemplates, template?.id);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!error) onSubmit(name.trim(), description.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><LayoutTemplate size={16} /></span>
              {mode === "create" ? "Save as template" : "Rename template"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Saves this layout — widgets, sizes and chart choices — under a name you can switch back to any time."
                : "Update how this template appears in your template list."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-name">Template name</Label>
              <span className={cn("text-[11px] tabular-nums", name.length > TEMPLATE_NAME_MAX ? "text-destructive" : "text-muted-foreground")}>{name.length}/{TEMPLATE_NAME_MAX}</span>
            </div>
            <Input
              id="template-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name && setTouched(true)}
              placeholder="e.g. Plant operations review"
              aria-invalid={touched && !!error}
              aria-describedby="template-name-error"
              className={cn(touched && error && "border-destructive focus-visible:ring-destructive")}
            />
            {touched && error && <p id="template-name-error" className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-desc">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea id="template-desc" value={description} onChange={(e) => setDescription(e.target.value.slice(0, 140))} rows={2} placeholder="Who is it for, what does it focus on?" className="resize-none" />
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{mode === "create" ? "Layout to save" : "Layout"} · {(template?.items ?? items).length} widgets</p>
            <TemplatePreview items={template?.items ?? items} />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={touched && !!error}>{mode === "create" ? "Save template" : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Gallery ──────────────────────────────────────────────── */

interface TemplateGalleryProps {
  userTemplates: UserTemplate[];
  activeId?: string;
  activeModified?: boolean;
  onApply: (id: string) => void;
  onRename: (template: UserTemplate) => void;
  onDelete: (template: UserTemplate) => void;
  onSaveCurrent: () => void;
  className?: string;
}

function TemplateTile({ name, description, items, active, edited, onApply, actions }: {
  name: string;
  description: string;
  items: DashboardWidgetItem[];
  active: boolean;
  edited: boolean;
  onApply: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn("group/tpl relative rounded-xl border transition-all hover:border-primary/40 hover:shadow-card", active ? "border-primary/50 bg-primary/5" : "border-border bg-card")}>
      <button onClick={onApply} className="w-full p-3 pr-10 text-left" aria-label={`Apply ${name} template`}>
        <span className="mb-0.5 flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="truncate">{name}</span>
          {active && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary">
              <Check size={12} />
              {edited ? "Current · edited" : "Current"}
            </span>
          )}
        </span>
        <span className="mb-2.5 block truncate text-xs text-muted-foreground">{description || "No description"} · {items.length} widgets</span>
        <TemplatePreview items={items} />
      </button>
      {actions && <div className="absolute right-2 top-2">{actions}</div>}
    </div>
  );
}

export function TemplateGallery({ userTemplates, activeId, activeModified, onApply, onRename, onDelete, onSaveCurrent, className }: TemplateGalleryProps) {
  const [pendingDelete, setPendingDelete] = useState<UserTemplate | null>(null);
  return (
    <div className={cn("space-y-5", className)}>
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><User size={12} />My templates</h3>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary" onClick={onSaveCurrent}>
            <Plus size={12} />Save current
          </Button>
        </div>
        {userTemplates.length === 0 ? (
          <button onClick={onSaveCurrent} className="w-full rounded-xl border border-dashed border-border px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
            <p className="text-sm font-medium text-foreground">No saved templates yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Save this layout under a name to reuse it later.</p>
          </button>
        ) : (
          userTemplates.map((t) => (
            <TemplateTile
              key={t.id}
              name={t.name}
              description={t.description}
              items={t.items}
              active={t.id === activeId}
              edited={!!activeModified}
              onApply={() => onApply(t.id)}
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label={`${t.name} options`}>
                      <MoreHorizontal size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2" onSelect={() => onRename(t)}><Pencil size={14} />Rename</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={() => setPendingDelete(t)}><Trash2 size={14} />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))
        )}
      </section>

      <section className="space-y-2.5">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><LayoutTemplate size={12} />Built-in</h3>
        {DASHBOARD_TEMPLATES.map((t) => (
          <TemplateTile key={t.id} name={t.name} description={t.description} items={t.items} active={t.id === activeId} edited={!!activeModified} onApply={() => onApply(t.id)} />
        ))}
      </section>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>The template is removed from your list. Your current dashboard stays exactly as it is.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep template</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** "Manage templates" dialog for view mode — the same gallery the edit panel shows. */
export function ManageTemplatesDialog({ open, onOpenChange, ...gallery }: TemplateGalleryProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Templates</DialogTitle>
          <DialogDescription>Switch layouts, or rename and delete the ones you've saved.</DialogDescription>
        </DialogHeader>
        <div className="og-scroll -mx-6 min-h-0 flex-1 overflow-y-auto px-6 pb-1">
          <TemplateGallery
            {...gallery}
            onApply={(id) => {
              gallery.onApply(id);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
