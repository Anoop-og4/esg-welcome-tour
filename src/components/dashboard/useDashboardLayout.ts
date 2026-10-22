import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addWidget,
  type DashboardFilters,
  type DashboardLayoutState,
  type DashboardWidgetItem,
  getDefaultLayout,
  getTemplateLayout,
  layoutsEqual,
  loadFilters,
  loadLayout,
  moveItem,
  moveItemToSlot,
  removeItem,
  resizeItem,
  saveFilters,
  saveLayout,
  setItemSetting,
  type WidgetSize,
} from "@/lib/dashboardLayout";
import { WIDGET_IDS } from "./widgets";

/**
 * Owns the persisted layout, the edit-mode draft and the filter preferences.
 * View mode renders `saved`; edit mode mutates a draft that only lands on Save.
 */
export function useDashboardLayout() {
  const [saved, setSaved] = useState<DashboardLayoutState>(() => loadLayout(WIDGET_IDS));
  const [draft, setDraft] = useState<DashboardLayoutState | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(() => loadFilters());

  useEffect(() => saveFilters(filters), [filters]);

  const editing = draft !== null;
  const current = draft ?? saved;
  const dirty = editing && (!layoutsEqual(draft.items, saved.items) || draft.templateId !== saved.templateId);

  /** Apply an item transform to whichever layout is live: the draft while editing, else the saved one. */
  const update = useCallback(
    (fn: (items: DashboardWidgetItem[]) => DashboardWidgetItem[], keepTemplate = false) => {
      const apply = (state: DashboardLayoutState): DashboardLayoutState => {
        const items = fn(state.items);
        if (items === state.items) return state;
        return { ...state, items, templateId: keepTemplate ? state.templateId : undefined };
      };
      if (draft) setDraft(apply(draft));
      else setSaved((prev) => saveLayout(apply(prev)));
    },
    [draft],
  );

  const actions = useMemo(
    () => ({
      startEditing: () => setDraft({ ...saved, items: saved.items.map((i) => ({ ...i, settings: i.settings && { ...i.settings } })) }),
      cancel: () => setDraft(null),
      save: () => {
        if (!draft) return;
        setSaved(saveLayout(draft));
        setDraft(null);
      },
      resetToDefault: () => setDraft(getDefaultLayout()),
      applyTemplate: (templateId: string) => {
        const next = getTemplateLayout(templateId);
        if (draft) setDraft(next);
        else setSaved(saveLayout(next));
      },
      /** Restore a previous saved layout — backs the "Undo" on template toasts. */
      restore: (state: DashboardLayoutState) => setSaved(saveLayout(state)),
      moveToSlot: (from: number, slot: number) => update((items) => moveItemToSlot(items, from, slot)),
      nudge: (index: number, direction: -1 | 1) => update((items) => moveItem(items, index, direction)),
      resize: (index: number, size: WidgetSize) => update((items) => resizeItem(items, index, size)),
      remove: (index: number) => update((items) => removeItem(items, index)),
      add: (id: string, size: WidgetSize, slot?: number) => update((items) => addWidget(items, id, size, slot)),
      /** View settings (chart type) are a preference, not a layout change, so they keep the template tag. */
      setSetting: (index: number, key: string, value: string) => update((items) => setItemSetting(items, index, key, value), true),
      setFilters,
    }),
    [draft, saved, update],
  );

  return { saved, items: current.items, templateId: current.templateId, editing, dirty, filters, ...actions };
}
