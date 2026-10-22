// Environment Dashboard — layout engine, templates and persistence.
// Pure functions so the logic is unit-testable without React.

export type WidgetSize = "small" | "medium" | "large";

export const WIDGET_SIZES: WidgetSize[] = ["small", "medium", "large"];

export interface DashboardWidgetItem {
  /** registry widget id (unique within a layout) */
  id: string;
  size: WidgetSize;
  /** per-widget view settings, e.g. chart type */
  settings?: Record<string, string>;
}

export interface DashboardLayoutState {
  items: DashboardWidgetItem[];
  /** template the layout was last derived from; cleared once the user customises it */
  templateId?: string;
  savedAt?: string;
}

export type FilterPeriod = "12m" | "6m" | "3m";
export type ScopeKey = "Scope 1" | "Scope 2" | "Scope 3";
export const ALL_SCOPES: ScopeKey[] = ["Scope 1", "Scope 2", "Scope 3"];

export interface DashboardFilters {
  period: FilterPeriod;
  scopes: ScopeKey[];
}

export const DEFAULT_FILTERS: DashboardFilters = { period: "12m", scopes: [...ALL_SCOPES] };

export const LAYOUT_STORAGE_KEY = "env-dashboard-layout-v1";
export const FILTERS_STORAGE_KEY = "env-dashboard-filters-v1";

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  items: DashboardWidgetItem[];
}

export const widget = (id: string, size: WidgetSize, settings?: Record<string, string>): DashboardWidgetItem =>
  settings ? { id, size, settings } : { id, size };

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: "sustainability-overview",
    name: "Sustainability Overview",
    description: "Balanced view of emissions, energy and resources",
    items: [
      widget("kpi-overview", "large"),
      widget("emissions-scope", "medium"),
      widget("scope-breakdown", "medium"),
      widget("emission-trends", "large"),
      widget("carbon-intensity", "small"),
      widget("green-energy", "small"),
      widget("facility-emissions", "medium"),
      widget("water-stats", "medium"),
      widget("waste-analytics", "medium"),
    ],
  },
  {
    id: "carbon-emissions",
    name: "Carbon Emissions",
    description: "Deep-dive into scopes, intensity and trends",
    items: [
      widget("kpi-overview", "large"),
      widget("emission-trends", "large", { chartType: "area" }),
      widget("emissions-scope", "medium"),
      widget("scope-breakdown", "medium", { chartType: "grouped" }),
      widget("carbon-intensity", "medium"),
      widget("facility-emissions", "medium"),
    ],
  },
  {
    id: "water-waste",
    name: "Water & Waste",
    description: "Resource stewardship and circularity metrics",
    items: [
      widget("water-stats", "medium"),
      widget("waste-analytics", "medium"),
      widget("green-energy", "medium", { chartType: "bar" }),
      widget("facility-emissions", "medium"),
    ],
  },
  {
    id: "executive-summary",
    name: "Executive Summary",
    description: "Headline KPIs and high-level trajectory",
    items: [
      widget("kpi-overview", "large"),
      widget("emission-trends", "medium"),
      widget("emissions-scope", "medium", { chartType: "list" }),
      widget("carbon-intensity", "small"),
      widget("green-energy", "small"),
      widget("facility-emissions", "medium"),
    ],
  },
];

export const DEFAULT_TEMPLATE_ID = "sustainability-overview";

const cloneItems = (items: DashboardWidgetItem[]): DashboardWidgetItem[] =>
  items.map((i) => (i.settings ? { ...i, settings: { ...i.settings } } : { ...i }));

export function getTemplateLayout(templateId: string): DashboardLayoutState {
  const template = DASHBOARD_TEMPLATES.find((t) => t.id === templateId) ?? DASHBOARD_TEMPLATES[0];
  return { items: cloneItems(template.items), templateId: template.id };
}

export function getDefaultLayout(): DashboardLayoutState {
  return getTemplateLayout(DEFAULT_TEMPLATE_ID);
}

export function isValidItem(item: unknown): item is DashboardWidgetItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<DashboardWidgetItem>;
  return typeof candidate.id === "string" && WIDGET_SIZES.includes(candidate.size as WidgetSize);
}

/**
 * Validate a persisted layout. Drops malformed entries, duplicates and — when `knownIds`
 * is given — widgets that no longer exist in the registry.
 */
