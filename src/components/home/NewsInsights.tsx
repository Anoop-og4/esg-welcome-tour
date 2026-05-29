import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  Newspaper,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  BrainCircuit,
  BadgeCheck,
  Send,
  ChevronRight,
  Gauge,
  Layers,
  CheckCircle2,
  RadioTower,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * Latest ESG News — merged news feed + AI intelligence
 *
 * Verified ingestion → AI summary → Impact score → Framework mapping
 *  → Suggested action → Ask AI, in a master–detail "intelligence
 * terminal" layout with smooth, spring-based transitions throughout.
 * ------------------------------------------------------------------ */

type Pillar = "E" | "S" | "G";
type ImpactKind = "risk" | "opportunity" | "neutral";

interface ESGSignal {
  id: string;
  category: string;
  pillar: Pillar;
  source: string;
  verified: boolean;
  publishedAt: string;
  ingestedAgo: string;
  readTime: string;
  title: string;
  aiSummary: string;
  impactScore: number;
  impactKind: ImpactKind;
  confidence: number;
  frameworks: string[];
  suggestedAction: string;
  askPrompts: string[];
}

const signals: ESGSignal[] = [
  {
    id: "s1",
    category: "Regulation",
    pillar: "G",
    source: "European Commission · CSRD/ESRS",
    verified: true,
    publishedAt: "May 24, 2026",
    ingestedAgo: "5h ago",
    readTime: "5 min read",
    title: "CSRD Phase-In Requirements Tighten for FY2026",
    aiSummary:
      "The Commission confirms expanded CSRD scope: all listed SMEs must begin sustainability reporting under the ESRS standards by January 2026, accelerating disclosure timelines across the EU. Your current ESRS readiness sits at 94%, leaving a narrow window to close residual data gaps.",
    impactScore: 88,
    impactKind: "risk",
    confidence: 91,
    frameworks: ["CSRD", "ESRS E1–S4", "GRI", "ISSB S1"],
    suggestedAction:
      "Review your CSRD readiness — your compliance score is 94%. Close the remaining ESRS data gaps before Q3.",
    askPrompts: [
      "What ESRS data gaps remain?",
      "When is our disclosure deadline?",
      "Draft a board summary of this signal",
    ],
  },
  {
    id: "s2",
    category: "Carbon",
    pillar: "E",
    source: "U.S. SEC · Climate Disclosure Rules",
    verified: true,
    publishedAt: "May 22, 2026",
    ingestedAgo: "1d ago",
    readTime: "4 min read",
    title: "Scope 3 Emissions Now Mandatory in SEC Climate Rules",
    aiSummary:
      "New SEC guidance requires large filers to disclose material Scope 3 emissions, shifting pressure upstream to suppliers. Your tier-2 supply base currently has the weakest emissions coverage, concentrating most of the new exposure there.",
    impactScore: 81,
    impactKind: "risk",
    confidence: 87,
    frameworks: ["SEC Climate", "GHG Protocol", "ESRS E1", "TCFD"],
    suggestedAction:
      "Map your top 10 suppliers' emissions to prepare Scope 3 disclosure and close the tier-2 coverage gap first.",
    askPrompts: [
      "Which suppliers lack emissions data?",
      "What's our Scope 3 coverage today?",
      "Suggest a supplier engagement plan",
    ],
  },
  {
    id: "s3",
    category: "Energy",
    pillar: "E",
    source: "IRENA · Renewable Capacity Statistics",
    verified: true,
    publishedAt: "May 20, 2026",
    ingestedAgo: "2d ago",
    readTime: "3 min read",
    title: "Global Renewable Capacity Hits 5,000 GW Milestone",
    aiSummary:
      "IRENA reports renewables now account for 46% of global installed power capacity, driven by surging solar deployments. Maturing PPA markets create a near-term opportunity to lock favourable rates across your remaining grid-powered facilities.",
    impactScore: 58,
    impactKind: "opportunity",
    confidence: 79,
    frameworks: ["GRI 302 (Energy)", "ESRS E1", "RE100", "CDP Climate"],
    suggestedAction:
      "Consider shifting 2 more facilities to renewable PPAs to cut emissions ~4%.",
    askPrompts: [
      "Which facilities are still grid-powered?",
      "What emissions cut would PPAs deliver?",
      "Compare PPA vs on-site solar",
    ],
  },
  {
    id: "s4",
    category: "Risk",
    pillar: "S",
    source: "World Resources Institute · Aqueduct 4.0",
    verified: true,
    publishedAt: "May 18, 2026",
    ingestedAgo: "4d ago",
    readTime: "6 min read",
    title: "WRI water-stress map flags 25 countries as critical by 2030",
    aiSummary:
      "Aqueduct 4.0 reclassifies water risk for 25 countries. Two of your high-volume manufacturing geographies move into the 'extremely high' band, raising operational-continuity and social-license exposure for water-intensive sites.",
    impactScore: 73,
    impactKind: "risk",
    confidence: 84,
    frameworks: ["GRI 303 (Water)", "CDP Water", "ESRS E3", "TCFD"],
    suggestedAction:
      "Re-run the site water-stress overlay and add the 2 newly reclassified geographies to the quarterly supplier risk review.",
    askPrompts: [
      "Which of our sites are now extremely high risk?",
      "What is our water withdrawal in stressed basins?",
      "Suggest mitigation for water-stressed sites",
    ],
  },
];

