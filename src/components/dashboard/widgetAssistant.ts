// OG widget assistant — a deterministic, on-device stand-in for an LLM.
// It maps natural-language requests onto the metric catalog and refines the previous
// proposal on follow-ups ("make it a donut", "only scope 2", "larger"). Swap
// `interpretPrompt` for a model call later; the reply shape stays the same.

import type { WidgetSize } from "@/lib/dashboardLayout";
import type { CustomVisual, CustomWidgetDraft } from "@/lib/dashboardLibrary";
import { getMetric, type MetricDef, VISUAL_LABELS } from "./metricCatalog";

export interface AssistantReply {
  text: string;
  draft?: CustomWidgetDraft;
  /** follow-up prompts offered as chips */
  suggestions: string[];
}

export const STARTER_PROMPTS = [
  "Monthly Scope 2 emissions as a bar chart",
  "Show our waste split as a donut",
  "KPI card for green energy generated",
  "Compare water withdrawal by site",
  "Carbon intensity against target as a line",
  "Top emitting facilities",
];

// ordered: more specific phrases first
const METRIC_RULES: { metric: string; test: RegExp }[] = [
  { metric: "water-recycling", test: /water.*(recycl|reuse)|(recycl|reuse).*water/ },
  { metric: "water-withdrawal", test: /water|withdraw|m³|m3/ },
  { metric: "waste-streams", test: /waste|landfill|compost|incinerat|recycl|diversion|circular/ },
  { metric: "renewable-share", test: /renewable (share|%|percent|mix)|share of renewable|% renewable|percent renewable/ },
  { metric: "green-energy", test: /green energy|renewable|solar|wind|mwh|electricity|energy/ },
  { metric: "carbon-intensity", test: /intensity|per unit|target|pathway/ },
  { metric: "facility-emissions", test: /facilit|site|plant|location|campus|top emit/ },
  { metric: "total-emissions", test: /total (emission|footprint|carbon|ghg)|footprint|overall|combined/ },
  { metric: "scope-emissions", test: /scope|emission|carbon|co2|co₂|ghg|greenhouse/ },
];

const VISUAL_RULES: { visual: CustomVisual; test: RegExp }[] = [
  { visual: "stat", test: /\b(kpi|stat|number|figure|headline|card|tile|single value|big number)\b/ },
  { visual: "donut", test: /\b(donut|doughnut|pie|split|share|mix|composition|breakdown|proportion)\b/ },
  { visual: "area", test: /\b(area|filled|stacked area)\b/ },
  { visual: "bar", test: /\b(bar|bars|column|columns|histogram|compare|comparison|rank|ranking|top)\b/ },
  { visual: "line", test: /\b(line|lines|trend|trends|over time|trajectory|timeline)\b/ },
];

const COLOR_RULES: { slot: number; test: RegExp }[] = [
  { slot: 0, test: /\bgreen\b(?! energy)/ },
  { slot: 1, test: /\bblue\b/ },
  { slot: 2, test: /\b(amber|orange|ochre|gold)\b/ },
  { slot: 3, test: /\b(purple|violet)\b/ },
];

function detectSize(p: string): WidgetSize | undefined {
  if (/\b(small|compact|tiny|narrow)\b/.test(p)) return "small";
  if (/\b(large|big|bigger|larger|wide|wider|full[- ]width)\b/.test(p)) return "large";
  if (/\b(medium|half[- ]width|normal size)\b/.test(p)) return "medium";
  return undefined;
}

function detectSeries(p: string, metric: MetricDef): string[] | undefined {
  if (metric.id === "scope-emissions") {
    const found = (["1", "2", "3"] as const).filter((n) =>
      new RegExp(`scope\\s*${n}\\b|scope\\s*(\\d\\s*(,|and|&)\\s*)*${n}\\b`).test(p) || (n === "1" && /\bdirect\b/.test(p)) || (n === "2" && /purchased (electricity|energy)/.test(p)) || (n === "3" && /value chain|supply chain/.test(p)),
    );
    return found.length ? found.map((n) => `Scope ${n}`) : undefined;
  }
  if (metric.id === "waste-streams") {
    const found = metric.series.filter((s) => new RegExp(s.key.slice(0, 6).toLowerCase()).test(p)).map((s) => s.key);
    return found.length && found.length < metric.series.length ? found : undefined;
  }
  return undefined;
}

