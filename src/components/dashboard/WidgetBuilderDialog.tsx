import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, MessageSquareText, Plus, RotateCcw, SlidersHorizontal, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type DashboardFilters, WIDGET_SIZES, type WidgetSize } from "@/lib/dashboardLayout";
import { CUSTOM_VISUALS, type CustomVisual, type CustomWidgetDraft, type CustomWidgetSpec, WIDGET_TITLE_MAX } from "@/lib/dashboardLibrary";
import OGMark from "@/components/chatbot/OGMark";
import { chartColors } from "./dashboardData";
import { CustomWidgetContent, resolveVisual, VISUAL_ICONS } from "./customWidgets";
import { getMetric, METRICS, type MetricCategory, VISUAL_LABELS } from "./metricCatalog";
import { interpretPrompt, STARTER_PROMPTS, suggestDescription, suggestTitle } from "./widgetAssistant";

export type BuilderTab = "build" | "assistant";

export type BuilderMode = { kind: "create"; tab: BuilderTab } | { kind: "edit"; spec: CustomWidgetSpec };

interface WidgetBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: BuilderMode;
  filters: DashboardFilters;
  onCreate: (draft: CustomWidgetDraft, source: CustomWidgetSpec["source"], addToDashboard: boolean) => void;
  onUpdate: (id: string, draft: CustomWidgetDraft) => void;
}

const SIZE_LABEL: Record<WidgetSize, string> = { small: "Small", medium: "Medium", large: "Large" };
const COLOR_NAMES = ["Green", "Blue", "Amber", "Violet"];
const CATEGORIES: MetricCategory[] = ["Emissions", "Energy", "Resources"];

function freshDraft(): CustomWidgetDraft {
  const metric = METRICS[0];
  return { title: suggestTitle(metric, [], "line"), description: metric.description, metric: metric.id, series: [], visual: "line", size: "large", color: 0 };
}

interface ChatMessage {
  id: number;
  role: "user" | "og";
  text: string;
  draft?: CustomWidgetDraft;
  suggestions?: string[];
}

const GREETING: ChatMessage = {
  id: 0,
  role: "og",
  text: "Hi, I'm OG. Describe the widget you need — what to measure and, optionally, how to show it — and I'll draft it with live data.",
  suggestions: STARTER_PROMPTS,
};

/* ── Preview ──────────────────────────────────────────────── */

function PreviewCard({ draft, filters }: { draft: CustomWidgetDraft; filters: DashboardFilters }) {
  const metric = getMetric(draft.metric);
  const Icon = VISUAL_ICONS[draft.visual];
  return (
    <motion.section layout className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-elevated">
      <header className="flex items-start gap-3 px-5 pb-3 pt-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={16} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-semibold leading-tight text-foreground">{draft.title.trim() || "Untitled widget"}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{draft.description || metric?.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Custom</span>
      </header>
      <div className="px-5 pb-5">
        <CustomWidgetContent key={`${draft.metric}-${draft.visual}-${draft.series.join()}`} spec={draft} chartType={draft.visual} size={draft.size} filters={filters} />
      </div>
    </motion.section>
  );
}

/* ── Assistant chat ───────────────────────────────────────── */

function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") ? <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong> : part));
}

