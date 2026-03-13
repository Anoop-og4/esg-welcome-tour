import { Home, Leaf, Users, Building2, ShoppingBag, Settings, FileText, Shield, BarChart3, Target, HelpCircle } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", key: "home" },
  { icon: Leaf, label: "Environment", key: "environment" },
  { icon: Users, label: "Social", key: "social" },
  { icon: Building2, label: "Governance", key: "governance" },
  { icon: Shield, label: "Customers", key: "customers" },
  { icon: ShoppingBag, label: "Products", key: "products" },
  { icon: BarChart3, label: "Operations", key: "operations" },
  { icon: Target, label: "Goals", key: "goals" },
  { icon: FileText, label: "Docs Hub", key: "docs" },
  { icon: Settings, label: "Admin", key: "admin" },
];

interface DashboardSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function DashboardSidebar({ activeView, onViewChange }: DashboardSidebarProps) {
  return (
    <aside
      className="hidden h-screen w-60 flex-col py-6 md:flex"
      style={{ background: "var(--gradient-sidebar)" }}
    >
      <div className="mb-8 px-6 flex items-center gap-2">
        <h1 className="font-display text-xl font-bold text-sidebar-foreground tracking-tight">
          only<span className="text-primary neon-text">good</span>
        </h1>
        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-glow-sm" />
          Live
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeView === item.key
                ? "bg-sidebar-accent text-primary border-l-2 border-primary shadow-glow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <item.icon size={18} className={activeView === item.key ? "drop-shadow-[0_0_6px_hsl(142_70%_45%/0.5)]" : ""} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 pt-3">
        <button
          onClick={() => onViewChange("help")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            activeView === "help"
              ? "bg-sidebar-accent text-primary border-l-2 border-primary shadow-glow-sm"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          }`}
        >
          <HelpCircle size={18} />
          Help
        </button>
      </div>
    </aside>
  );
}
