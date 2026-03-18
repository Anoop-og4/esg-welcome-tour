import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Leaf,
  Users,
  ShieldCheck,
  TrendingUp,
  CircleDot,
} from "lucide-react";
import { ESG_ENTITIES, ESGEntity, ESGIssue, IssueStatus, Severity } from "@/data/esgData";

// ── Severity helpers ─────────────────────────
const severityStyle: Record<Severity, string> = {
  Low: "text-primary bg-primary/10 border-primary/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  High: "text-destructive bg-destructive/10 border-destructive/20",
};

const statusStyle: Record<IssueStatus, string> = {
  Open: "text-destructive",
  "In Progress": "text-yellow-400",
  Resolved: "text-primary",
};

const statusDot: Record<IssueStatus, string> = {
  Open: "bg-destructive",
  "In Progress": "bg-yellow-400",
  Resolved: "bg-primary",
};

// ── Mini radial ring ──────────────────────────
function MetricRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const progress = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-11 w-11">
        <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
          <circle cx="22" cy="22" r={r} fill="none" strokeWidth="3.5" stroke="hsl(var(--border))" strokeOpacity="0.3" />
          <motion.circle
            cx="22" cy="22" r={r}
            fill="none" strokeWidth="3.5"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - progress }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-foreground">{value}</span>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ── Issue row ─────────────────────────────────
function IssueRow({ issue, idx }: { issue: ESGIssue; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.06 }}
      className="flex items-start gap-2.5 p-2 rounded-lg bg-secondary/10 border border-border/20 hover:bg-secondary/20 transition-all"
    >
      <div className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[issue.status]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-foreground">{issue.type}</span>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${severityStyle[issue.severity]}`}>
            {issue.severity}
          </span>
          <span className={`text-[8px] font-medium ml-auto ${statusStyle[issue.status]}`}>{issue.status}</span>
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{issue.description}</p>
        <span className="text-[8px] text-muted-foreground/60 mt-0.5 block">{issue.detectedAt}</span>
      </div>
    </motion.div>
  );
}