function AssistantPanel({ onProposal, onUse, onFineTune }: {
  onProposal: (draft: CustomWidgetDraft | null) => void;
  onUse: (draft: CustomWidgetDraft) => void;
  onFineTune: (draft: CustomWidgetDraft) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const lastDraft = useRef<CustomWidgetDraft | undefined>();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const scroller = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo?.({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const prompt = text.trim();
    if (!prompt || thinking) return;
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text: prompt }]);
    setInput("");
    setThinking(true);
    // simulated latency so the exchange reads like a conversation
    timer.current = setTimeout(() => {
      const reply = interpretPrompt(prompt, lastDraft.current);
      if (reply.draft) {
        lastDraft.current = reply.draft;
        onProposal(reply.draft);
      }
      setMessages((m) => [...m, { id: nextId.current++, role: "og", text: reply.text, draft: reply.draft, suggestions: reply.suggestions }]);
      setThinking(false);
    }, 650 + Math.random() * 450);
  };

  const restart = () => {
    clearTimeout(timer.current);
    lastDraft.current = undefined;
    setThinking(false);
    setMessages([GREETING]);
    onProposal(null);
  };

  const latestDraftId = [...messages].reverse().find((m) => m.draft)?.id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scroller} className="og-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4" aria-live="polite">
        {messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">{m.text}</div>
            ) : (
              <div className="max-w-[92%] space-y-2.5">
                <div className="flex items-center gap-2"><OGMark size={13} /></div>
                <div className="rounded-2xl rounded-tl-md border border-border bg-muted/40 px-3.5 py-2.5 text-sm leading-relaxed text-muted-foreground">{renderBold(m.text)}</div>
                {m.draft && (
                  <div className={cn("rounded-xl border bg-card p-3 transition-opacity", m.id === latestDraftId ? "border-primary/40 shadow-card" : "border-border opacity-60")}>
                    <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">{m.draft.title}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{VISUAL_LABELS[m.draft.visual]}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{SIZE_LABEL[m.draft.size]}</span>
                    </div>
                    {m.id === latestDraftId ? (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="h-8 gap-1.5" onClick={() => onUse(m.draft!)}><Plus size={14} />Create widget</Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => onFineTune(m.draft!)}><SlidersHorizontal size={14} />Fine-tune</Button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">Superseded by a newer draft</p>
                    )}
                  </div>
                )}
                {m.suggestions && m.id === messages[messages.length - 1].id && !thinking && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {m.suggestions.map((s) => (
                      <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
        <AnimatePresence>
          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-xs text-muted-foreground">
              <OGMark size={13} showDot={false} />
              <span className="flex gap-1" aria-label="OG is drafting">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-primary" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </span>
              Drafting your widget…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={lastDraft.current ? "Refine it — “make it a donut”, “only scope 1”, “larger”…" : "e.g. Monthly Scope 2 emissions as bars"}
            aria-label="Describe a widget"
            className="max-h-28 min-h-[36px] flex-1 resize-none border-0 bg-transparent p-1 text-sm shadow-none focus-visible:ring-0"
          />
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={restart} aria-label="Start over">
            <RotateCcw size={14} />
          </Button>
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0 rounded-lg" disabled={!input.trim() || thinking} aria-label="Send">
            <ArrowUp size={15} />
          </Button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">Demo assistant · runs on-device against your dashboard data</p>
      </form>
    </div>
  );
}

/* ── Builder form ─────────────────────────────────────────── */

function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function BuilderForm({ draft, setDraft, titleTouched, setTitleTouched, descTouched, setDescTouched, showErrors }: {
  draft: CustomWidgetDraft;
  setDraft: (d: CustomWidgetDraft) => void;
  titleTouched: boolean;
  setTitleTouched: (v: boolean) => void;
  descTouched: boolean;
  setDescTouched: (v: boolean) => void;
  showErrors: boolean;
}) {
  const metric = getMetric(draft.metric) ?? METRICS[0];
  const shownSeries = draft.series.length ? draft.series : metric.series.map((s) => s.key);
  const singleSeries = shownSeries.length === 1;

  const patch = (next: Partial<CustomWidgetDraft>) => {
    const merged = { ...draft, ...next };
    const m = getMetric(merged.metric) ?? metric;
    merged.visual = resolveVisual(m, merged.visual, merged.visual);
    if (!titleTouched) merged.title = suggestTitle(m, merged.series, merged.visual);
    if (!descTouched) merged.description = suggestDescription(m, merged.series);
    setDraft(merged);
  };

  const changeMetric = (id: string) => {
    const m = getMetric(id)!;
    patch({ metric: id, series: [], visual: m.visuals.includes(draft.visual) ? draft.visual : m.visuals[0] });
  };

  const toggleSeries = (key: string) => {
    const set = new Set(shownSeries);
    if (set.has(key)) {
      if (set.size === 1) return;
      set.delete(key);
    } else set.add(key);
    const list = metric.series.map((s) => s.key).filter((k) => set.has(k));
    patch({ series: list.length === metric.series.length ? [] : list });
  };

  const titleError = !draft.title.trim() ? "A title is required." : draft.title.length > WIDGET_TITLE_MAX ? `Keep it under ${WIDGET_TITLE_MAX} characters.` : null;

  return (
    <div className="space-y-5">
      <Field label="Data source" htmlFor="builder-metric">
        <Select value={draft.metric} onValueChange={changeMetric}>
          <SelectTrigger id="builder-metric" className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectGroup key={c}>
                <SelectLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">{c}</SelectLabel>
                {METRICS.filter((m) => m.category === c).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label} <span className="text-muted-foreground">· {m.unit}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          {metric.description}
          {metric.periodAware && " · follows the period filter"}
          {metric.scopeAware && " · follows the scope filter"}
        </p>
      </Field>

      {metric.series.length > 1 && (
        <Field label="Series" hint="At least one">
          <div className="flex flex-wrap gap-1.5">
            {metric.series.map((s) => {
              const on = shownSeries.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSeries(s.key)}
                  className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all", on ? "border-border bg-card text-foreground shadow-sm" : "border-dashed border-border text-muted-foreground opacity-70 hover:opacity-100")}
                >
                  <span className={cn("h-2 w-2 rounded-full", !on && "opacity-40")} style={{ background: s.color }} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      <Field label="Visualization">
        <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Visualization">
          {CUSTOM_VISUALS.map((v) => {
            const Icon = VISUAL_ICONS[v];
            const supported = metric.visuals.includes(v);
            const tile = (
              <button
                type="button"
                role="radio"
                aria-checked={draft.visual === v}
                disabled={!supported}
                onClick={() => patch({ visual: v })}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[11px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-35",
                  draft.visual === v ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon size={17} />
                {VISUAL_LABELS[v]}
              </button>
            );
            return supported ? (
              <span key={v}>{tile}</span>
            ) : (
              <Tooltip key={v}>
                <TooltipTrigger asChild><span>{tile}</span></TooltipTrigger>
                <TooltipContent>Not suited to this data</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Default size">
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5" role="radiogroup" aria-label="Default size">
            {WIDGET_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={draft.size === s}
                onClick={() => patch({ size: s })}
                className={cn("flex-1 rounded-md py-1.5 text-xs font-medium transition-all", draft.size === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {SIZE_LABEL[s]}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Color" hint={singleSeries ? undefined : "Single-series only"}>
          <div className="flex h-[34px] items-center gap-2" role="radiogroup" aria-label="Color">
            {chartColors.map((c, i) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={draft.color === i}
                aria-label={COLOR_NAMES[i]}
                disabled={!singleSeries}
                onClick={() => patch({ color: i })}
                className={cn("flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-all disabled:cursor-not-allowed disabled:opacity-30", draft.color === i && singleSeries && "ring-2 ring-foreground/70")}
                style={{ background: c }}
              >
                {draft.color === i && singleSeries && <Check size={13} className="text-white" />}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Title" htmlFor="builder-title" hint={`${draft.title.length}/${WIDGET_TITLE_MAX}`}>
        <div className="relative">
          <Input
            id="builder-title"
            value={draft.title}
            onChange={(e) => {
              setTitleTouched(true);
              setDraft({ ...draft, title: e.target.value });
            }}
            aria-invalid={showErrors && !!titleError}
            className={cn("pr-24", showErrors && titleError && "border-destructive")}
          />
          {titleTouched && (
            <button
              type="button"
              onClick={() => {
                setTitleTouched(false);
                setDraft({ ...draft, title: suggestTitle(metric, draft.series, draft.visual) });
              }}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/10"
            >
              <Wand2 size={11} />Suggest
            </button>
          )}
        </div>
        {showErrors && titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </Field>

      <Field label="Description" htmlFor="builder-desc" hint="Optional">
        <Input id="builder-desc" value={draft.description} onChange={(e) => {
            setDescTouched(true);
            setDraft({ ...draft, description: e.target.value.slice(0, 140) });
          }} placeholder={metric.description} />
      </Field>
    </div>
  );
}

/* ── Dialog ───────────────────────────────────────────────── */

export function WidgetBuilderDialog({ open, onOpenChange, mode, filters, onCreate, onUpdate }: WidgetBuilderDialogProps) {
  const editingSpec = mode.kind === "edit" ? mode.spec : undefined;
  const [tab, setTab] = useState<BuilderTab>("build");
  const [draft, setDraft] = useState<CustomWidgetDraft>(freshDraft);
  const [titleTouched, setTitleTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);
  const [source, setSource] = useState<CustomWidgetSpec["source"]>("builder");
  const [addNow, setAddNow] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [proposal, setProposal] = useState<CustomWidgetDraft | null>(null);
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (editingSpec) {
      const { title, description, metric, series, visual, size, color } = editingSpec;
      setDraft({ title, description, metric, series, visual, size, color });
      setTitleTouched(true);
      setDescTouched(true);
      setTab("build");
    } else {
      setDraft(freshDraft());
      setTitleTouched(false);
      setDescTouched(false);
      setTab(mode.kind === "create" ? mode.tab : "build");
    }
    setSource("builder");
    setAddNow(true);
    setShowErrors(false);
    setProposal(null);
    setChatKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open]);

  const valid = !!draft.title.trim() && draft.title.length <= WIDGET_TITLE_MAX && !!getMetric(draft.metric);

  const submit = () => {
    setShowErrors(true);
    if (!valid) return;
    if (editingSpec) onUpdate(editingSpec.id, draft);
    else onCreate(draft, source, addNow);
  };

  const previewDraft = tab === "assistant" ? proposal : draft;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:overflow-hidden">
          {/* left: form or chat */}
          <div className="flex min-h-0 flex-col border-border lg:border-r">
            <div className="border-b border-border px-5 pb-3 pt-5">
              <DialogTitle className="font-display text-lg">{editingSpec ? "Edit widget" : "Create a widget"}</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs">
                {editingSpec ? "Changes apply everywhere this widget is used." : "Build it from your data, or describe it and let OG draft it."}
              </DialogDescription>
              {!editingSpec && (
                <div className="mt-4 grid grid-cols-2 rounded-lg bg-muted p-1" role="tablist">
                  {([["build", "Build manually", SlidersHorizontal], ["assistant", "Ask OG", Sparkles]] as const).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      role="tab"
                      aria-selected={tab === value}
                      onClick={() => setTab(value)}
                      className={cn("flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-all", tab === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                    >
                      <Icon size={14} className={value === "assistant" && tab === value ? "text-primary" : undefined} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={cn("min-h-0 flex-1", tab === "assistant" ? "flex h-[460px] flex-col lg:h-auto" : "og-scroll overflow-y-auto px-5 py-5")}>
              {tab === "build" ? (
                <>
                  {source === "assistant" && !editingSpec && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-foreground">
                      <Sparkles size={13} className="shrink-0 text-primary" />Drafted by OG — review the details, then create.
                    </div>
                  )}
                  <BuilderForm
                    draft={draft}
                    setDraft={setDraft}
                    titleTouched={titleTouched}
                    setTitleTouched={setTitleTouched}
                    descTouched={descTouched}
                    setDescTouched={setDescTouched}
                    showErrors={showErrors}
                  />
                </>
              ) : (
                <AssistantPanel
                  key={chatKey}
                  onProposal={setProposal}
                  onUse={(d) => onCreate(d, "assistant", addNow)}
                  onFineTune={(d) => {
                    setDraft(d);
                    setTitleTouched(true);
                    setSource("assistant");
                    setTab("build");
                  }}
                />
              )}
            </div>
          </div>

          {/* right: live preview */}
          <div className="flex min-h-[320px] flex-col bg-muted/40 px-5 py-5">
            <div className="mb-3 flex items-center justify-between gap-3 lg:pr-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
              {previewDraft && <p className="text-[11px] text-muted-foreground">{SIZE_LABEL[previewDraft.size]} · uses current filters</p>}
            </div>
            <div className="og-scroll flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
              {previewDraft ? (
                <PreviewCard draft={previewDraft} filters={filters} />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MessageSquareText size={20} /></span>
                  <p className="text-sm font-medium text-foreground">Your widget will appear here</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">Ask OG for something like “waste split as a donut” and the draft renders with live data.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-5 py-3">
          {!editingSpec ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={addNow} onCheckedChange={(v) => setAddNow(v === true)} />
              Add to dashboard now
            </label>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            {tab === "build" ? (
              <Button onClick={submit} disabled={showErrors && !valid} className="gap-1.5">
                {editingSpec ? <Check size={15} /> : <Plus size={15} />}
                {editingSpec ? "Save changes" : "Create widget"}
              </Button>
            ) : (
              <Button onClick={() => proposal && onCreate(proposal, "assistant", addNow)} disabled={!proposal} className="gap-1.5">
                <Plus size={15} />Create widget
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
