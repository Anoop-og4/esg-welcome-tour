import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home, Leaf, Users, Building2, ShoppingBag, Settings,
  FileText, Shield, BarChart3, Target, HelpCircle,
  Search, ArrowRight, Zap, BookOpen, TrendingUp,
  Clock, Star, Hash, Sparkles, X, ArrowUpRight,
  Flame, Command,
} from "lucide-react";

interface GlobalSearchProps {
  onNavigate: (view: string) => void;
}

type CategoryFilter = "all" | "pages" | "help" | "actions";

interface SearchResult {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  group: "pages" | "help" | "actions";
  keywords?: string;
  action: () => void;
  popularity?: number;
}

const STORAGE_KEY = "esg-search-history";
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSearchTerm(term: string) {
  const history = getSearchHistory().filter((t) => t !== term);
  history.unshift(term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

const CATEGORY_FILTERS: { key: CategoryFilter; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "pages", label: "Pages", icon: Hash },
  { key: "help", label: "Articles", icon: BookOpen },
  { key: "actions", label: "Actions", icon: Zap },
];

const NAV_ITEMS = [
  { icon: Home, label: "Home", key: "home", desc: "Go to home dashboard", popularity: 95 },
  { icon: Leaf, label: "Environment", key: "environment", desc: "View environment metrics and emissions", popularity: 90 },
  { icon: Users, label: "Social", key: "social", desc: "Social metrics and workforce data", popularity: 75 },
  { icon: Building2, label: "Governance", key: "governance", desc: "Governance policies and compliance", popularity: 70 },
  { icon: Shield, label: "Customers", key: "customers", desc: "Customer satisfaction and engagement", popularity: 60 },
  { icon: ShoppingBag, label: "Products", key: "products", desc: "Product lifecycle and materials", popularity: 55 },
  { icon: BarChart3, label: "Operations", key: "operations", desc: "Processes, materials, and production", popularity: 65 },
  { icon: Target, label: "Goals", key: "goals", desc: "Carbon reduction targets and progress", popularity: 80 },
  { icon: FileText, label: "Docs Hub", key: "docs", desc: "Documentation and report templates", popularity: 50 },
  { icon: Settings, label: "Admin", key: "admin", desc: "Admin settings and help studio", popularity: 40 },
  { icon: HelpCircle, label: "Help Center", key: "help", desc: "Guides, FAQ, and tutorials", popularity: 85 },
];

const HELP_ARTICLES = [
  { id: "h1", label: "Dashboard Overview", desc: "Key metrics, charts, and financial year selector", keywords: "emission carbon intensity green energy stats overview dashboard" },
  { id: "h2", label: "Using Filters", desc: "Filter by scope, facility, date range, and category", keywords: "filter scope facility date range category" },
  { id: "h3", label: "Scope 1 Emissions", desc: "Direct emissions from owned sources", keywords: "scope 1 direct fuel combustion vehicles fleet" },
  { id: "h4", label: "Scope 2 & 3 Emissions", desc: "Indirect and value chain emissions", keywords: "scope 2 3 indirect electricity purchased energy value chain supply" },
  { id: "h5", label: "Managing Processes", desc: "Define production processes and fuel requirements", keywords: "process map fuel electricity production manufacturing" },
  { id: "h6", label: "Raw Materials & Products", desc: "Track materials and product lifecycle", keywords: "raw material product lifecycle tracking inventory" },
  { id: "h7", label: "Creating Goals", desc: "Set carbon reduction targets with SBTi alignment", keywords: "goal target reduction sbti baseline net zero" },
  { id: "h8", label: "Tracking Progress", desc: "Monitor goals and receive alerts", keywords: "progress track alert notification milestone kpi" },
  { id: "h9", label: "Social Metrics", desc: "Diversity, equity, inclusion, and workforce data", keywords: "social diversity equity inclusion workforce dei hr" },
  { id: "h10", label: "Governance Overview", desc: "Board structure, policies, and compliance tracking", keywords: "governance board policy compliance audit regulation" },
];

const QUICK_ACTIONS = [
  { id: "a1", label: "Export Report as PDF", desc: "Generate a downloadable emission report", icon: FileText, keywords: "export download pdf report generate" },
  { id: "a2", label: "Add New Process", desc: "Define a new production process", icon: Zap, keywords: "add create new process production" },
  { id: "a3", label: "Create Reduction Goal", desc: "Set a new carbon reduction target", icon: Target, keywords: "create goal target reduction carbon" },
  { id: "a4", label: "View YoY Trends", desc: "Compare year-over-year emission data", icon: TrendingUp, keywords: "year trend compare yoy growth analysis" },
  { id: "a5", label: "Run Compliance Check", desc: "Verify regulatory alignment status", icon: Shield, keywords: "compliance check audit regulation verify" },
  { id: "a6", label: "Schedule Report", desc: "Set up automated report generation", icon: Clock, keywords: "schedule automate report recurring email" },
];

const TRENDING_SEARCHES = [
  "carbon emissions", "scope 1", "reduction goals", "compliance", "ESG report",
];

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory());
      setQuery("");
      setCategory("all");
    }
  }, [open]);

  const navigate = useCallback(
    (view: string, searchTerm?: string) => {
      if (searchTerm) saveSearchTerm(searchTerm);
      onNavigate(view);
      setOpen(false);
    },
    [onNavigate]
  );

  const handleSelect = useCallback(
    (label: string, action: () => void) => {
      if (query.trim()) saveSearchTerm(query.trim());
      action();
    },
    [query]
  );

  const hasQuery = query.trim().length > 0;

  const filteredNav = useMemo(() => {
    if (category !== "all" && category !== "pages") return [];
    return NAV_ITEMS;
  }, [category]);

  const filteredHelp = useMemo(() => {
    if (category !== "all" && category !== "help") return [];
    return HELP_ARTICLES;
  }, [category]);

  const filteredActions = useMemo(() => {
    if (category !== "all" && category !== "actions") return [];
    return QUICK_ACTIONS;
  }, [category]);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  const handleHistoryClick = useCallback((term: string) => {
    setQuery(term);
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="hidden sm:inline text-muted-foreground/80">Search anything…</span>
        <kbd className="pointer-events-none ml-3 hidden select-none items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <Command size={10} />K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-border px-3 py-2">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                category === cat.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <cat.icon size={12} />
              {cat.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="hidden md:inline">↑↓ navigate</span>
            <span className="hidden md:inline">↵ select</span>
            <span>esc close</span>
          </div>
        </div>

        <CommandInput
          ref={inputRef}
          placeholder={
            category === "pages" ? "Search pages…"
            : category === "help" ? "Search help articles…"
            : category === "actions" ? "Search actions…"
            : "Search pages, articles, actions…"
          }
          value={query}
          onValueChange={setQuery}
        />

        <CommandList className="max-h-[420px]">
          <CommandEmpty>
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search size={20} className="text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No results for "{query}"</p>
                <p className="mt-1 text-xs text-muted-foreground">Try different keywords or browse categories above</p>
              </div>
            </div>
          </CommandEmpty>

          {/* Recent Searches - only when no query */}
          {!hasQuery && history.length > 0 && (
            <CommandGroup heading={
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> Recent
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear
                </button>
              </div>
            }>
              {history.map((term, i) => (
                <CommandItem
                  key={`recent-${i}`}
                  value={`recent: ${term}`}
                  onSelect={() => handleHistoryClick(term)}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Clock size={14} className="shrink-0 text-muted-foreground/50" />
                  <span className="text-sm">{term}</span>
                  <ArrowUpRight size={12} className="ml-auto text-muted-foreground/30" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Trending - only when no query */}
          {!hasQuery && (category === "all" || category === "help") && (
            <>
              <CommandSeparator />
              <CommandGroup heading={
                <span className="flex items-center gap-1.5">
                  <Flame size={12} className="text-destructive" /> Trending
                </span>
              }>
                <div className="flex flex-wrap gap-1.5 px-2 py-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                    >
                      <TrendingUp size={10} />
                      {term}
                    </button>
                  ))}
                </div>
              </CommandGroup>
            </>
          )}

          {/* Starred / Popular Pages */}
          {!hasQuery && (category === "all" || category === "pages") && (
            <>
              <CommandSeparator />
              <CommandGroup heading={
                <span className="flex items-center gap-1.5">
                  <Star size={12} className="text-accent" /> Popular
                </span>
              }>
                {NAV_ITEMS
                  .filter(i => (i.popularity ?? 0) >= 80)
                  .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
                  .slice(0, 4)
                  .map((item) => (
                    <CommandItem
                      key={`pop-${item.key}`}
                      value={`popular: ${item.label} ${item.desc}`}
                      onSelect={() => handleSelect(item.label, () => navigate(item.key, item.label))}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="h-1 w-8 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${item.popularity}%` }} />
                        </div>
                        <ArrowRight size={12} className="text-muted-foreground/40" />
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}

          {/* Pages */}
          {filteredNav.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={
                <span className="flex items-center gap-1.5">
                  <Hash size={12} /> Pages
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{NAV_ITEMS.length}</span>
                </span>
              }>
                {filteredNav.map((item) => (
                  <CommandItem
                    key={item.key}
                    value={`${item.label} ${item.desc}`}
                    onSelect={() => handleSelect(item.label, () => navigate(item.key, item.label))}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                    </div>
                    <ArrowRight size={12} className="ml-auto text-muted-foreground/40" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Help Articles */}
          {filteredHelp.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={
                <span className="flex items-center gap-1.5">
                  <BookOpen size={12} /> Help Articles
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{HELP_ARTICLES.length}</span>
                </span>
              }>
                {filteredHelp.map((article) => (
                  <CommandItem
                    key={article.id}
                    value={`${article.label} ${article.desc} ${article.keywords}`}
                    onSelect={() => handleSelect(article.label, () => navigate("help", article.label))}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                      <BookOpen size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{article.label}</span>
                      <span className="text-[11px] text-muted-foreground">{article.desc}</span>
                    </div>
                    <ArrowUpRight size={12} className="ml-auto text-muted-foreground/40" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={
                <span className="flex items-center gap-1.5">
                  <Zap size={12} className="text-accent" /> Quick Actions
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{QUICK_ACTIONS.length}</span>
                </span>
              }>
                {filteredActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    value={`${action.label} ${action.desc} ${action.keywords}`}
                    onSelect={() => handleSelect(action.label, () => setOpen(false))}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                      <action.icon size={15} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{action.label}</span>
                      <span className="text-[11px] text-muted-foreground">{action.desc}</span>
                    </div>
                    <Zap size={12} className="ml-auto text-accent/60" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">Tab</kbd>
              switch category
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
              open
            </span>
          </div>
          <span className="flex items-center gap-1">
            Powered by <Sparkles size={10} className="text-primary" /> ESG Search
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