// ── Entity row ────────────────────────────────
function EntityRow({ entity, index }: { entity: ESGEntity; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const asset = entity.assets[0];

  if (!asset) return null;

  const openIssues = asset.issues.filter((i) => i.status === "Open").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index }}
      className="rounded-xl border border-border/30 overflow-hidden"
    >
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-3 bg-secondary/15 hover:bg-secondary/25 transition-all text-left"
      >
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
          openIssues > 0 ? "bg-destructive/10 border border-destructive/20" : "bg-primary/10 border border-primary/20"
        }`}>
          <Building2 size={12} className={openIssues > 0 ? "text-destructive" : "text-primary"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">{entity.company.name}</span>
            <span className="text-[9px] text-muted-foreground">{entity.company.country}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] text-muted-foreground">{entity.company.sector}</span>
            <span className="text-[9px] text-muted-foreground">·</span>
            <span className="text-[9px] text-muted-foreground">Est. {entity.company.foundedYear}</span>
          </div>
        </div>

        {/* ESG overall */}
        <div className="flex items-center gap-1 shrink-0">
          <TrendingUp size={10} className="text-primary" />
          <span className="text-sm font-bold text-primary">{asset.metrics.overall}</span>
        </div>

        {/* Issues badge */}
        {asset.issuesCount > 0 && (
          <div className="flex items-center gap-1 text-[9px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded-full">
            <AlertTriangle size={8} />
            {asset.issuesCount}
          </div>
        )}

        {/* Expand chevron */}
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={12} className="text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-2 bg-secondary/8 border-t border-border/20 space-y-4">

              {/* Asset info + metrics */}
              <div className="grid grid-cols-2 gap-3">
                {/* Asset details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <Layers size={8} /> Asset
                  </div>
                  <div className="text-xs font-semibold text-foreground">{asset.name}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-secondary/30 border border-border/20 p-2">
                      <div className="text-[9px] text-muted-foreground mb-0.5">Category</div>
                      <div className="text-[10px] font-semibold text-foreground">{asset.category}</div>
                    </div>
                    <div className="rounded-lg bg-secondary/30 border border-border/20 p-2">
                      <div className="text-[9px] text-muted-foreground mb-0.5">Completeness</div>
                      <div className="text-[10px] font-semibold text-blue-400">{asset.dataCompleteness}%</div>
                    </div>
                    <div className="rounded-lg bg-secondary/30 border border-border/20 p-2">
                      <div className="text-[9px] text-muted-foreground mb-0.5">Updated</div>
                      <div className="text-[10px] font-semibold text-foreground">{asset.lastUpdated}</div>
                    </div>
                    <div className="rounded-lg bg-secondary/30 border border-border/20 p-2">
                      <div className="text-[9px] text-muted-foreground mb-0.5">ESG Score</div>
                      <div className="text-[10px] font-semibold text-primary">{asset.esgScore}</div>
                    </div>
                  </div>
                </div>

                {/* ESG metric rings */}
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                    <CircleDot size={8} /> ESG Metrics
                  </div>
                  <div className="flex justify-around">
                    <MetricRing value={asset.metrics.environmental} label="Env" color="hsl(var(--neon-green))" />
                    <MetricRing value={asset.metrics.social} label="Social" color="hsl(210 100% 60%)" />
                    <MetricRing value={asset.metrics.governance} label="Gov" color="hsl(270 80% 65%)" />
                  </div>
                </div>
              </div>

              {/* Issues */}
              {asset.issues.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                    <AlertTriangle size={8} /> Issues ({asset.issues.length})
                  </div>
                  <div className="space-y-1.5">
                    {asset.issues.map((issue, i) => (
                      <IssueRow key={issue.id} issue={issue} idx={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-[10px] text-primary font-medium">
                  <ShieldCheck size={11} />
                  No active ESG issues — clean record
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────
export default function ESGEntityPanel() {
  const [filter, setFilter] = useState<"all" | "issues">("all");

  const visibleEntities = ESG_ENTITIES.filter((e) => {
    if (filter === "issues") return (e.assets[0]?.issuesCount ?? 0) > 0;
    return true;
  });

  const totalIssues = ESG_ENTITIES.reduce((sum, e) => sum + (e.assets[0]?.issues ?? []).length, 0);
  const openIssues = ESG_ENTITIES.reduce(
    (sum, e) => sum + (e.assets[0]?.issues.filter((i) => i.status === "Open").length ?? 0),
    0
  );
  const resolved = ESG_ENTITIES.reduce(
    (sum, e) => sum + (e.assets[0]?.issues.filter((i) => i.status === "Resolved").length ?? 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card glow-border p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Building2 size={14} className="text-blue-400" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">ESG Entities</h2>
          </div>
          <p className="text-xs text-muted-foreground pl-9">Companies, assets, metrics & issues</p>
        </div>
        {/* Filter toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary/30 border border-border/30">
          {(["all", "issues"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all capitalize ${
                filter === f
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : "With Issues"}
            </button>
          ))}
        </div>
      </div>

      {/* Issue summary strip */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Total Issues", value: totalIssues, color: "text-muted-foreground", icon: AlertTriangle },
          { label: "Open", value: openIssues, color: "text-destructive", icon: AlertTriangle },
          { label: "Resolved", value: resolved, color: "text-primary", icon: ShieldCheck },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/20 border border-border/25">
            <Icon size={11} className={color} />
            <div>
              <div className={`text-sm font-bold ${color}`}>{value}</div>
              <div className="text-[9px] text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Entity list */}
      <div className="space-y-2">
        {visibleEntities.map((entity, i) => (
          <EntityRow key={entity.company.id} entity={entity} index={i} />
        ))}
        {visibleEntities.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">No entities match this filter</div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{ESG_ENTITIES.length} entities across {[...new Set(ESG_ENTITIES.map(e => e.company.sector))].length} sectors</span>
        <span>Click any row to expand</span>
      </div>
    </motion.div>
  );
}