const PILLAR_META: Record<
  Pillar,
  { label: string; text: string; bg: string; dot: string }
> = {
  E: { label: "Environmental", text: "text-success", bg: "bg-success/15", dot: "bg-success" },
  S: { label: "Social", text: "text-info", bg: "bg-info/15", dot: "bg-info" },
  G: { label: "Governance", text: "text-warning", bg: "bg-warning/15", dot: "bg-warning" },
};

const IMPACT_META: Record<ImpactKind, { label: string; icon: LucideIcon; text: string; bg: string }> = {
  risk: { label: "Risk", icon: TrendingUp, text: "text-destructive", bg: "bg-destructive/10" },
  opportunity: { label: "Opportunity", icon: TrendingDown, text: "text-success", bg: "bg-success/10" },
  neutral: { label: "Neutral", icon: Minus, text: "text-muted-foreground", bg: "bg-secondary/40" },
};

type FilterKey = "all" | Pillar;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "E", label: "Environmental" },
  { key: "S", label: "Social" },
  { key: "G", label: "Governance" },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-destructive";
  if (score >= 60) return "text-warning";
  return "text-success";
}
function scoreStroke(score: number) {
  if (score >= 80) return "hsl(var(--destructive))";
  if (score >= 60) return "hsl(var(--warning))";
  return "hsl(var(--success))";
}

/* --------------------------- Animated number --------------------------- */

function CountUp({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [mv, value]);
  return <motion.span className={className}>{rounded}</motion.span>;
}

/* ----------------------------- Impact gauge ----------------------------- */

function ImpactGauge({ score }: { score: number }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative flex h-[104px] w-[104px] items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
        <motion.circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          stroke={scoreStroke(score)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - score / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${scoreStroke(score)})` }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <CountUp value={score} className={`font-display text-2xl font-bold ${scoreColor(score)}`} />
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Impact</span>
      </div>
    </div>
  );
}

/* --------------------------- Ask AI sub-panel --------------------------- */

interface ChatTurn {
  role: "user" | "ai";
  text: string;
}

function inferAnswer(signal: ESGSignal, q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("timeline") || lower.includes("deadline")) {
    return `Your effective window shortens. The mapped framework ${signal.frameworks[0]} drives the date — I'd anchor internal milestones 6–8 weeks ahead of the disclosure cut-off and treat the recommended action as the critical path.`;
  }
  if (lower.includes("board") || lower.includes("summary") || lower.includes("brief")) {
    return `Board-ready summary: a ${IMPACT_META[signal.impactKind].label.toLowerCase()} signal scored ${signal.impactScore}/100 (${signal.confidence}% confidence), mapped to ${signal.frameworks.join(
      ", "
    )}. Recommended action — ${signal.suggestedAction}`;
  }
  if (lower.includes("supplier") || lower.includes("coverage") || lower.includes("data")) {
    return `The data gap concentrates in your tier-2 supply base. The suggested action closes the largest portion of the exposure first: ${signal.suggestedAction}`;
  }
  if (lower.includes("score") || lower.includes("impact") || lower.includes("material")) {
    return `I scored this ${signal.impactScore}/100 because it directly affects ${PILLAR_META[signal.pillar].label.toLowerCase()} disclosures mapped to ${signal.frameworks[0]}. Confidence is ${signal.confidence}% — the source is verified (${signal.source}).`;
  }
  return `Here's my read: ${signal.aiSummary} The highest-leverage next step — ${signal.suggestedAction}`;
}