export function sanitizeLayout(raw: unknown, knownIds?: string[]): DashboardLayoutState {
  if (!raw || typeof raw !== "object") return getDefaultLayout();
  const candidate = raw as { items?: unknown; templateId?: unknown; savedAt?: unknown };
  if (!Array.isArray(candidate.items)) return getDefaultLayout();
  const seen = new Set<string>();
  const items: DashboardWidgetItem[] = [];
  for (const entry of candidate.items) {
    if (!isValidItem(entry) || seen.has(entry.id)) continue;
    if (knownIds && !knownIds.includes(entry.id)) continue;
    seen.add(entry.id);
    const settings = entry.settings && typeof entry.settings === "object" ? { ...entry.settings } : undefined;
    items.push(settings ? { id: entry.id, size: entry.size, settings } : { id: entry.id, size: entry.size });
  }
  // An intentionally empty saved dashboard is respected; only an unreadable one falls back.
  if (!items.length && candidate.items.length) return getDefaultLayout();
  return {
    items,
    templateId: typeof candidate.templateId === "string" ? candidate.templateId : undefined,
    savedAt: typeof candidate.savedAt === "string" ? candidate.savedAt : undefined,
  };
}

export function loadLayout(knownIds?: string[]): DashboardLayoutState {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) return sanitizeLayout(JSON.parse(raw), knownIds);
  } catch {
    /* corrupted or blocked storage — fall back to default */
  }
  return getDefaultLayout();
}

export function saveLayout(state: DashboardLayoutState): DashboardLayoutState {
  const stamped = { ...state, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(stamped));
  } catch {
    /* storage unavailable — layout still applies for this session */
  }
  return stamped;
}

export function sanitizeFilters(raw: unknown): DashboardFilters {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_FILTERS, scopes: [...ALL_SCOPES] };
  const candidate = raw as Partial<DashboardFilters>;
  const period = (["12m", "6m", "3m"] as FilterPeriod[]).includes(candidate.period as FilterPeriod)
    ? (candidate.period as FilterPeriod)
    : DEFAULT_FILTERS.period;
  const scopes = Array.isArray(candidate.scopes) ? ALL_SCOPES.filter((s) => candidate.scopes!.includes(s)) : [...ALL_SCOPES];
  return { period, scopes: scopes.length ? scopes : [...ALL_SCOPES] };
}

export function loadFilters(): DashboardFilters {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (raw) return sanitizeFilters(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return sanitizeFilters(null);
}

export function saveFilters(filters: DashboardFilters): void {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    /* ignore */
  }
}

export function reorderItems(items: DashboardWidgetItem[], from: number, to: number): DashboardWidgetItem[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Move the item at `from` so it lands at insertion slot `slot` (0..length), where slots
 * are the gaps between items as seen *before* the move — this is what a drop indicator shows.
 */
export function moveItemToSlot(items: DashboardWidgetItem[], from: number, slot: number): DashboardWidgetItem[] {
  if (from < 0 || from >= items.length) return items;
  const clamped = Math.max(0, Math.min(slot, items.length));
  const to = clamped > from ? clamped - 1 : clamped;
  return reorderItems(items, from, to);
}

/** Nudge a widget one slot up/down — used for touch and keyboard where drag-and-drop isn't available. */
export function moveItem(items: DashboardWidgetItem[], index: number, direction: -1 | 1): DashboardWidgetItem[] {
  return reorderItems(items, index, index + direction);
}

export function resizeItem(items: DashboardWidgetItem[], index: number, size: WidgetSize): DashboardWidgetItem[] {
  return items.map((item, i) => (i === index ? { ...item, size } : item));
}

export function removeItem(items: DashboardWidgetItem[], index: number): DashboardWidgetItem[] {
  return items.filter((_, i) => i !== index);
}

export function addWidget(items: DashboardWidgetItem[], id: string, size: WidgetSize, slot = items.length): DashboardWidgetItem[] {
  if (isWidgetPresent(items, id)) return items;
  const next = [...items];
  next.splice(Math.max(0, Math.min(slot, items.length)), 0, { id, size });
  return next;
}

export function isWidgetPresent(items: DashboardWidgetItem[], id: string): boolean {
  return items.some((item) => item.id === id);
}

export function setItemSetting(items: DashboardWidgetItem[], index: number, key: string, value: string): DashboardWidgetItem[] {
  return items.map((item, i) => (i === index ? { ...item, settings: { ...(item.settings ?? {}), [key]: value } } : item));
}

export function layoutsEqual(a: DashboardWidgetItem[], b: DashboardWidgetItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => {
    const other = b[i];
    if (item.id !== other.id || item.size !== other.size) return false;
    const sa = item.settings ?? {};
    const sb = other.settings ?? {};
    const keys = new Set([...Object.keys(sa), ...Object.keys(sb)]);
    return [...keys].every((k) => sa[k] === sb[k]);
  });
}

/** Column span per size: 1 column on mobile, 2 on tablet, 4 on desktop. */
export const sizeClass: Record<WidgetSize, string> = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 xl:col-span-4",
};
