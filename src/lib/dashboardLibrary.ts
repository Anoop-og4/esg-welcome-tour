// Environment Dashboard — user-owned library: saved templates and custom widgets.
// A tiny external store (no React) so every consumer stays in sync and the logic is unit-testable.

import { DASHBOARD_TEMPLATES, type DashboardWidgetItem, isValidItem, WIDGET_SIZES, type WidgetSize } from "./dashboardLayout";

export type CustomVisual = "line" | "area" | "bar" | "donut" | "stat";
export const CUSTOM_VISUALS: CustomVisual[] = ["line", "area", "bar", "donut", "stat"];

export interface CustomWidgetSpec {
  id: string;
  title: string;
  description: string;
  /** metric catalog id */
  metric: string;
  /** series keys of the metric to show (empty = all) */
  series: string[];
  visual: CustomVisual;
  /** size used when the widget is added to a dashboard */
  size: WidgetSize;
  /** palette slot (0-3) for single-series charts */
  color: number;
  source: "builder" | "assistant";
  createdAt: string;
  updatedAt: string;
}

/** The editable part of a spec — what the builder and the assistant produce. */
export type CustomWidgetDraft = Pick<CustomWidgetSpec, "title" | "description" | "metric" | "series" | "visual" | "size" | "color">;

export interface UserTemplate {
  id: string;
  name: string;
  description: string;
  items: DashboardWidgetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryState {
  templates: UserTemplate[];
  widgets: CustomWidgetSpec[];
}

export const USER_TEMPLATES_KEY = "env-dashboard-user-templates-v1";
export const CUSTOM_WIDGETS_KEY = "env-dashboard-custom-widgets-v1";

export const CUSTOM_WIDGET_PREFIX = "custom-";
export const USER_TEMPLATE_PREFIX = "user-";
export const TEMPLATE_NAME_MAX = 40;
export const WIDGET_TITLE_MAX = 48;

export const isCustomWidgetId = (id: string) => id.startsWith(CUSTOM_WIDGET_PREFIX);
export const isUserTemplateId = (id: string | undefined) => !!id && id.startsWith(USER_TEMPLATE_PREFIX);

const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

/* ── validation ───────────────────────────────────────────── */

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

export function sanitizeSpec(raw: unknown): CustomWidgetSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id);
  const title = str(r.title).trim();
  const metric = str(r.metric);
  if (!isCustomWidgetId(id) || !title || !metric) return null;
  const visual = CUSTOM_VISUALS.includes(r.visual as CustomVisual) ? (r.visual as CustomVisual) : "bar";
  const size = WIDGET_SIZES.includes(r.size as WidgetSize) ? (r.size as WidgetSize) : "medium";
  const color = typeof r.color === "number" && r.color >= 0 && r.color <= 3 ? Math.floor(r.color) : 0;
  return {
    id,
    title: title.slice(0, WIDGET_TITLE_MAX),
    description: str(r.description).slice(0, 140),
    metric,
    series: Array.isArray(r.series) ? r.series.filter((s): s is string => typeof s === "string") : [],
    visual,
    size,
    color,
    source: r.source === "assistant" ? "assistant" : "builder",
    createdAt: str(r.createdAt, now()),
    updatedAt: str(r.updatedAt, now()),
  };
}

export function sanitizeTemplate(raw: unknown): UserTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id);
  const name = str(r.name).trim();
  if (!isUserTemplateId(id) || !name || !Array.isArray(r.items)) return null;
  return {
    id,
    name: name.slice(0, TEMPLATE_NAME_MAX),
    description: str(r.description).slice(0, 140),
    items: r.items.filter(isValidItem).map((i) => ({ id: i.id, size: i.size, ...(i.settings ? { settings: { ...i.settings } } : {}) })),
    createdAt: str(r.createdAt, now()),
    updatedAt: str(r.updatedAt, now()),
  };
}

/** Returns an error message, or null when the name is usable. Names are unique across built-in and user templates. */
export function validateTemplateName(name: string, templates: UserTemplate[], excludeId?: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Give your template a name.";
  if (trimmed.length > TEMPLATE_NAME_MAX) return `Keep it under ${TEMPLATE_NAME_MAX} characters.`;
  const key = trimmed.toLowerCase();
  if (DASHBOARD_TEMPLATES.some((t) => t.name.toLowerCase() === key)) return "That name is used by a built-in template.";
  if (templates.some((t) => t.id !== excludeId && t.name.toLowerCase() === key)) return "You already have a template with this name.";
  return null;
}

/* ── storage ──────────────────────────────────────────────── */

function readList<T>(key: string, sanitize: (raw: unknown) => T | null): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(sanitize).filter((x): x is T => x !== null) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: unknown[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep working in memory */
  }
}

const readState = (): LibraryState => ({
  templates: readList(USER_TEMPLATES_KEY, sanitizeTemplate),
  widgets: readList(CUSTOM_WIDGETS_KEY, sanitizeSpec),
});

/* ── store ────────────────────────────────────────────────── */

let state: LibraryState = readState();
const listeners = new Set<() => void>();

function commit(next: LibraryState) {
  if (next.templates !== state.templates) writeList(USER_TEMPLATES_KEY, next.templates);
  if (next.widgets !== state.widgets) writeList(CUSTOM_WIDGETS_KEY, next.widgets);
  state = next;
  listeners.forEach((l) => l());
}

const cloneItems = (items: DashboardWidgetItem[]) => items.map((i) => ({ ...i, ...(i.settings ? { settings: { ...i.settings } } : {}) }));

export const libraryStore = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Re-read from storage (tests, or another tab having written). */
  reload() {
    state = readState();
    listeners.forEach((l) => l());
  },

  createTemplate(name: string, description: string, items: DashboardWidgetItem[]): UserTemplate {
    const t: UserTemplate = { id: uid(USER_TEMPLATE_PREFIX), name: name.trim(), description: description.trim(), items: cloneItems(items), createdAt: now(), updatedAt: now() };
    commit({ ...state, templates: [...state.templates, t] });
    return t;
  },
  updateTemplate(id: string, patch: Partial<Pick<UserTemplate, "name" | "description" | "items">>) {
    commit({
      ...state,
      templates: state.templates.map((t) =>
        t.id === id
          ? { ...t, ...patch, name: (patch.name ?? t.name).trim(), items: patch.items ? cloneItems(patch.items) : t.items, updatedAt: now() }
          : t,
      ),
    });
  },
  deleteTemplate(id: string) {
    commit({ ...state, templates: state.templates.filter((t) => t.id !== id) });
  },

  saveWidget(draft: CustomWidgetDraft, source: CustomWidgetSpec["source"], id?: string): CustomWidgetSpec {
    const existing = id ? state.widgets.find((w) => w.id === id) : undefined;
    const spec: CustomWidgetSpec = {
      ...draft,
      title: draft.title.trim().slice(0, WIDGET_TITLE_MAX),
      description: draft.description.trim(),
      id: existing?.id ?? uid(CUSTOM_WIDGET_PREFIX),
      source: existing?.source ?? source,
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now(),
    };
    commit({ ...state, widgets: existing ? state.widgets.map((w) => (w.id === spec.id ? spec : w)) : [...state.widgets, spec] });
    return spec;
  },
  /** Deletes a custom widget and strips it from every saved template. */
  deleteWidget(id: string) {
    const touched = state.templates.some((t) => t.items.some((i) => i.id === id));
    commit({
      widgets: state.widgets.filter((w) => w.id !== id),
      templates: touched ? state.templates.map((t) => ({ ...t, items: t.items.filter((i) => i.id !== id) })) : state.templates,
    });
  },
};
