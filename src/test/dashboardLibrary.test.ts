import { beforeEach, describe, expect, it } from "vitest";
import { widget } from "@/lib/dashboardLayout";
import { CUSTOM_WIDGETS_KEY, type CustomWidgetDraft, libraryStore, sanitizeSpec, USER_TEMPLATES_KEY, validateTemplateName } from "@/lib/dashboardLibrary";
import { interpretPrompt } from "@/components/dashboard/widgetAssistant";
import { getMetric, METRICS } from "@/components/dashboard/metricCatalog";
import { DEFAULT_FILTERS } from "@/lib/dashboardLayout";

const draft: CustomWidgetDraft = { title: "Scope 2 Emissions", description: "", metric: "scope-emissions", series: ["Scope 2"], visual: "bar", size: "medium", color: 0 };

beforeEach(() => {
  localStorage.clear();
  libraryStore.reload();
});

describe("user templates", () => {
  it("validates names: required, length, unique across built-in and saved", () => {
    libraryStore.createTemplate("Ops review", "", [widget("kpi-overview", "large")]);
    const mine = libraryStore.getState().templates;
    expect(validateTemplateName("  ", mine)).toMatch(/name/);
    expect(validateTemplateName("x".repeat(41), mine)).toMatch(/40/);
    expect(validateTemplateName("carbon emissions", mine)).toMatch(/built-in/);
    expect(validateTemplateName("OPS REVIEW", mine)).toMatch(/already/);
    expect(validateTemplateName("Ops review", mine, mine[0].id)).toBeNull(); // renaming itself
    expect(validateTemplateName("Board pack", mine)).toBeNull();
  });

  it("persists create, rename and delete", () => {
    const t = libraryStore.createTemplate("  Board pack ", "For the board", [widget("kpi-overview", "large")]);
    expect(t.name).toBe("Board pack");
    expect(JSON.parse(localStorage.getItem(USER_TEMPLATES_KEY)!)[0].name).toBe("Board pack");
    libraryStore.updateTemplate(t.id, { name: "Board pack Q3" });
    libraryStore.reload();
    expect(libraryStore.getState().templates[0].name).toBe("Board pack Q3");
    libraryStore.deleteTemplate(t.id);
    expect(libraryStore.getState().templates).toHaveLength(0);
  });
});

describe("custom widgets", () => {
  it("saves, edits in place and survives a reload", () => {
    const spec = libraryStore.saveWidget(draft, "assistant");
    expect(spec.id).toMatch(/^custom-/);
    const edited = libraryStore.saveWidget({ ...draft, visual: "line" }, "builder", spec.id);
    expect(edited.id).toBe(spec.id);
    expect(edited.source).toBe("assistant"); // origin is preserved
    libraryStore.reload();
    expect(libraryStore.getState().widgets).toEqual([edited]);
  });

  it("deleting a widget strips it from saved templates", () => {
    const spec = libraryStore.saveWidget(draft, "builder");
    libraryStore.createTemplate("Mine", "", [widget("kpi-overview", "large"), widget(spec.id, "medium")]);
    libraryStore.deleteWidget(spec.id);
    expect(libraryStore.getState().widgets).toHaveLength(0);
    expect(libraryStore.getState().templates[0].items.map((i) => i.id)).toEqual(["kpi-overview"]);
  });

  it("rejects malformed stored specs", () => {
    localStorage.setItem(CUSTOM_WIDGETS_KEY, JSON.stringify([{ id: "nope", title: "x", metric: "m" }, { id: "custom-1", title: "", metric: "m" }, "junk"]));
    libraryStore.reload();
    expect(libraryStore.getState().widgets).toEqual([]);
    expect(sanitizeSpec({ id: "custom-1", title: "T", metric: "m", visual: "radar", color: 9 })).toMatchObject({ visual: "bar", color: 0, size: "medium" });
  });
});

describe("metric catalog", () => {
  it("every metric produces rows containing its x key and series", () => {
    for (const m of METRICS) {
      const rows = m.rows(DEFAULT_FILTERS);
      expect(rows.length).toBeGreaterThan(0);
      for (const s of m.series) expect(rows[0]).toHaveProperty(s.key);
      expect(rows[0]).toHaveProperty(m.xKey);
    }
  });
});

describe("OG widget assistant", () => {
  it("maps a request to metric, series and visual", () => {
    const r = interpretPrompt("Monthly Scope 2 emissions as a bar chart");
    expect(r.draft).toMatchObject({ metric: "scope-emissions", series: ["Scope 2"], visual: "bar", title: "Scope 2 Emissions" });
  });

  it.each([
    ["Show our waste split as a donut", "waste-streams", "donut"],
    ["KPI card for green energy generated", "green-energy", "stat"],
    ["Compare water withdrawal by site", "water-withdrawal", "bar"],
    ["Carbon intensity against target as a line", "carbon-intensity", "line"],
    ["Top emitting facilities", "facility-emissions", "bar"],
    ["water recycling rate", "water-recycling", "bar"],
  ])("%s", (prompt, metric, visual) => {
    expect(interpretPrompt(prompt).draft).toMatchObject({ metric, visual });
  });

  it("refines the previous proposal on follow-ups", () => {
    const first = interpretPrompt("emissions by scope")!.draft!;
    const second = interpretPrompt("only scope 1 and 2, make it larger", first).draft!;
    expect(second).toMatchObject({ metric: "scope-emissions", series: ["Scope 1", "Scope 2"], size: "large" });
    const third = interpretPrompt("make it an area chart", second).draft!;
    expect(third).toMatchObject({ visual: "area", series: ["Scope 1", "Scope 2"] });
  });

  it("follow-ups add, remove or replace series and keep descriptions honest", () => {
    const base = interpretPrompt("Monthly Scope 2 emissions as a bar chart").draft!;
    const added = interpretPrompt("add scope 1 too and make it an area chart", base);
    expect(added.draft).toMatchObject({ series: ["Scope 1", "Scope 2"], visual: "area", description: "Scope 1 and Scope 2 emissions per month" });
    expect(added.text).toMatch(/now an area chart/);
    expect(interpretPrompt("remove scope 2", added.draft).draft!.series).toEqual(["Scope 1"]);
    expect(interpretPrompt("only scope 3", added.draft).draft!.series).toEqual(["Scope 3"]);
    // adding the last missing scope means "all", stored as an empty selection
    expect(interpretPrompt("include scope 3 as well", added.draft).draft!.series).toEqual([]);
  });

  it("falls back to a supported visual and says so", () => {
    const r = interpretPrompt("renewable share as a donut");
    expect(getMetric(r.draft!.metric)!.visuals).toContain(r.draft!.visual);
    expect(r.text).toMatch(/doesn't suit/);
  });

  it("asks for clarification when nothing matches, and greets on hello", () => {
    expect(interpretPrompt("purple elephants").draft).toBeUndefined();
    expect(interpretPrompt("hi").text).toMatch(/emissions/);
    expect(interpretPrompt("help me chart water use").draft?.metric).toBe("water-withdrawal");
  });
});
