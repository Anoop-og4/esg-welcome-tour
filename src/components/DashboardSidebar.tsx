import { Home, Leaf, Users, Building2, ShoppingBag, Settings, FileText, Shield, BarChart3, Target } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", active: false },
  { icon: Leaf, label: "Environment", active: true },
  { icon: Users, label: "Social", active: false },
  { icon: Building2, label: "Governance", active: false },
  { icon: Shield, label: "Customers", active: false },
  { icon: ShoppingBag, label: "Products", active: false },
  { icon: BarChart3, label: "Operations", active: false },
  { icon: Target, label: "Goals", active: false },
  { icon: FileText, label: "Docs Hub", active: false },
  { icon: Settings, label: "Admin", active: false },
];

export default function DashboardSidebar() {
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
            key={item.label}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              item.active
                ? "bg-sidebar-accent text-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
