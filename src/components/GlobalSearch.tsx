import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Leaf, Users, Building2, ShoppingBag, Settings,
  FileText, Shield, BarChart3, Target, HelpCircle,
  Search, ArrowRight, Zap, BookOpen, TrendingUp,
  Clock, Star, Sparkles, X, ArrowUpRight,
  Flame, Command, Filter, Globe, Factory,
  AlertTriangle, ChevronDown, Pin, Bookmark,
  Activity, Gauge, UserCheck, Scale,
  SlidersHorizontal, Tag, LayoutGrid
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GlobalSearchProps {
  onNavigate: (view: string) => void;
}

type CategoryFilter = "all" | "pages" | "help" | "actions" | "metrics" | "reports";
type ESGPillar = "environment" | "social" | "governance";

interface ESGMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
  pillar: ESGPillar;
  score?: number;
}

interface FilterChip {
  id: string;
  label: string;
  group: string;
  active: boolean;
}

interface SearchResult {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  group: "pages" | "help" | "actions" | "metrics" | "reports";
  keywords?: string;
  action: () => void;
  pillar?: ESGPillar;
  score?: number;
  tags?: string[];
}

const STORAGE_KEY = "esg-search-history";
const SAVED_QUERIES_KEY = "esg-saved-queries";
const PINNED_FILTERS_KEY = "esg-pinned-filters";
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveSearchTerm(term: string) {
  const history = getSearchHistory().filter((t) => t !== term);
  history.unshift(term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
function clearSearchHistory() { localStorage.removeItem(STORAGE_KEY); }

function getSavedQueries(): string[] {
  try { return JSON.parse(localStorage.getItem(SAVED_QUERIES_KEY) || "[]"); } catch { return []; }
}
function saveQuery(q: string) {
  const saved = getSavedQueries().filter(s => s !== q);
  saved.unshift(q);
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(saved.slice(0, 10)));
}
function removeSavedQuery(q: string) {
  const saved = getSavedQueries().filter(s => s !== q);
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(saved));
}

function getPinnedFilters(): string[] {
  try { return JSON.parse(localStorage.getItem(PINNED_FILTERS_KEY) || "[]"); } catch { return []; }
}
function togglePinnedFilter(id: string) {
  const pinned = getPinnedFilters();
  const next = pinned.includes(id) ? pinned.filter(p => p !== id) : [...pinned, id];
  localStorage.setItem(PINNED_FILTERS_KEY, JSON.stringify(next));
  return next;
}

const CATEGORY_FILTERS: { key: CategoryFilter; label: string; icon: React.ElementType; color: string }[] = [
  { key: "all", label: "All", icon: LayoutGrid, color: "text-foreground" },
  { key: "pages", label: "Pages", icon: Home, color: "text-esg-primary" },
  { key: "metrics", label: "Metrics", icon: Activity, color: "text-esg-env" },
  { key: "reports", label: "Reports", icon: FileText, color: "text-esg-social" },
  { key: "help", label: "Articles", icon: BookOpen, color: "text-esg-gov" },
  { key: "actions", label: "Actions", icon: Zap, color: "text-accent" },
];

const ESG_PILLARS: { key: ESGPillar; label: string; icon: React.ElementType; color: string; bgColor: string }[] = [
  { key: "environment", label: "Environment", icon: Leaf, color: "text-esg-env", bgColor: "bg-esg-env/10" },
  { key: "social", label: "Social", icon: Users, color: "text-esg-social", bgColor: "bg-esg-social/10" },
  { key: "governance", label: "Governance", icon: Scale, color: "text-esg-gov", bgColor: "bg-esg-gov/10" },
];

