import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addWidget,
  DASHBOARD_TEMPLATES,
  type DashboardFilters,
  type DashboardLayoutState,
  type DashboardWidgetItem,
  getDefaultLayout,
  layoutsEqual,
  loadFilters,
  loadLayout,
  moveItem,
  moveItemToSlot,
  removeItem,
  resizeItem,
  sanitizeLayout,
  saveFilters,
  saveLayout,
  setItemSetting,
  type WidgetSize,
} from "@/lib/dashboardLayout";
import { type CustomWidgetDraft, type CustomWidgetSpec, isUserTemplateId, libraryStore } from "@/lib/dashboardLibrary";
import { allWidgetIds, useLibrary } from "./useWidgetRegistry";

/** Same widgets, order and sizes — chart-type preferences don't count as editing a template. */
const sameArrangement = (a: DashboardWidgetItem[], b: DashboardWidgetItem[]) =>
  a.length === b.length && a.every((item, i) => item.id === b[i].id && item.size === b[i].size);

const cloneState = (s: DashboardLayoutState): DashboardLayoutState => ({ ...s, items: s.items.map((i) => ({ ...i, ...(i.settings ? { settings: { ...i.settings } } : {}) })) });

/**
 * Owns the persisted layout, the edit-mode draft, filter preferences and the template /
 * custom-widget operations. View mode renders `saved`; edit mode mutates a draft that only lands on Save.
 */
export function useDashboardLayout() {
  const library = useLibrary();
  const [saved, setSaved] = useState<DashboardLayoutState>(() => loadLayout(allWidgetIds()));
  const [draft, setDraft] = useState<DashboardLayoutState | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(() => loadFilters());

  useEffect(() => saveFilters(filters), [filters]);

  const editing = draft !== null;
  const current = draft ?? saved;
  const dirty = editing && (!layoutsEqual(draft.items, saved.items) || draft.templateId !== saved.templateId);

  const template = useMemo(() => {
    const id = current.templateId;
    if (!id) return undefined;
    const builtIn = DASHBOARD_TEMPLATES.find((t) => t.id === id);
    if (builtIn) return { id, name: builtIn.name, items: builtIn.items, isUser: false };
    const mine = library.templates.find((t) => t.id === id);
    return mine ? { id, name: mine.name, items: mine.items, isUser: true } : undefined;
  }, [current.templateId, library.templates]);

  const templateModified = !!template && !sameArrangement(current.items, template.items);

  /** Apply an item transform to whichever layout is live: the draft while editing, else the saved one. */
  const update = useCallback(
    (fn: (items: DashboardWidgetItem[]) => DashboardWidgetItem[]) => {
      const apply = (state: DashboardLayoutState): DashboardLayoutState => {
        const items = fn(state.items);
        return items === state.items ? state : { ...state, items };
      };
      if (draft) setDraft(apply(draft));
      else setSaved((prev) => saveLayout(apply(prev)));
    },
    [draft],
  );

  /** Replace the live layout wholesale (template switches). */
  const replace = useCallback(
    (next: DashboardLayoutState) => {
      if (draft) setDraft(next);
      else setSaved(saveLayout(next));
    },
    [draft],
  );

  const actions = useMemo(
    () => ({
      startEditing: () => setDraft(cloneState(saved)),
      cancel: () => setDraft(null),
      save: () => {
        if (!draft) return;
        setSaved(saveLayout(draft));
        setDraft(null);
      },
      resetToDefault: () => setDraft(getDefaultLayout()),

      /** Switch to a built-in or saved template. Unknown widgets (e.g. deleted custom ones) are dropped. */
      applyTemplate: (templateId: string) => {
        const source = DASHBOARD_TEMPLATES.find((t) => t.id === templateId)?.items ?? library.templates.find((t) => t.id === templateId)?.items;
        if (!source) return;
        const { items } = sanitizeLayout({ items: source }, allWidgetIds());
        replace({ items, templateId });
      },
      /** Restore a previous saved layout — backs the "Undo" on template toasts. */
      restore: (state: DashboardLayoutState) => setSaved(saveLayout(state)),

      /** Save the current arrangement as a new named template and make it the active one. Commits edit mode. */
      saveAsTemplate: (name: string, description: string) => {
        const created = libraryStore.createTemplate(name, description, current.items);
        setSaved(saveLayout({ ...current, templateId: created.id }));
        setDraft(null);
        return created;
      },
      /** Overwrite a saved template with the current arrangement. Commits edit mode. */
      updateTemplate: (templateId: string) => {
        if (!isUserTemplateId(templateId)) return;
        libraryStore.updateTemplate(templateId, { items: current.items });
        setSaved(saveLayout({ ...current, templateId }));
        setDraft(null);
      },
      renameTemplate: (templateId: string, name: string, description: string) => libraryStore.updateTemplate(templateId, { name, description }),
      deleteTemplate: (templateId: string) => {
        libraryStore.deleteTemplate(templateId);
        // the layout stays; it just no longer belongs to a template
        if (saved.templateId === templateId) setSaved((prev) => saveLayout({ ...prev, templateId: undefined }));
        if (draft?.templateId === templateId) setDraft({ ...draft, templateId: undefined });
      },

      createCustomWidget: (widgetDraft: CustomWidgetDraft, source: CustomWidgetSpec["source"], addToDashboard: boolean) => {
        const spec = libraryStore.saveWidget(widgetDraft, source);
        if (addToDashboard) update((items) => addWidget(items, spec.id, spec.size));
        return spec;
      },
      /** Edit a custom widget. Its chart type follows the new visual, so per-card overrides are cleared. */
      editCustomWidget: (id: string, widgetDraft: CustomWidgetDraft) => {
        const spec = libraryStore.saveWidget(widgetDraft, "builder", id);
        const clear = (items: DashboardWidgetItem[]) =>
          items.some((i) => i.id === id && i.settings?.chartType)
            ? items.map((i) => (i.id === id && i.settings ? { ...i, settings: Object.fromEntries(Object.entries(i.settings).filter(([k]) => k !== "chartType")) } : i))
            : items;
        setSaved((prev) => {
          const items = clear(prev.items);
          return items === prev.items ? prev : saveLayout({ ...prev, items });
        });
        if (draft) setDraft({ ...draft, items: clear(draft.items) });
        return spec;
      },
      /** Delete a custom widget from the library, every template and both the saved and draft layouts. */
      deleteCustomWidget: (id: string) => {
        libraryStore.deleteWidget(id);
        const strip = (items: DashboardWidgetItem[]) => items.filter((i) => i.id !== id);
        setSaved((prev) => (prev.items.some((i) => i.id === id) ? saveLayout({ ...prev, items: strip(prev.items) }) : prev));
        if (draft) setDraft({ ...draft, items: strip(draft.items) });
      },

      moveToSlot: (from: number, slot: number) => update((items) => moveItemToSlot(items, from, slot)),
      nudge: (index: number, direction: -1 | 1) => update((items) => moveItem(items, index, direction)),
      resize: (index: number, size: WidgetSize) => update((items) => resizeItem(items, index, size)),
      remove: (index: number) => update((items) => removeItem(items, index)),
      add: (id: string, size: WidgetSize, slot?: number) => update((items) => addWidget(items, id, size, slot)),
      setSetting: (index: number, key: string, value: string) => update((items) => setItemSetting(items, index, key, value)),
      setFilters,
    }),
    [current, draft, library.templates, replace, saved, update],
  );

  return {
    saved,
    items: current.items,
    templateId: current.templateId,
    template,
    templateModified,
    userTemplates: library.templates,
    editing,
    dirty,
    filters,
    ...actions,
  };
}
