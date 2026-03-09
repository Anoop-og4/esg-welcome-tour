import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";

interface GlobalSearchProps {
  onNavigate: (view: string) => void;
}

interface SearchResult {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  group: "navigation" | "help" | "actions" | "insights";
  action: () => void;
}

const NAV_ITEMS = [
  { icon: Home, label: "Home", key: "home", desc: "Go to home dashboard" },
  { icon: Leaf, label: "Environment", key: "environment", desc: "View environment metrics and emissions" },
  { icon: Users, label: "Social", key: "social", desc: "Social metrics and workforce data" },
  { icon: Building2, label: "Governance", key: "governance", desc: "Governance policies and compliance" },
  { icon: Shield, label: "Customers", key: "customers", desc: "Customer satisfaction and engagement" },
  { icon: ShoppingBag, label: "Products", key: "products", desc: "Product lifecycle and materials" },
  { icon: BarChart3, label: "Operations", key: "operations", desc: "Processes, materials, and production" },
  { icon: Target, label: "Goals", key: "goals", desc: "Carbon reduction targets and progress" },
  { icon: FileText, label: "Docs Hub", key: "docs", desc: "Documentation and report templates" },
  { icon: Settings, label: "Admin", key: "admin", desc: "Admin settings and help studio" },
  { icon: HelpCircle, label: "Help Center", key: "help", desc: "Guides, FAQ, and tutorials" },
];

const HELP_ARTICLES = [
  { id: "h1", label: "Dashboard Overview", desc: "Key metrics, charts, and financial year selector", keywords: "emission carbon intensity green energy stats" },
  { id: "h2", label: "Using Filters", desc: "Filter by scope, facility, date range, and category", keywords: "filter scope facility date range" },
  { id: "h3", label: "Scope 1 Emissions", desc: "Direct emissions from owned sources", keywords: "scope 1 direct fuel combustion vehicles" },
  { id: "h4", label: "Scope 2 & 3 Emissions", desc: "Indirect and value chain emissions", keywords: "scope 2 3 indirect electricity purchased energy value chain" },
  { id: "h5", label: "Managing Processes", desc: "Define production processes and fuel requirements", keywords: "process map fuel electricity production" },
  { id: "h6", label: "Raw Materials & Products", desc: "Track materials and product lifecycle", keywords: "raw material product lifecycle tracking" },
  { id: "h7", label: "Creating Goals", desc: "Set carbon reduction targets with SBTi alignment", keywords: "goal target reduction sbti baseline" },
  { id: "h8", label: "Tracking Progress", desc: "Monitor goals and receive alerts", keywords: "progress track alert notification milestone" },
  { id: "h9", label: "Social Metrics", desc: "Diversity, equity, inclusion, and workforce data", keywords: "social diversity equity inclusion workforce dei" },
  { id: "h10", label: "Governance Overview", desc: "Board structure, policies, and compliance tracking", keywords: "governance board policy compliance audit" },
];

const QUICK_ACTIONS = [
  { id: "a1", label: "Export Report as PDF", desc: "Generate a downloadable emission report", icon: FileText },
  { id: "a2", label: "Add New Process", desc: "Define a new production process", icon: Zap },
  { id: "a3", label: "Create Reduction Goal", desc: "Set a new carbon reduction target", icon: Target },
  { id: "a4", label: "View YoY Trends", desc: "Compare year-over-year emission data", icon: TrendingUp },
];

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

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

  const navigate = useCallback(
    (view: string) => {
      onNavigate(view);
      setOpen(false);
    },
    [onNavigate]
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search anything…</span>
        <kbd className="pointer-events-none ml-2 hidden select-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, articles, actions…" />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search size={32} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No results found. Try a different keyword.</p>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Pages">
            {NAV_ITEMS.map((item) => (
              <CommandItem
                key={item.key}
                value={`${item.label} ${item.desc}`}
                onSelect={() => navigate(item.key)}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
                <ArrowRight size={14} className="ml-auto text-muted-foreground/50" />
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Help Articles">
            {HELP_ARTICLES.map((article) => (
              <CommandItem
                key={article.id}
                value={`${article.label} ${article.desc} ${article.keywords}`}
                onSelect={() => navigate("help")}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-info/10 text-info">
                  <BookOpen size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{article.label}</span>
                  <span className="text-xs text-muted-foreground">{article.desc}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            {QUICK_ACTIONS.map((action) => (
              <CommandItem
                key={action.id}
                value={`${action.label} ${action.desc}`}
                onSelect={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/20 text-accent-foreground">
                  <action.icon size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.desc}</span>
                </div>
                <Zap size={14} className="ml-auto text-accent" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