const FILTER_CHIPS: FilterChip[] = [
  { id: "env", label: "Environment", group: "ESG Category", active: false },
  { id: "social", label: "Social", group: "ESG Category", active: false },
  { id: "gov", label: "Governance", group: "ESG Category", active: false },
  { id: "high", label: "High Risk", group: "Risk Level", active: false },
  { id: "medium", label: "Medium Risk", group: "Risk Level", active: false },
  { id: "low", label: "Low Risk", group: "Risk Level", active: false },
  { id: "2024", label: "2024", group: "Year", active: false },
  { id: "2023", label: "2023", group: "Year", active: false },
  { id: "apac", label: "APAC", group: "Region", active: false },
  { id: "emea", label: "EMEA", group: "Region", active: false },
  { id: "americas", label: "Americas", group: "Region", active: false },
];

const ESG_METRICS: ESGMetric[] = [
  { id: "m1", label: "Carbon Score", value: "72", unit: "/100", trend: "up", trendValue: "+3.2%", pillar: "environment", score: 72 },
  { id: "m2", label: "Scope 1 Emissions", value: "45,230", unit: "tCO₂e", trend: "down", trendValue: "-8.1%", pillar: "environment", score: 65 },
  { id: "m3", label: "Scope 2 Emissions", value: "128,400", unit: "tCO₂e", trend: "down", trendValue: "-4.5%", pillar: "environment", score: 58 },
  { id: "m4", label: "Diversity Score", value: "68", unit: "/100", trend: "up", trendValue: "+5.4%", pillar: "social", score: 68 },
  { id: "m5", label: "Gender Pay Gap", value: "4.2", unit: "%", trend: "down", trendValue: "-1.1%", pillar: "social", score: 78 },
  { id: "m6", label: "Governance Rating", value: "A-", unit: "rating", trend: "stable", trendValue: "0%", pillar: "governance", score: 82 },
  { id: "m7", label: "Board Independence", value: "78", unit: "%", trend: "up", trendValue: "+2%", pillar: "governance", score: 78 },
  { id: "m8", label: "Water Usage", value: "2.4M", unit: "m³", trend: "down", trendValue: "-12%", pillar: "environment", score: 71 },
];

const NAV_ITEMS = [
  { icon: Home, label: "Home", key: "home", desc: "Go to home dashboard", popularity: 95, pillar: undefined as ESGPillar | undefined },
  { icon: Leaf, label: "Environment", key: "environment", desc: "Emissions, energy, waste, and water metrics", popularity: 90, pillar: "environment" as ESGPillar },
  { icon: Users, label: "Social", key: "social", desc: "Workforce, diversity, community impact", popularity: 75, pillar: "social" as ESGPillar },
  { icon: Building2, label: "Governance", key: "governance", desc: "Board structure, policies, compliance", popularity: 70, pillar: "governance" as ESGPillar },
  { icon: Shield, label: "Customers", key: "customers", desc: "Customer satisfaction and engagement", popularity: 60, pillar: "social" as ESGPillar },
  { icon: ShoppingBag, label: "Products", key: "products", desc: "Product lifecycle and materials", popularity: 55, pillar: "environment" as ESGPillar },
  { icon: BarChart3, label: "Operations", key: "operations", desc: "Processes, materials, production", popularity: 65, pillar: "environment" as ESGPillar },
  { icon: Target, label: "Goals", key: "goals", desc: "Carbon reduction targets and SBTi", popularity: 80, pillar: "environment" as ESGPillar },
  { icon: FileText, label: "Docs Hub", key: "docs", desc: "Report templates and documentation", popularity: 50, pillar: undefined },
  { icon: Settings, label: "Admin", key: "admin", desc: "Admin settings and help studio", popularity: 40, pillar: undefined },
  { icon: HelpCircle, label: "Help Center", key: "help", desc: "Guides, FAQ, and tutorials", popularity: 85, pillar: undefined },
];

