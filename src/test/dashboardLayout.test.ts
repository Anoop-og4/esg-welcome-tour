import { beforeEach, describe, expect, it } from "vitest";
import {
  addWidget,
  DASHBOARD_TEMPLATES,
  getDefaultLayout,
  layoutsEqual,
  loadFilters,
  loadLayout,
  LAYOUT_STORAGE_KEY,
  moveItemToSlot,
  sanitizeFilters,
  sanitizeLayout,
  saveFilters,
  saveLayout,
  widget,
} from "@/lib/dashboardLayout";
import { emissionsByScope, scopeTotals, scopeTrend } from "@/components/dashboard/dashboardData";
import { WIDGET_IDS } from "@/components/dashboard/widgets";

const ids = (items: { id: string }[]) => items.map((i) => i.id);
const abc = [widget("a", "small"), widget("b", "small"), widget("c", "small"), widget("d", "small")];

describe("moveItemToSlot", () => {
  it("moves forward into the gap before a later item", () => {
    expect(ids(moveItemToSlot(abc, 0, 3))).toEqual(["b", "c", "a", "d"]);
  });
  it("moves backward", () => {
    expect(ids(moveItemToSlot(abc, 3, 1))).toEqual(["a", "d", "b", "c"]);
  });
  it("moves to the end slot", () => {
    expect(ids(moveItemToSlot(abc, 1, 4))).toEqual(["a", "c", "d", "b"]);
  });
  it("treats the slots either side of the item as no-ops", () => {
    expect(moveItemToSlot(abc, 1, 1)).toBe(abc);
    expect(moveItemToSlot(abc, 1, 2)).toBe(abc);
  });
});

describe("addWidget", () => {
  it("inserts at a slot and refuses duplicates", () => {
    const next = addWidget(abc, "x", "medium", 1);
    expect(ids(next)).toEqual(["a", "x", "b", "c", "d"]);
    expect(addWidget(next, "x", "large")).toBe(next);
  });
});

describe("sanitizeLayout", () => {
  it("drops malformed, duplicate and unknown widgets", () => {
    const raw = { items: [widget("a", "small"), { id: "a", size: "large" }, { id: "b", size: "huge" }, widget("gone", "small")] };
    expect(ids(sanitizeLayout(raw, ["a", "b"]).items)).toEqual(["a"]);
  });
  it("respects an intentionally empty layout but recovers from garbage", () => {
    expect(sanitizeLayout({ items: [] }).items).toEqual([]);
    expect(sanitizeLayout({ items: [{ nope: 1 }] })).toEqual(getDefaultLayout());
    expect(sanitizeLayout("nonsense")).toEqual(getDefaultLayout());
  });
});

describe("persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a saved layout with a timestamp", () => {
    const saved = saveLayout({ items: [widget("green-energy", "large", { chartType: "bar" })] });
    expect(saved.savedAt).toBeTruthy();
    const loaded = loadLayout(WIDGET_IDS);
    expect(layoutsEqual(loaded.items, saved.items)).toBe(true);
  });

  it("falls back to the default when storage is corrupted", () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, "{not json");
    expect(loadLayout()).toEqual(getDefaultLayout());
  });

  it("round-trips filters and never allows zero scopes", () => {
    saveFilters({ period: "6m", scopes: ["Scope 2"] });
    expect(loadFilters()).toEqual({ period: "6m", scopes: ["Scope 2"] });
    expect(sanitizeFilters({ period: "99y", scopes: [] })).toEqual({ period: "12m", scopes: ["Scope 1", "Scope 2", "Scope 3"] });
  });
});

describe("templates and data", () => {
  it("every template references only registered widgets, without duplicates", () => {
    for (const t of DASHBOARD_TEMPLATES) {
      expect(t.items.every((i) => WIDGET_IDS.includes(i.id))).toBe(true);
      expect(new Set(ids(t.items)).size).toBe(t.items.length);
    }
  });

  it("monthly scope data reconciles with the annual totals", () => {
    const full = scopeTotals({ period: "12m", scopes: ["Scope 1", "Scope 2", "Scope 3"] });
    expect(full).toEqual(emissionsByScope);
    const q = scopeTotals({ period: "3m", scopes: ["Scope 1"] });
    expect(q).toEqual([{ name: "Scope 1", value: scopeTrend.slice(-3).reduce((s, m) => s + m["Scope 1"], 0) }]);
  });
});
