import { Home, Leaf, Users, Building2, ShoppingBag, Settings, FileText, Shield, BarChart3, Target, HelpCircle } from "lucide-react";
import { useSidebarTheme, sidebarThemes } from "@/components/SidebarThemeProvider";

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
  const { sidebarTheme } = useSidebarTheme();
  const t = sidebarThemes[sidebarTheme];

  return (
    <aside
      className="hidden h-screen w-60 flex-col py-6 md:flex"
      style={{ background: t.gradient }}
    >
      <div className="mb-8 px-6 flex items-center gap-2">
        <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: t.text }}>
          only<span style={{ color: t.logoAccent }} className="neon-text">good</span>
        </h1>
        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: t.liveDot }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.liveDot }} />
          Live
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? t.activeBg : "transparent",
                color: isActive ? t.activeText : t.text,
                borderLeft: isActive ? `2px solid ${t.accentColor}` : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = t.hoverBg;
                  e.currentTarget.style.color = t.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = t.text;
                }
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pt-3" style={{ borderTop: `1px solid ${t.borderColor}` }}>
        <button
          onClick={() => onViewChange("settings")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: activeView === "settings" ? t.activeBg : "transparent",
            color: activeView === "settings" ? t.activeText : t.text,
            borderLeft: activeView === "settings" ? `2px solid ${t.accentColor}` : "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (activeView !== "settings") {
              e.currentTarget.style.backgroundColor = t.hoverBg;
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== "settings") {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          <Settings size={18} />
          Settings
        </button>
        <button
          onClick={() => onViewChange("help")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
          style={{
            backgroundColor: activeView === "help" ? t.activeBg : "transparent",
            color: activeView === "help" ? t.activeText : t.text,
            borderLeft: activeView === "help" ? `2px solid ${t.accentColor}` : "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (activeView !== "help") {
              e.currentTarget.style.backgroundColor = t.hoverBg;
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== "help") {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          <HelpCircle size={18} />
          Help
        </button>
      </div>
    </aside>
  );
}
