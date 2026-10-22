// Environment Dashboard — layout engine, templates and persistence.
// Pure functions so the logic is unit-testable without React.

export type WidgetSize = "small" | "medium" | "large";

export interface DashboardWidgetItem {
  /** registry widget id */
  id: string;
  size: WidgetSize;
  /** per-widget view settings, e.g. chart type */
  settings?: Record<string, string>;
}

export interface DashboardLayoutState {
  items: DashboardWidgetItem[];
}

export const LAYOUT_STORAGE_KEY = "env-dashboard-layout-v1";

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
    description: "Balanced view of emissions, energy and progress",
    items: [
      widget("kpi-overview", "large"),
      widget("emissions-scope", "medium"),
      widget("scope-breakdown", "medium"),
      widget("emission-trends", "large"),
      widget("carbon-intensity", "small"),
      widget("green-energy", "small"),
      widget("facility-emissions", "medium"),
    ],
  },
  {
    id: "carbon-emissions",
    name: "Carbon Emissions",
    description: "Deep-dive into scopes, intensity and trends",
    items: [
      widget("kpi-overview", "medium"),
      widget("emissions-scope", "medium"),
      widget("emission-trends", "large"),
      widget("scope-breakdown", "medium"),
      widget("carbon-intensity", "small"),
    ],
  },
  {
    id: "water-waste",
    name: "Water & Waste",
    description: "Resource stewardship and circularity metrics",
    items: [
      widget("water-stats", "medium"),
      widget("waste-analytics", "medium"),
      widget("kpi-overview", "medium"),
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
      widget("carbon-intensity", "small"),
      widget("emissions-scope", "small"),
      widget("green-energy", "small"),
      widget("facility-emissions", "medium"),
    ],
  },
];

export const DEFAULT_TEMPLATE_ID = "sustainability-overview";

export function getDefaultLayout(): DashboardLayoutState {
  const template = DASHBOARD_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID) ?? DASHBOARD_TEMPLATES[0];
  return { items: template.items.map((i) => ({ ...i, settings: i.settings ? { ...i.settings } : undefined })) };
}

export function isValidItem(item: unknown): item is DashboardWidgetItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<DashboardWidgetItem>;
  return (
    typeof candidate.id === "string" &&
    (candidate.size === "small" || candidate.size === "medium" || candidate.size === "large")
  );
}

export function sanitizeLayout(raw: unknown): DashboardLayoutState {
  if (!raw || typeof raw !== "object") return getDefaultLayout();
  const candidate = raw as { items?: unknown };
  if (!Array.isArray(candidate.items)) return getDefaultLayout();
  const items = candidate.items.filter(isValidItem).map((i) => ({ id: i.id, size: i.size, settings: { ...(i.settings ?? {}) } }));
  return items.length ? { items } : getDefaultLayout();
}

export function loadLayout(): DashboardLayoutState {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) return sanitizeLayout(JSON.parse(raw));
  } catch {
    /* corrupted storage — fall back to default */
  }
  return getDefaultLayout();
}

export function saveLayout(state: DashboardLayoutState): void {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(state));
}

export function reorderItems(items: DashboardWidgetItem[], from: number, to: number): DashboardWidgetItem[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Nudge a widget one slot up/down — used for touch devices without drag-and-drop. */
export function moveItem(items: DashboardWidgetItem[], index: number, direction: -1 | 1): DashboardWidgetItem[] {
  return reorderItems(items, index, index + direction);
}

export function resizeItem(items: DashboardWidgetItem[], index: number, size: WidgetSize): DashboardWidgetItem[] {
  return items.map((item, i) => (i === index ? { ...item, size } : item));
}

export function removeItem(items: DashboardWidgetItem[], index: number): DashboardWidgetItem[] {
  return items.filter((_, i) => i !== index);
}

export function addWidget(items: DashboardWidgetItem[], id: string, size: WidgetSize): DashboardWidgetItem[] {
  return [...items, { id, size }];
}

export function isWidgetPresent(items: DashboardWidgetItem[], id: string): boolean {
  return items.some((item) => item.id === id);
}

export function setItemSetting(items: DashboardWidgetItem[], index: number, key: string, value: string): DashboardWidgetItem[] {
  return items.map((item, i) => (i === index ? { ...item, settings: { ...(item.settings ?? {}), [key]: value } } : item));
}

export const sizeClass: Record<WidgetSize, string> = {
  small: "xl:col-span-1",
  medium: "xl:col-span-2",
  large: "xl:col-span-4",
};
