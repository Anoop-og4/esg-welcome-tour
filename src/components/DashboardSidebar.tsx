import { useState } from "react";
import { Home, Leaf, Users, Building2, ShoppingBag, Settings, FileText, Shield, BarChart3, Target, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useSidebarTheme, sidebarThemes } from "@/components/SidebarThemeProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  icon: typeof Home;
  label: string;
  key: string;
  children?: { label: string; key: string }[];
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", key: "home" },
  {
    icon: Leaf, label: "Environment", key: "environment",
    children: [
      { label: "Emissions", key: "environment" },
      { label: "Water & Waste", key: "environment" },
    ],
  },
  {
    icon: Users, label: "Social", key: "social",
    children: [
      { label: "Workforce", key: "social" },
      { label: "Community", key: "social" },
    ],
  },
  { icon: Building2, label: "Governance", key: "governance" },
  { icon: Shield, label: "Customers", key: "customers" },
  { icon: ShoppingBag, label: "Products", key: "products" },
  { icon: BarChart3, label: "Operations", key: "operations" },
  { icon: Target, label: "Goals", key: "goals" },
  { icon: FileText, label: "Docs Hub", key: "docs" },
  { icon: Settings, label: "Admin", key: "admin" },
];

const bottomItems: NavItem[] = [
  { icon: Settings, label: "Settings", key: "settings" },
  { icon: HelpCircle, label: "Help", key: "help" },
];

interface DashboardSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

function NavButton({ item, isActive, t, onClick, indent = false }: {
  item: { icon?: typeof Home; label: string; key: string };
  isActive: boolean;
  t: typeof sidebarThemes["dark-intelligence"];
  onClick: () => void;
  indent?: boolean;
}) {
  const Icon = (item as NavItem).icon;
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
      style={{
        backgroundColor: isActive ? t.activeBg : "transparent",
        color: isActive ? t.activeText : t.text,
        borderLeft: isActive ? `2px solid ${t.accentColor}` : "2px solid transparent",
        paddingLeft: indent ? "2rem" : undefined,
        fontSize: indent ? "0.8rem" : undefined,
        opacity: indent ? 0.85 : 1,
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.hoverBg; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {Icon && <Icon size={indent ? 14 : 18} />}
      {!Icon && indent && <span className="w-[14px]" />}
      {item.label}
    </button>
  );
}

// ─── DEFAULT LAYOUT ───
function DefaultLayout({ activeView, onViewChange, t }: { activeView: string; onViewChange: (v: string) => void; t: typeof sidebarThemes["dark-intelligence"] }) {
  return (
    <>
      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.key + item.label}>
            <NavButton item={item} isActive={activeView === item.key && !item.children} t={t} onClick={() => onViewChange(item.key)} />
            {item.children?.map((child, i) => (
              <NavButton key={child.label + i} item={child} isActive={false} t={t} onClick={() => onViewChange(child.key)} indent />
            ))}
          </div>
        ))}
      </nav>
      <div className="px-3 pt-3" style={{ borderTop: `1px solid ${t.borderColor}` }}>
        {bottomItems.map((item) => (
          <NavButton key={item.key} item={item} isActive={activeView === item.key} t={t} onClick={() => onViewChange(item.key)} />
        ))}
      </div>
    </>
  );
}

