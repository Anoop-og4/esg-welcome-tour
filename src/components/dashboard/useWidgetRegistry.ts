import { useMemo, useSyncExternalStore } from "react";
import { libraryStore } from "@/lib/dashboardLibrary";
import type { WidgetDefinition } from "./chartKit";
import { customWidgetDefinition } from "./customWidgets";
import { WIDGETS } from "./widgets";

/** Live view of the user library (custom widgets + saved templates). */
export function useLibrary() {
  return useSyncExternalStore(libraryStore.subscribe, libraryStore.getState, libraryStore.getState);
}

/** Every widget available to the dashboard. Definitions are rebuilt only when the custom specs change. */
export function useWidgetRegistry() {
  const { widgets: specs } = useLibrary();
  return useMemo(() => {
    const all: WidgetDefinition[] = [...WIDGETS, ...specs.map(customWidgetDefinition)];
    const map = new Map(all.map((d) => [d.id, d]));
    return { all, specs, byId: (id: string) => map.get(id), ids: all.map((d) => d.id) };
  }, [specs]);
}

export const allWidgetIds = () => [...WIDGETS.map((w) => w.id), ...libraryStore.getState().widgets.map((w) => w.id)];
