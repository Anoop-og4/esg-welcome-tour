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
      <div className="mb-8 px-6">
        <h1 className="font-display text-xl font-bold text-sidebar-foreground tracking-tight">
          only<span className="text-primary">good</span>
        </h1>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              activeView === item.key
                ? "bg-sidebar-accent text-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Help section at bottom */}
      <div className="border-t border-sidebar-border px-3 pt-3">
        <button
          onClick={() => onViewChange("help")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            activeView === "help"
              ? "bg-sidebar-accent text-primary"
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
