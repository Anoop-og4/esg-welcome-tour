import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap,
} from "lucide-react";

type Impact = "high" | "medium" | "low";

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  impact: Impact;
  suggestion: string;
}

const featured: NewsItem = {
  id: "f1",
  category: "Regulation",
  title: "CSRD Phase-In Requirements Tighten for FY2026",
  summary:
    "The European Commission confirms expanded CSRD scope: all listed SMEs must begin sustainability reporting under the ESRS standards by January 2026, accelerating disclosure timelines across the EU.",
  date: "May 24, 2026",
  readTime: "5 min read",
  impact: "high",
  suggestion:
    "Review your CSRD readiness — your compliance score is 94%. Close the remaining ESRS data gaps before Q3.",
};

const headlines: NewsItem[] = [
  {
    id: "1",
    category: "Carbon",
    title: "Scope 3 Emissions Now Mandatory in SEC Climate Rules",
    summary:
      "New SEC guidance requires large filers to disclose material Scope 3 emissions, shifting pressure upstream to suppliers.",
    date: "May 22, 2026",
    readTime: "4 min",
    impact: "high",
    suggestion: "Map your top 10 suppliers' emissions to prepare Scope 3 disclosure.",
  },
  {
    id: "2",
    category: "Energy",
    title: "Global Renewable Capacity Hits 5,000 GW Milestone",
    summary:
      "IRENA reports renewables now account for 46% of global installed power capacity, driven by surging solar deployments.",
    date: "May 20, 2026",
    readTime: "3 min",
    impact: "medium",
    suggestion: "Consider shifting 2 more facilities to renewable PPAs to cut emissions ~4%.",
  },
  {
    id: "3",
    category: "Risk",
    title: "Supply Chain Water Stress Map Launched by WRI",
    summary:
      "Aqueduct 4.0 identifies 25 countries facing critical water scarcity risk by 2030, urging ESG teams to reassess geographies.",
    date: "May 18, 2026",
    readTime: "6 min",
    impact: "medium",
    suggestion: "3 of your sites sit in high water-stress zones — flag them for review.",
  },
];

const impactStyles: Record<Impact, { dot: string; text: string; label: string }> = {
  high: { dot: "bg-destructive", text: "text-destructive", label: "High impact" },
  medium: { dot: "bg-warning", text: "text-warning", label: "Medium impact" },
  low: { dot: "bg-success", text: "text-success", label: "Low impact" },
};

function ImpactBadge({ impact }: { impact: Impact }) {
  const s = impactStyles[impact];
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${s.text}`}>
      <span className={`relative flex h-1.5 w-1.5`}>
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`}
        />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
}

export default function NewsInsights() {
  const [active, setActive] = useState<NewsItem>(featured);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card glow-border relative overflow-hidden"
    >
      {/* Animated background layer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.05]" />
        <motion.div
          aria-hidden
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--primary)) 0.5px, transparent 0.5px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {/* Section header */}
      <div className="relative flex items-end justify-between gap-3 px-5 pt-5 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Newspaper size={12} className="text-primary" />
            <span>News &amp; Insights</span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mt-1">Latest ESG News</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay updated — and see how each story impacts your program
          </p>
        </div>
        <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors">
          View All
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Featured / active lead story */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border/60">
          <AnimatePresence mode="wait">
            <motion.article
              key={active.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="group relative flex flex-col justify-end p-5 min-h-[280px] cursor-pointer overflow-hidden"
            >
              <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={16} />
              </div>

              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <Sparkles size={10} />
                    Featured · {active.category}
                  </span>
                  <ImpactBadge impact={active.impact} />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {active.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 max-w-xl">
                  {active.summary}
                </p>

                {/* Smart suggestion */}
                <motion.div
                  key={active.id + "-sugg"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] p-3 max-w-xl"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Lightbulb size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Suggested action
                    </p>
                    <p className="text-xs text-foreground/90 leading-relaxed mt-0.5">
                      {active.suggestion}
                    </p>
                  </div>
                </motion.div>

                <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                  <span>{active.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {active.readTime}
                  </span>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Headline list — selectable */}
        <div className="lg:col-span-2 divide-y divide-border/60">
          {[featured, ...headlines].map((item, i) => {
            const isActive = active.id === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActive(item)}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className={`group relative flex w-full flex-col gap-1.5 p-4 text-left transition-colors ${
                  isActive ? "bg-primary/[0.07]" : "hover:bg-secondary/30"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="news-active-bar"
                    className="absolute left-0 top-0 h-full w-0.5 bg-primary"
                  />
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={10} />
                    {item.readTime}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between">
                  <ImpactBadge impact={item.impact} />
                  <span className="text-[10px] text-muted-foreground">{item.date}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