function AskAI({ signal }: { signal: ESGSignal }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTurns([]);
    setInput("");
    setThinking(false);
  }, [signal.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  const ask = (q: string) => {
    if (!q.trim() || thinking) return;
    setTurns((t) => [...t, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    const answer = inferAnswer(signal, q);
    window.setTimeout(() => {
      setTurns((t) => [...t, { role: "ai", text: answer }]);
      setThinking(false);
    }, 700);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Sparkles size={13} />
        </span>
        <span className="text-xs font-semibold text-foreground">Ask AI about this signal</span>
      </div>

      {turns.length > 0 && (
        <div ref={scrollRef} className="mb-2.5 max-h-44 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {turns.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={`rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
                  t.role === "user"
                    ? "ml-6 bg-secondary/60 text-foreground"
                    : "mr-2 border border-primary/15 bg-primary/10 text-foreground"
                }`}
              >
                {t.role === "ai" && (
                  <span className="mr-1 inline-flex items-center text-primary">
                    <BrainCircuit size={11} />
                  </span>
                )}
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mr-2 flex items-center gap-1.5 rounded-xl border border-primary/15 bg-primary/10 px-2.5 py-1.5 text-xs text-muted-foreground"
            >
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </span>
              Analyzing against your ESG data…
            </motion.div>
          )}
        </div>
      )}

      {turns.length === 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {signal.askPrompts.map((p) => (
            <button
              key={p}
              onClick={() => ask(p)}
              className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this signal…"
          className="flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

/* --------------------------- List row (master) --------------------------- */

function SignalRow({
  signal,
  active,
  onSelect,
}: {
  signal: ESGSignal;
  active: boolean;
  onSelect: () => void;
}) {
  const pillar = PILLAR_META[signal.pillar];
  return (
    <button
      onClick={onSelect}
      className={`relative w-full rounded-xl px-3 py-3 text-left transition-colors ${
        active ? "bg-secondary/50" : "hover:bg-secondary/30"
      }`}
    >
      {active && (
        <motion.span
          layoutId="news-signal-active"
          className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary"
          style={{ boxShadow: "0 0 10px hsl(var(--primary) / 0.6)" }}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <div className="flex items-start gap-2.5 pl-1.5">
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${pillar.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {signal.category}
            </span>
            {signal.verified && <BadgeCheck size={11} className="text-success" />}
            <span className="ml-auto text-[10px] text-muted-foreground">{signal.ingestedAgo}</span>
          </div>
          <p
            className={`text-[13px] font-medium leading-snug line-clamp-2 transition-colors ${
              active ? "text-foreground" : "text-foreground/80"
            }`}
          >
            {signal.title}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full rounded-full"
                style={{ background: scoreStroke(signal.impactScore) }}
                initial={{ width: 0 }}
                animate={{ width: `${signal.impactScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className={`text-[10px] font-bold ${scoreColor(signal.impactScore)}`}>
              {signal.impactScore}
            </span>
          </div>
        </div>
        <ChevronRight
          size={14}
          className={`mt-1 shrink-0 transition-all ${
            active ? "translate-x-0 text-primary opacity-100" : "-translate-x-1 text-muted-foreground opacity-0"
          }`}
        />
      </div>
    </button>
  );
}

/* ------------------------- Detail panel (detail) ------------------------- */

function DetailPanel({ signal }: { signal: ESGSignal }) {
  const [actioned, setActioned] = useState(false);
  const pillar = PILLAR_META[signal.pillar];
  const impact = IMPACT_META[signal.impactKind];
  const ImpactIcon = impact.icon;

  useEffect(() => setActioned(false), [signal.id]);

  return (
    <motion.div
      key={signal.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pillar.bg} ${pillar.text}`}>
          {pillar.label}
        </span>
        {signal.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
            <BadgeCheck size={11} /> Verified source
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{signal.source}</span>
          <span className="flex items-center gap-1">
            <Clock size={10} /> {signal.readTime}
          </span>
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold leading-snug text-foreground md:text-xl">
            {signal.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${impact.bg} ${impact.text}`}>
              <ImpactIcon size={12} /> {impact.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Gauge size={12} /> {signal.confidence}% confidence
            </span>
            <span className="text-[11px] text-muted-foreground">{signal.publishedAt}</span>
          </div>
        </div>
        <ImpactGauge score={signal.impactScore} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <BrainCircuit size={12} className="text-primary" /> AI Summary
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/90">{signal.aiSummary}</p>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Layers size={12} className="text-primary" /> Framework Mapping
        </div>
        <div className="flex flex-wrap gap-1.5">
          {signal.frameworks.map((f, i) => (
            <motion.span
              key={f}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-foreground"
            >
              {f}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-warning/20 bg-gradient-to-br from-warning/[0.08] to-transparent p-3.5">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-warning">
          <Lightbulb size={12} /> Suggested Action
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/90">{signal.suggestedAction}</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setActioned(true)}
          disabled={actioned}
          className={`mt-2.5 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            actioned ? "cursor-default bg-success/15 text-success" : "bg-warning/15 text-warning hover:bg-warning/25"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {actioned ? (
              <motion.span
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} /> Task created
              </motion.span>
            ) : (
              <motion.span
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-1.5"
              >
                Create task <ArrowRight size={13} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AskAI signal={signal} />
    </motion.div>
  );
}

/* ------------------------------ Feed shell ------------------------------ */

export default function NewsInsights() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [activeId, setActiveId] = useState<string>(signals[0].id);

  const visible = filter === "all" ? signals : signals.filter((s) => s.pillar === filter);
  const active = signals.find((s) => s.id === activeId) ?? signals[0];

  const verifiedCount = signals.filter((s) => s.verified).length;
  const highImpact = signals.filter((s) => s.impactScore >= 80).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card glow-border relative overflow-hidden"
    >
      {/* Section header */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Newspaper size={12} className="text-primary" />
            <span>News &amp; Insights</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-success">
              <RadioTower size={9} className="animate-pulse" /> Live ingestion
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mt-1">Latest ESG News</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay updated on sustainability, compliance, and climate trends
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-lg border border-success/20 bg-success/5 px-2.5 py-1.5 font-medium text-success">
            <ShieldCheck size={12} /> {verifiedCount} verified
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 font-medium text-destructive">
            <Gauge size={12} /> {highImpact} high impact
          </span>
        </div>
      </div>

      {/* Pillar filters */}
      <div className="flex flex-wrap items-center gap-1.5 px-5 py-3 border-b border-border/60">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Master list */}
        <div className="lg:col-span-2 space-y-1 p-3 border-b lg:border-b-0 lg:border-r border-border/60">
          {visible.map((signal, i) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <SignalRow
                signal={signal}
                active={active.id === signal.id}
                onSelect={() => setActiveId(signal.id)}
              />
            </motion.div>
          ))}
          {visible.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No signals in this pillar yet.
            </p>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <DetailPanel key={active.id} signal={active} />
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