export function suggestTitle(metric: MetricDef, series: string[], visual: CustomVisual): string {
  const sub = series.length && series.length < metric.series.length ? series : [];
  switch (metric.id) {
    case "scope-emissions":
      return sub.length ? `${sub.map((s) => s.replace("Scope ", "")).join(" & ").replace(/^/, "Scope ")} Emissions` : visual === "donut" ? "Emissions Split by Scope" : "Monthly Emissions by Scope";
    case "waste-streams":
      return sub.length ? `${sub.join(" & ")} Waste` : visual === "donut" ? "Waste Mix" : "Waste by Disposal Route";
    case "facility-emissions":
      return visual === "stat" ? "Top Emitting Facilities" : "Emissions by Facility";
    case "total-emissions":
      return visual === "stat" ? "Total Emissions" : "Total Emissions Trend";
    case "green-energy":
      return visual === "stat" ? "Green Energy Generated" : "Green Energy Generation";
    default:
      return metric.label.replace(/\s*\(.*\)$/, "").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`);

/** Selected series when they're a strict subset of the metric's, else empty. */
const subsetOf = (metric: MetricDef, series: string[]) => (series.length && series.length < metric.series.length ? series : []);

const noun = (metric: MetricDef) => (metric.id === "waste-streams" ? "waste" : "emissions");

/** Description that matches what is actually charted. */
export function suggestDescription(metric: MetricDef, series: string[]): string {
  const sub = subsetOf(metric, series);
  if (!sub.length) return metric.description;
  const list = sub.length === 2 ? sub.join(" and ") : sub.join(", ");
  return metric.id === "waste-streams" ? `${list} waste per quarter` : `${list} ${noun(metric)} per month`;
}

const describe = (metric: MetricDef, visual: CustomVisual, series: string[]) => {
  const sub = subsetOf(metric, series);
  const subject = sub.length ? `${sub.join(" & ")} ${noun(metric)}` : metric.label.toLowerCase().replace(/\s*\(.*\)$/, "");
  const form = VISUAL_LABELS[visual] === "KPI" ? "KPI tile" : `${VISUAL_LABELS[visual].toLowerCase()} chart`;
  return `${article(form)} of **${subject}** (${metric.unit})`;
};

/** Combine series mentioned in a follow-up with the previous selection: add, remove or replace. */
function mergeSeries(p: string, metric: MetricDef, mentioned: string[], previous: string[]): string[] {
  const all = metric.series.map((s) => s.key);
  const prev = previous.length ? previous : all;
  let next: string[];
  if (/\b(add|include|also|too|plus|as well|with)\b/.test(p) && !/\b(only|just)\b/.test(p)) next = [...new Set([...prev, ...mentioned])];
  else if (/\b(remove|without|drop|exclude|hide|except)\b/.test(p)) next = prev.filter((k) => !mentioned.includes(k));
  else next = mentioned;
  if (!next.length) next = prev;
  const ordered = all.filter((k) => next.includes(k));
  return ordered.length === all.length ? [] : ordered;
}

function followUps(metric: MetricDef, visual: CustomVisual): string[] {
  const others = metric.visuals.filter((v) => v !== visual).slice(0, 2).map((v) => `Make it a ${VISUAL_LABELS[v] === "KPI" ? "KPI card" : VISUAL_LABELS[v].toLowerCase()}`);
  const extra = metric.id === "scope-emissions" ? ["Only Scope 1 and 2"] : [];
  return [...others, ...extra, "Make it larger"].slice(0, 4);
}

const HELP_TEXT =
  "I can build widgets from your environmental data: emissions by scope or facility, carbon intensity, green energy, renewable share, water and waste. Tell me what to show and, if you like, how (line, bar, area, donut or KPI card) and how big.";

/** Interpret one user message. `previous` is the last proposal, which follow-ups modify. */
export function interpretPrompt(prompt: string, previous?: CustomWidgetDraft): AssistantReply {
  const p = prompt.toLowerCase().trim();

  if (!p || /^(hi|hello|hey|help|what can you do|what can i build)[\s!?.]*$/.test(p)) {
    return { text: `Hi! ${HELP_TEXT}`, suggestions: STARTER_PROMPTS.slice(0, 4) };
  }

  const metricId = METRIC_RULES.find((r) => r.test.test(p))?.metric;
  const requestedVisual = VISUAL_RULES.find((r) => r.test.test(p))?.visual;
  const size = detectSize(p);
  const color = COLOR_RULES.find((r) => r.test.test(p))?.slot;

  // Follow-up: no new data source mentioned, but there's a proposal to refine.
  const refining = previous && (!metricId || metricId === previous.metric);
  const metric = getMetric(refining ? previous!.metric : metricId ?? "");

  if (!metric) {
    return {
      text: "I couldn't match that to a dataset I have. Try naming what to measure, for example emissions, energy, water, waste, intensity or facilities.",
      suggestions: STARTER_PROMPTS.slice(0, 4),
    };
  }

  const mentioned = detectSeries(p, metric);
  const series = mentioned ? (refining ? mergeSeries(p, metric, mentioned, previous!.series) : mentioned) : refining ? previous!.series : [];
  let visual: CustomVisual = requestedVisual ?? (refining ? previous!.visual : metric.visuals[0]);
  let note = "";
  if (!metric.visuals.includes(visual)) {
    note = ` ${article(VISUAL_LABELS[visual].toLowerCase()).replace(/^a/, "A")} doesn't suit this data, so I used ${article(VISUAL_LABELS[metric.visuals[0]].toLowerCase())} instead.`;
    visual = metric.visuals[0];
  }
  // a single scope shown as a donut is a full circle — nudge to a bar
  if (visual === "donut" && metric.id === "scope-emissions" && series.length === 1) {
    visual = "bar";
    note = " One scope alone makes a full circle, so a bar chart reads better.";
  }

  const autoTitle = suggestTitle(metric, series, visual);
  const keepTitle = refining && previous!.title !== suggestTitle(metric, previous!.series, previous!.visual);
  const draft: CustomWidgetDraft = {
    title: keepTitle ? previous!.title : autoTitle,
    description: suggestDescription(metric, series),
    metric: metric.id,
    series,
    visual,
    size: size ?? (refining ? previous!.size : visual === "stat" ? "small" : metric.kind === "time" && metric.series.length > 1 ? "large" : "medium"),
    color: color ?? (refining ? previous!.color : 0),
  };

  const filterNote = metric.periodAware ? " It follows the dashboard's period filter." : "";
  const text = refining
    ? `Updated. It's now ${describe(metric, visual, series)}, ${draft.size} size.${note}`
    : `Here's ${describe(metric, visual, series)}.${filterNote}${note} Add it as is, or tell me what to change.`;

  return { text, draft, suggestions: followUps(metric, visual) };
}
