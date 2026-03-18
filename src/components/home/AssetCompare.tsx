import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Category, RANKED_ASSETS } from "@/data/esgData";


// ── helpers ──────────────────────────────────
const ALL_CATEGORIES: Category[] = ["Energy", "Tech", "Manufacturing", "Finance", "Logistics"];

const categoryColors: Record<Category, string> = {
  Energy: "hsl(var(--neon-green))",
  Tech: "hsl(210 100% 60%)",
  Manufacturing: "hsl(30 95% 55%)",
  Finance: "hsl(270 80% 65%)",
  Logistics: "hsl(180 70% 50%)",
};

const categoryBg: Record<Category, string> = {
  Energy: "bg-primary/10 text-primary border-primary/20",
  Tech: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Manufacturing: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Finance: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Logistics: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-secondary/40 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
      />
    </div>
  );
}

function FreshnessChip({ score }: { score: number }) {
  if (score >= 100) return <span className="text-primary text-[10px] flex items-center gap-0.5 font-medium"><CheckCircle2 size={9} /> Live</span>;
  if (score >= 70) return <span className="text-yellow-400 text-[10px] flex items-center gap-0.5 font-medium"><Clock size={9} /> Recent</span>;
  if (score >= 40) return <span className="text-orange-400 text-[10px] flex items-center gap-0.5 font-medium"><AlertCircle size={9} /> Stale</span>;
  return <span className="text-destructive text-[10px] flex items-center gap-0.5 font-medium"><AlertCircle size={9} /> Outdated</span>;
}

type SortKey = "rank" | "esgScore" | "dataCompleteness" | "freshnesScore" | "issuesCount";

export default function AssetCompare() {
  const [activeCategories, setActiveCategories] = useState<Category[]>([...ALL_CATEGORIES]);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (cat: Category) =>
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "rank" || key === "issuesCount" ? "asc" : "desc"); }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const filtered = RANKED_ASSETS.filter((a) => activeCategories.includes(a.category));

  const sorted = [...filtered].sort((a, b) => {
    const mult = sortDir === "asc" ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * mult;
  });

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown size={9} className="text-muted-foreground/40" />;
    return sortDir === "asc" ? <ChevronUp size={9} className="text-primary" /> : <ChevronDown size={9} className="text-primary" />;
  };

  const rankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card glow-border p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <BarChart3 size={14} className="text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">Asset Compare</h2>
          </div>
          <p className="text-xs text-muted-foreground pl-9">Composite-ranked ESG asset intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
              showFilters
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter size={9} />
            Filter
          </button>
          <div className="text-[10px] text-muted-foreground bg-secondary/40 px-2.5 py-1.5 rounded-lg border border-border/30">
            {sorted.length} assets
          </div>
        </div>
      </div>

      {/* Category filter chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 mb-4 p-3 rounded-xl bg-secondary/20 border border-border/30">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    activeCategories.includes(cat)
                      ? categoryBg[cat]
                      : "bg-secondary/20 border-border/20 text-muted-foreground/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weight formula banner */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-secondary/20 border border-border/20">
        <Zap size={10} className="text-primary shrink-0" />
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-muted-foreground font-mono">
          <span><span className="text-primary font-bold">0.4</span> × ESG</span>
          <span>+</span>
          <span><span className="text-blue-400 font-bold">0.3</span> × Completeness</span>
          <span>+</span>
          <span><span className="text-yellow-400 font-bold">0.2</span> × Freshness</span>
          <span>−</span>
          <span><span className="text-destructive font-bold">0.1</span> × Issues</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {/* Column headers */}
        <div className="grid grid-cols-[28px_28px_1fr_80px_80px_72px_64px_68px] gap-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
          <span />
          <button className="flex items-center gap-0.5" onClick={() => handleSort("rank")}>
            # <SortIcon k="rank" />
          </button>
          <span>Asset</span>
          <button className="flex items-center justify-center gap-0.5 w-full" onClick={() => handleSort("esgScore")}>
            ESG <SortIcon k="esgScore" />
          </button>
          <button className="flex items-center justify-center gap-0.5 w-full" onClick={() => handleSort("dataCompleteness")}>
            Data% <SortIcon k="dataCompleteness" />
          </button>
          <button className="flex items-center justify-center gap-0.5 w-full" onClick={() => handleSort("freshnesScore")}>
            Fresh <SortIcon k="freshnesScore" />
          </button>
          <button className="flex items-center justify-center gap-0.5 w-full" onClick={() => handleSort("issuesCount")}>
            Issues <SortIcon k="issuesCount" />
          </button>
          <span className="text-center">Score</span>
        </div>

        <div className="space-y-1.5">
          {sorted.map((asset, idx) => {
            const isSelected = selectedIds.includes(asset.id);
            const catColor = categoryColors[asset.category];
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
                onClick={() => toggleSelect(asset.id)}
                className={`grid grid-cols-[28px_28px_1fr_80px_80px_72px_64px_68px] gap-2 items-center rounded-xl px-2 py-2.5 border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/8 border-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.06)]"
                    : "bg-secondary/15 border-border/25 hover:bg-secondary/30 hover:border-border/50"
                }`}
              >
                {/* Checkbox */}
                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                  isSelected ? "bg-primary border-primary" : "border-border/50 bg-transparent"
                }`}>
                  {isSelected && <ShieldCheck size={9} className="text-primary-foreground" />}
                </div>

                {/* Rank */}
                <div className="text-center text-xs font-bold text-muted-foreground">{rankMedal(asset.rank)}</div>

                {/* Asset info */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{asset.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${categoryBg[asset.category]}`}>
                      {asset.category}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{asset.lastUpdated.slice(0, 7)}</span>
                  </div>
                </div>

                {/* ESG Score */}
                <div className="flex flex-col gap-1 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: catColor }}>{asset.esgScore}</span>
                    <span className="text-[9px] text-muted-foreground">/100</span>
                  </div>
                  <ScoreBar value={asset.esgScore} color={catColor} />
                </div>

                {/* Data completeness */}
                <div className="flex flex-col gap-1 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">{asset.dataCompleteness}%</span>
                  </div>
                  <ScoreBar value={asset.dataCompleteness} color="hsl(210 100% 60%)" />
                </div>

                {/* Freshness */}
                <div className="flex justify-center">
                  <FreshnessChip score={asset.freshnesScore} />
                </div>

                {/* Issues */}
                <div className="flex justify-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    asset.issuesCount === 0
                      ? "text-primary bg-primary/10 border-primary/20"
                      : asset.issuesCount <= 1
                      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      : "text-destructive bg-destructive/10 border-destructive/20"
                  }`}>
                    {asset.issuesCount}
                  </span>
                </div>

                {/* Composite score */}
                <div className="text-center">
                  <span className="text-xs font-bold text-foreground">{asset.compositeScore.toFixed(1)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20 text-[10px] text-muted-foreground">
        <span>{selectedIds.length > 0 ? `${selectedIds.length} asset${selectedIds.length > 1 ? "s" : ""} selected` : "Click rows to compare"}</span>
        <span>Last computed: Jan 25, 2026</span>
      </div>
    </motion.div>
  );
}