const HELP_ARTICLES = [
  { id: "h1", label: "Dashboard Overview", desc: "Key metrics, charts, and financial year selector", keywords: "emission carbon dashboard overview", pillar: undefined as ESGPillar | undefined },
  { id: "h2", label: "Using Filters", desc: "Filter by scope, facility, date range", keywords: "filter scope facility date", pillar: undefined },
  { id: "h3", label: "Scope 1 Emissions", desc: "Direct emissions from owned sources", keywords: "scope 1 direct fuel combustion", pillar: "environment" as ESGPillar },
  { id: "h4", label: "Scope 2 & 3 Emissions", desc: "Indirect and value chain emissions", keywords: "scope 2 3 indirect electricity", pillar: "environment" as ESGPillar },
  { id: "h5", label: "Managing Processes", desc: "Define production processes and fuel requirements", keywords: "process fuel production", pillar: "environment" as ESGPillar },
  { id: "h6", label: "Raw Materials", desc: "Track materials and product lifecycle", keywords: "raw material product lifecycle", pillar: "environment" as ESGPillar },
  { id: "h7", label: "Creating Goals", desc: "Set carbon reduction targets with SBTi", keywords: "goal target reduction sbti", pillar: "environment" as ESGPillar },
  { id: "h8", label: "Social Metrics", desc: "Diversity, equity, inclusion data", keywords: "social diversity equity inclusion", pillar: "social" as ESGPillar },
  { id: "h9", label: "Governance Overview", desc: "Board structure and compliance tracking", keywords: "governance board compliance", pillar: "governance" as ESGPillar },
];

const QUICK_ACTIONS = [
  { id: "a1", label: "View ESG Report", desc: "Open the latest ESG sustainability report", icon: FileText, keywords: "view esg report sustainability", pillar: undefined as ESGPillar | undefined },
  { id: "a2", label: "Compare Companies", desc: "Side-by-side ESG comparison tool", icon: BarChart3, keywords: "compare companies benchmark", pillar: undefined },
  { id: "a3", label: "Track Emission Trends", desc: "View historical emission trend data", icon: TrendingUp, keywords: "track emission trend historical", pillar: "environment" as ESGPillar },
  { id: "a4", label: "Export Report as PDF", desc: "Generate a downloadable emission report", icon: FileText, keywords: "export download pdf report", pillar: undefined },
  { id: "a5", label: "Create Reduction Goal", desc: "Set a new carbon reduction target", icon: Target, keywords: "create goal target reduction", pillar: "environment" as ESGPillar },
  { id: "a6", label: "Run Compliance Check", desc: "Verify regulatory alignment status", icon: Shield, keywords: "compliance check audit regulation", pillar: "governance" as ESGPillar },
  { id: "a7", label: "Schedule Report", desc: "Set up automated report generation", icon: Clock, keywords: "schedule automate report recurring", pillar: undefined },
];

const TRENDING_SEARCHES = [
  "carbon emissions 2024", "scope 1 reduction", "ESG compliance", "diversity metrics", "net zero targets",
];

const NL_SUGGESTIONS = [
  "Show companies with high carbon emissions in 2024",
  "Compare governance scores across APAC region",
  "Which facilities have the highest water usage?",
  "List all social metrics with declining trends",
];