// ─── COLLAPSIBLE LAYOUT ───
function CollapsibleLayout({ activeView, onViewChange, t }: { activeView: string; onViewChange: (v: string) => void; t: typeof sidebarThemes["dark-intelligence"] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  return (
    <>
      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const hasChildren = !!item.children?.length;
          const isOpen = expanded[item.key];
          return (
            <div key={item.key + item.label}>
              <button
                onClick={() => hasChildren ? toggle(item.key) : onViewChange(item.key)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeView === item.key && !hasChildren ? t.activeBg : "transparent",
                  color: activeView === item.key && !hasChildren ? t.activeText : t.text,
                  borderLeft: activeView === item.key && !hasChildren ? `2px solid ${t.accentColor}` : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (activeView !== item.key) e.currentTarget.style.backgroundColor = t.hoverBg; }}
                onMouseLeave={(e) => { if (activeView !== item.key) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} style={{ color: t.text, opacity: 0.5 }} />
                  </motion.span>
                )}
              </button>
              <AnimatePresence>
                {hasChildren && isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {item.children!.map((child, i) => (
                      <NavButton key={child.label + i} item={child} isActive={false} t={t} onClick={() => onViewChange(child.key)} indent />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
      <div className="px-3 pt-3" style={{ borderTop: `1px solid ${t.borderColor}` }}>
        {bottomItems.map((item) => (
          <NavButton key={item.key} item={item} isActive={activeView === item.key} t={t} onClick={() => onViewChange(item.key)} />
        ))}
      </div>
    </>
  );
}

// ─── ICON-BASED LAYOUT ───
function IconBasedLayout({ activeView, onViewChange, t }: { activeView: string; onViewChange: (v: string) => void; t: typeof sidebarThemes["dark-intelligence"] }) {
  return (
    <>
      <nav className="flex-1 px-3 overflow-y-auto">
        {navItems.map((item, idx) => {
          const prevHasChildren = idx > 0 && !!navItems[idx - 1].children?.length;
          return (
            <div key={item.key + item.label} style={{ marginTop: prevHasChildren ? "0.75rem" : "0.125rem" }}>
              <NavButton item={item} isActive={activeView === item.key} t={t} onClick={() => onViewChange(item.key)} />
              {item.children?.map((child, i) => (
                <button
                  key={child.label + i}
                  onClick={() => onViewChange(child.key)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all"
                  style={{
                    paddingLeft: "2.5rem",
                    color: t.text,
                    opacity: 0.65,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.backgroundColor = t.hoverBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.65"; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: t.text, opacity: 0.4 }} />
                  {child.label}
                </button>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="px-3 pt-3" style={{ borderTop: `1px solid ${t.borderColor}` }}>
        {bottomItems.map((item) => (
          <NavButton key={item.key} item={item} isActive={activeView === item.key} t={t} onClick={() => onViewChange(item.key)} />
        ))}
      </div>
    </>
  );
}

// ─── COMPACT / MINI LAYOUT ───
function CompactLayout({ activeView, onViewChange, t }: { activeView: string; onViewChange: (v: string) => void; t: typeof sidebarThemes["dark-intelligence"] }) {
  const [hovered, setHovered] = useState(false);
  const allItems = [...navItems, ...bottomItems];

  return (
    <TooltipProvider delayDuration={100}>
      <div
        className="flex flex-col h-full transition-all duration-300"
        style={{ width: hovered ? "14rem" : "4rem" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Logo */}
        <div className="mb-6 px-3 flex items-center gap-2 min-h-[2rem] overflow-hidden">
          <span className="h-5 w-5 rounded-md shrink-0 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: t.logoAccent, color: t.activeBg }}>
            O
          </span>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-bold whitespace-nowrap"
              style={{ color: t.text }}
            >
              only<span style={{ color: t.logoAccent }}>good</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 px-2 overflow-y-auto">
          {allItems.map((item, idx) => {
            const isActive = activeView === item.key;
            const isBottom = idx >= navItems.length;
            const btn = (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-all"
                style={{
                  backgroundColor: isActive ? t.activeBg : "transparent",
                  color: isActive ? t.activeText : t.text,
                  justifyContent: hovered ? "flex-start" : "center",
                  borderTop: isBottom && idx === navItems.length ? `1px solid ${t.borderColor}` : undefined,
                  marginTop: isBottom && idx === navItems.length ? "0.5rem" : undefined,
                  paddingTop: isBottom && idx === navItems.length ? "0.75rem" : undefined,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.hoverBg; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <item.icon size={18} className="shrink-0" />
                {hovered && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );

            if (!hovered) {
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}

export default function DashboardSidebar({ activeView, onViewChange }: DashboardSidebarProps) {
  const { sidebarTheme, sidebarLayout } = useSidebarTheme();
  const t = sidebarThemes[sidebarTheme];

  if (sidebarLayout === "compact") {
    return (
      <aside className="hidden h-screen flex-col py-6 md:flex" style={{ background: t.gradient }}>
        <CompactLayout activeView={activeView} onViewChange={onViewChange} t={t} />
      </aside>
    );
  }

  const LayoutComponent = sidebarLayout === "collapsible" ? CollapsibleLayout
    : sidebarLayout === "icon-based" ? IconBasedLayout
    : DefaultLayout;

  return (
    <aside className="hidden h-screen w-60 flex-col py-6 md:flex" style={{ background: t.gradient }}>
      <div className="mb-8 px-6 flex items-center gap-2">
        <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: t.text }}>
          only<span style={{ color: t.logoAccent }} className="neon-text">good</span>
        </h1>
        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: t.liveDot }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.liveDot }} />
          Live
        </span>
      </div>
      <LayoutComponent activeView={activeView} onViewChange={onViewChange} t={t} />
    </aside>
  );
}