function pillarColor(p?: ESGPillar) {
  if (p === "environment") return "text-esg-env";
  if (p === "social") return "text-esg-social";
  if (p === "governance") return "text-esg-gov";
  return "text-muted-foreground";
}
function pillarBg(p?: ESGPillar) {
  if (p === "environment") return "bg-esg-env/10";
  if (p === "social") return "bg-esg-social/10";
  if (p === "governance") return "bg-esg-gov/10";
  return "bg-muted";
}
function trendIcon(t: "up" | "down" | "stable") {
  if (t === "up") return "↑";
  if (t === "down") return "↓";
  return "→";
}
function trendColor(t: "up" | "down" | "stable", inverted = false) {
  if (t === "up") return inverted ? "text-esg-risk-high" : "text-esg-env";
  if (t === "down") return inverted ? "text-esg-env" : "text-esg-risk-high";
  return "text-muted-foreground";
}
function scoreColor(score: number) {
  if (score >= 75) return "bg-esg-env";
  if (score >= 50) return "bg-esg-risk-medium";
  return "bg-esg-risk-high";
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [history, setHistory] = useState<string[]>([]);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);
  const [pinnedFilterIds, setPinnedFilterIds] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activePillar, setActivePillar] = useState<ESGPillar | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNLHint, setShowNLHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(p => !p); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory());
      setSavedQueries(getSavedQueries());
      setPinnedFilterIds(getPinnedFilters());
      setQuery(""); setCategory("all"); setActiveFilters([]); setActivePillar(null); setShowAdvanced(false); setShowNLHint(false);
    }
  }, [open]);

  const navigate = useCallback((view: string, term?: string) => {
    if (term) saveSearchTerm(term);
    onNavigate(view);
    setOpen(false);
  }, [onNavigate]);

  const hasQuery = query.trim().length > 0;
  const isNLQuery = hasQuery && query.trim().split(" ").length >= 4;

  useEffect(() => {
    setShowNLHint(isNLQuery);
  }, [isNLQuery]);

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handlePinFilter = (id: string) => {
    const next = togglePinnedFilter(id);
    setPinnedFilterIds(next);
  };

  const handleSaveQuery = () => {
    if (query.trim()) { saveQuery(query.trim()); setSavedQueries(getSavedQueries()); }
  };

  const handleRemoveSavedQuery = (q: string) => {
    removeSavedQuery(q);
    setSavedQueries(getSavedQueries());
  };

  // Fuzzy filter
  const matchesQuery = useCallback((text: string) => {
    if (!hasQuery) return true;
    const q = query.toLowerCase();
    return text.toLowerCase().includes(q);
  }, [query, hasQuery]);

  const matchesPillar = useCallback((pillar?: ESGPillar) => {
    if (!activePillar) return true;
    return pillar === activePillar;
  }, [activePillar]);

  const filteredMetrics = useMemo(() => {
    if (category !== "all" && category !== "metrics") return [];
    return ESG_METRICS.filter(m =>
      matchesQuery(`${m.label} ${m.value} ${m.unit} ${m.pillar}`) && matchesPillar(m.pillar)
    );
  }, [category, matchesQuery, matchesPillar]);

  const filteredNav = useMemo(() => {
    if (category !== "all" && category !== "pages") return [];
    return NAV_ITEMS.filter(i => matchesQuery(`${i.label} ${i.desc}`) && matchesPillar(i.pillar));
  }, [category, matchesQuery, matchesPillar]);

  const filteredHelp = useMemo(() => {
    if (category !== "all" && category !== "help") return [];
    return HELP_ARTICLES.filter(a => matchesQuery(`${a.label} ${a.desc} ${a.keywords}`) && matchesPillar(a.pillar));
  }, [category, matchesQuery, matchesPillar]);

  const filteredActions = useMemo(() => {
    if (category !== "all" && category !== "actions") return [];
    return QUICK_ACTIONS.filter(a => matchesQuery(`${a.label} ${a.desc} ${a.keywords}`) && matchesPillar(a.pillar));
  }, [category, matchesQuery, matchesPillar]);

  const totalResults = filteredNav.length + filteredHelp.length + filteredActions.length + filteredMetrics.length;

  const handleClearHistory = useCallback(() => { clearSearchHistory(); setHistory([]); }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm transition-all hover:border-esg-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search size={15} className="text-muted-foreground group-hover:text-esg-primary transition-colors" />
        <span className="hidden sm:inline text-muted-foreground/80">Search ESG insights…</span>
        <kbd className="pointer-events-none ml-3 hidden select-none items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <Command size={10} />K
        </kbd>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            />
            <div className="flex items-start justify-center pt-[10vh] px-4" onClick={e => e.stopPropagation()}>
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card"
                style={{ boxShadow: "var(--shadow-search)" }}
              >
                {/* Search Header */}
                <div className="relative border-b border-border">
                  {/* ESG Pillar Toggles */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                    {ESG_PILLARS.map(p => (
                      <button
                        key={p.key}
                        onClick={() => setActivePillar(prev => prev === p.key ? null : p.key)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          activePillar === p.key
                            ? `${p.bgColor} ${p.color} ring-1 ring-current/20`
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <p.icon size={12} />
                        {p.label}
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5">
                      {hasQuery && (
                        <button
                          onClick={handleSaveQuery}
                          className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Save this query"
                        >
                          <Bookmark size={10} />
                          Save
                        </button>
                      )}
                      <button
                        onClick={() => setShowAdvanced(p => !p)}
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${
                          showAdvanced ? "bg-esg-primary/10 text-esg-primary" : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <SlidersHorizontal size={10} />
                        Filters
                      </button>
                    </div>
                  </div>

                  {/* Main Input */}
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-esg-primary/10">
                      <Search size={16} className="text-esg-primary" />
                    </div>
                    <input
                      ref={inputRef}
                      autoFocus
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={
                        activePillar === "environment" ? "Search environment metrics, emissions data…"
                        : activePillar === "social" ? "Search social metrics, diversity data…"
                        : activePillar === "governance" ? "Search governance, compliance, board data…"
                        : "Search ESG insights, metrics, reports…"
                      }
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                      onKeyDown={e => {
                        if (e.key === "Escape") setOpen(false);
                      }}
                    />
                    {hasQuery && (
                      <button onClick={() => setQuery("")} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* NL Query Hint */}
                  <AnimatePresence>
                    {showNLHint && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="flex items-center gap-2 px-4 py-2 bg-esg-bg-accent">
                          <Sparkles size={12} className="text-esg-primary" />
                          <span className="text-[11px] text-esg-primary font-medium">AI-powered natural language search detected</span>
                          <span className="text-[10px] text-muted-foreground">— results will include intelligent ESG insights</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Advanced Filters Panel */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="px-4 py-3 space-y-2.5 bg-muted/30">
                          {["ESG Category", "Risk Level", "Year", "Region"].map(group => (
                            <div key={group} className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-20 shrink-0">{group}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {FILTER_CHIPS.filter(c => c.group === group).map(chip => (
                                  <button
                                    key={chip.id}
                                    onClick={() => toggleFilter(chip.id)}
                                    className={`group/chip relative flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                                      activeFilters.includes(chip.id)
                                        ? "bg-esg-primary text-primary-foreground shadow-sm"
                                        : "border border-border bg-card text-muted-foreground hover:border-esg-primary/40 hover:text-foreground"
                                    }`}
                                  >
                                    {chip.label}
                                    <button
                                      onClick={e => { e.stopPropagation(); handlePinFilter(chip.id); }}
                                      className={`ml-0.5 transition-opacity ${pinnedFilterIds.includes(chip.id) ? "opacity-100" : "opacity-0 group-hover/chip:opacity-60"}`}
                                    >
                                      <Pin size={8} className={pinnedFilterIds.includes(chip.id) ? "text-esg-primary fill-current" : ""} />
                                    </button>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          {activeFilters.length > 0 && (
                            <div className="flex justify-end">
                              <button
                                onClick={() => setActiveFilters([])}
                                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                              >
                                Clear all filters
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-0.5 border-b border-border px-3 py-1.5 bg-muted/20">
                  {CATEGORY_FILTERS.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                        category === cat.key
                          ? "bg-esg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <cat.icon size={11} />
                      {cat.label}
                      {hasQuery && cat.key !== "all" && (
                        <span className={`rounded-full px-1.5 text-[9px] ${category === cat.key ? "bg-primary-foreground/20" : "bg-muted"}`}>
                          {cat.key === "pages" ? filteredNav.length :
                           cat.key === "metrics" ? filteredMetrics.length :
                           cat.key === "reports" ? 0 :
                           cat.key === "help" ? filteredHelp.length :
                           cat.key === "actions" ? filteredActions.length : 0}
                        </span>
                      )}
                    </button>
                  ))}
                  {hasQuery && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {totalResults} result{totalResults !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Results */}
                <ScrollArea className="max-h-[420px]">
                  <div className="py-1">
                    {/* Empty State */}
                    {hasQuery && totalResults === 0 && (
                      <div className="flex flex-col items-center gap-3 py-10">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <Search size={22} className="text-muted-foreground/30" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">No results for "{query}"</p>
                          <p className="mt-1 text-xs text-muted-foreground">Try different keywords or adjust filters</p>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                          {NL_SUGGESTIONS.slice(0, 2).map(s => (
                            <button
                              key={s}
                              onClick={() => setQuery(s)}
                              className="rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground hover:border-esg-primary/30 hover:text-foreground transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pinned Filters — idle */}
                    {!hasQuery && pinnedFilterIds.length > 0 && (
                      <div className="px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Pin size={10} className="text-esg-primary" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pinned Filters</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {pinnedFilterIds.map(id => {
                            const chip = FILTER_CHIPS.find(c => c.id === id);
                            if (!chip) return null;
                            return (
                              <button
                                key={id}
                                onClick={() => { toggleFilter(id); }}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                                  activeFilters.includes(id)
                                    ? "bg-esg-primary text-primary-foreground"
                                    : "border border-esg-primary/30 text-esg-primary hover:bg-esg-primary/10"
                                }`}
                              >
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Saved Queries — idle */}
                    {!hasQuery && savedQueries.length > 0 && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Bookmark size={10} className="text-esg-primary" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Saved Queries</span>
                        </div>
                        <div className="space-y-0.5">
                          {savedQueries.slice(0, 4).map((sq, i) => (
                            <div
                              key={i}
                              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => setQuery(sq)}
                            >
                              <Bookmark size={12} className="text-esg-primary/60 shrink-0" />
                              <span className="flex-1 text-foreground text-[13px]">{sq}</span>
                              <button
                                onClick={e => { e.stopPropagation(); handleRemoveSavedQuery(sq); }}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Searches — idle */}
                    {!hasQuery && history.length > 0 && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-muted-foreground" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent</span>
                          </div>
                          <button onClick={handleClearHistory} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Clear</button>
                        </div>
                        <div className="space-y-0.5">
                          {history.slice(0, 5).map((term, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => setQuery(term)}
                            >
                              <Clock size={12} className="text-muted-foreground/40 shrink-0" />
                              <span className="flex-1 text-foreground text-[13px]">{term}</span>
                              <ArrowUpRight size={10} className="text-muted-foreground/30" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending — idle */}
                    {!hasQuery && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Flame size={10} className="text-destructive" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Trending</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {TRENDING_SEARCHES.map(term => (
                            <button
                              key={term}
                              onClick={() => setQuery(term)}
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-esg-primary/30 hover:bg-esg-primary/5 hover:text-foreground"
                            >
                              <TrendingUp size={9} />
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NL Suggestions — idle */}
                    {!hasQuery && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles size={10} className="text-esg-primary" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Try asking</span>
                        </div>
                        <div className="space-y-0.5">
                          {NL_SUGGESTIONS.map(s => (
                            <div
                              key={s}
                              onClick={() => setQuery(s)}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-esg-bg-accent cursor-pointer transition-colors"
                            >
                              <Sparkles size={11} className="text-esg-primary/60 shrink-0" />
                              <span className="text-[12px] text-muted-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ESG Quick Actions — idle */}
                    {!hasQuery && (category === "all" || category === "actions") && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap size={10} className="text-accent" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {QUICK_ACTIONS.slice(0, 3).map(a => (
                            <button
                              key={a.id}
                              onClick={() => { setOpen(false); }}
                              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center transition-all hover:border-esg-primary/30 hover:shadow-sm"
                            >
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${pillarBg(a.pillar)}`}>
                                <a.icon size={14} className={pillarColor(a.pillar)} />
                              </div>
                              <span className="text-[11px] font-medium text-foreground leading-tight">{a.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* === SEARCH RESULTS === */}

                    {/* ESG Metrics */}
                    {filteredMetrics.length > 0 && (hasQuery || category === "metrics") && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Activity size={10} className="text-esg-primary" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ESG Metrics</span>
                          <span className="ml-1 rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">{filteredMetrics.length}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {filteredMetrics.map(m => (
                            <div
                              key={m.id}
                              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-esg-primary/30 hover:shadow-sm cursor-pointer"
                              onClick={() => navigate(m.pillar, m.label)}
                            >
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${pillarBg(m.pillar)}`}>
                                {m.pillar === "environment" ? <Leaf size={14} className={pillarColor(m.pillar)} /> :
                                 m.pillar === "social" ? <UserCheck size={14} className={pillarColor(m.pillar)} /> :
                                 <Scale size={14} className={pillarColor(m.pillar)} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-muted-foreground truncate">{m.label}</span>
                                  <span className={`text-[10px] font-medium ${trendColor(m.trend, m.label.includes("Emission") || m.label.includes("Gap") || m.label.includes("Water"))}`}>
                                    {trendIcon(m.trend)} {m.trendValue}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-base font-bold text-foreground font-display">{m.value}</span>
                                  <span className="text-[10px] text-muted-foreground">{m.unit}</span>
                                </div>
                                {m.score !== undefined && (
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                                      <div className={`h-full rounded-full ${scoreColor(m.score)} transition-all`} style={{ width: `${m.score}%` }} />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground">{m.score}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pages */}
                    {filteredNav.length > 0 && (hasQuery || category === "pages") && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Home size={10} className="text-esg-primary" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pages</span>
                          <span className="ml-1 rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">{filteredNav.length}</span>
                        </div>
                        <div className="space-y-0.5">
                          {filteredNav.map(item => (
                            <div
                              key={item.key}
                              className="group flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => { saveSearchTerm(item.label); navigate(item.key); }}
                            >
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${pillarBg(item.pillar)}`}>
                                <item.icon size={14} className={pillarColor(item.pillar)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                                <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                              </div>
                              {item.pillar && (
                                <Badge variant="outline" className={`text-[9px] border-none ${pillarBg(item.pillar)} ${pillarColor(item.pillar)} px-1.5 py-0.5`}>
                                  {item.pillar.charAt(0).toUpperCase() + item.pillar.slice(1, 3)}
                                </Badge>
                              )}
                              <ArrowRight size={12} className="text-muted-foreground/30 group-hover:text-esg-primary transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Help Articles */}
                    {filteredHelp.length > 0 && (hasQuery || category === "help") && (
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BookOpen size={10} className="text-esg-gov" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Help Articles</span>
                          <span className="ml-1 rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">{filteredHelp.length}</span>
                        </div>
                        <div className="space-y-0.5">
                          {filteredHelp.map(article => (
                            <div
                              key={article.id}
                              className="group flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => { saveSearchTerm(article.label); navigate("help"); }}
                            >
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${pillarBg(article.pillar)}`}>
                                <BookOpen size={14} className={pillarColor(article.pillar)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-foreground">{article.label}</span>
                                <p className="text-[11px] text-muted-foreground truncate">{article.desc}</p>
                              </div>
                              <ArrowUpRight size={12} className="text-muted-foreground/30 group-hover:text-esg-primary transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions (results) */}
                    {filteredActions.length > 0 && hasQuery && (
                      <div className="px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Zap size={10} className="text-accent" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</span>
                          <span className="ml-1 rounded-full bg-muted px-1.5 text-[9px] text-muted-foreground">{filteredActions.length}</span>
                        </div>
                        <div className="space-y-0.5">
                          {filteredActions.map(action => (
                            <div
                              key={action.id}
                              className="group flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => { saveSearchTerm(action.label); setOpen(false); }}
                            >
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${pillarBg(action.pillar)}`}>
                                <action.icon size={14} className={pillarColor(action.pillar)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-foreground">{action.label}</span>
                                <p className="text-[11px] text-muted-foreground truncate">{action.desc}</p>
                              </div>
                              <Zap size={11} className="text-accent/50" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/20">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[9px]">↑↓</kbd> navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[9px]">↵</kbd> open
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[9px]">esc</kbd> close
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Leaf size={10} className="text-esg-primary" />
                    ESG Intelligence Search
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
