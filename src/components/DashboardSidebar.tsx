import { useState, useEffect, useRef } from "react";
import { Home, Leaf, Users, Building2, ShoppingBag, Settings, FileText, Shield, BarChart3, Target, HelpCircle, ChevronDown, ChevronRight, Plus, Link2, PieChart, Droplets, Trash2, Zap, Eye, LogOut, GitBranch, Gamepad2, Trophy, Flame, Award, UsersRound, Gift, Sparkles, User } from "lucide-react";
import { useSidebarTheme, sidebarThemes } from "@/components/SidebarThemeProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  icon: typeof Home;
  label: string;
  key: string;
  badge?: number;
  children?: { label: string; key: string; icon?: typeof Home }[];
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", key: "home" },
  {
    icon: Leaf, label: "Environment", key: "environment",
    children: [
      { label: "Dashboard", key: "environment", icon: PieChart },
      { label: "Scope 1", key: "environment", icon: Zap },
      { label: "Scope 2", key: "environment", icon: Zap },
      { label: "Scope 3", key: "environment", icon: Zap },
      { label: "Water", key: "environment", icon: Droplets },
      { label: "Waste", key: "environment", icon: Trash2 },
      { label: "Analytics", key: "environment", icon: BarChart3 },
      { label: "Detailed View", key: "environment", icon: Eye },
      { label: "Workflow", key: "workflow", icon: GitBranch },
    ],
  },
  {
    icon: Users, label: "Social", key: "social",
    children: [
      { label: "Workforce", key: "social", icon: Users },
      { label: "Community", key: "social", icon: Users },
    ],
  },
  { icon: Building2, label: "Governance", key: "governance" },
  { icon: Shield, label: "Customers", key: "customers" },
  { icon: ShoppingBag, label: "Products", key: "products" },
  { icon: BarChart3, label: "Operations", key: "operations" },
  { icon: Target, label: "Goals", key: "goals" },
  { icon: FileText, label: "Docs Hub", key: "docs" },
  { icon: Settings, label: "Admin", key: "admin" },
  {
    icon: Gamepad2, label: "Games", key: "play",
    children: [
      { label: "Play Hub", key: "play", icon: Sparkles },
      { label: "🚗 Eco Drive", key: "play-ecodrive", icon: Zap },
      { label: "🥊 Power Punch", key: "play-boxing", icon: Flame },
      { label: "⚔️ Versus (1v1)", key: "play-versus", icon: UsersRound },
      { label: "Daily Actions", key: "play-actions", icon: Flame },
      { label: "Challenges", key: "play-challenges", icon: Target },
      { label: "Leaderboard", key: "play-leaderboard", icon: Trophy },
      { label: "Teams", key: "play-teams", icon: UsersRound },
      { label: "Badges", key: "play-badges", icon: Award },
      { label: "Rewards", key: "play-rewards", icon: Gift },
      { label: "Profile", key: "play-profile", icon: User },
    ],
  },
];

const bottomItems: NavItem[] = [
  { icon: Settings, label: "Settings", key: "settings" },
  { icon: HelpCircle, label: "Help", key: "help" },
];

interface DashboardSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
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
    <motion.button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
        transition-[background-color,color,border-color] duration-200 ease-out
        motion-reduce:transition-none"
      style={{
        backgroundColor: isActive ? t.activeBg : "transparent",
        color: isActive ? t.activeText : t.text,
        borderLeft: isActive ? `2px solid ${t.accentColor}` : "2px solid transparent",
        paddingLeft: indent ? "2rem" : undefined,
        fontSize: indent ? "0.8rem" : undefined,
        opacity: indent ? 0.85 : 1,
      }}
      whileHover={{ x: 2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.hoverBg; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {Icon && (
        <motion.span
          className="inline-flex shrink-0"
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Icon size={indent ? 14 : 18} />
        </motion.span>
      )}
      {!Icon && indent && <span className="w-[14px]" />}
      {item.label}
      {isActive && (
        <motion.span
          className="absolute left-0 top-1/2 h-4 w-0.5 rounded-full -translate-y-1/2"
          style={{ backgroundColor: t.accentColor }}
          layoutId="nav-active-indicator"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </motion.button>
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
          const isActive = activeView === item.key && !hasChildren;
          return (
            <div key={item.key + item.label}>
              <motion.button
                onClick={() => hasChildren ? toggle(item.key) : onViewChange(item.key)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-[background-color,color,border-color] duration-200 ease-out motion-reduce:transition-none"
                style={{
                  backgroundColor: isActive ? t.activeBg : "transparent",
                  color: isActive ? t.activeText : t.text,
                  borderLeft: isActive ? `2px solid ${t.accentColor}` : "2px solid transparent",
                }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.hoverBg; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <motion.span
                  className="inline-flex shrink-0"
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <item.icon size={18} />
                </motion.span>
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  <motion.span
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown size={14} style={{ color: t.text, opacity: 0.5 }} />
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence initial={false}>
                {hasChildren && isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    {item.children!.map((child, i) => (
                      <motion.div
                        key={child.label + i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                      >
                        <NavButton item={child} isActive={false} t={t} onClick={() => onViewChange(child.key)} indent />
                      </motion.div>
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
                <motion.button
                  key={child.label + i}
                  onClick={() => onViewChange(child.key)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs
                    transition-[background-color,opacity] duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    paddingLeft: "2.5rem",
                    color: t.text,
                    opacity: 0.65,
                  }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.backgroundColor = t.hoverBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.65"; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <motion.span
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: t.text, opacity: 0.4 }}
                    whileHover={{ scale: 1.5 }}
                  />
                  {child.label}
                </motion.button>
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
      <motion.div
        className="flex flex-col h-full motion-reduce:transition-none"
        animate={{ width: hovered ? "14rem" : "4rem" }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="mb-6 px-3 flex items-center gap-2 min-h-[2rem] overflow-hidden">
          <motion.span
            className="h-5 w-5 rounded-md shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: t.logoAccent, color: t.activeBg }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            O
          </motion.span>
          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-sm font-bold whitespace-nowrap"
                style={{ color: t.text }}
              >
                only<span style={{ color: t.logoAccent }}>good</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 overflow-y-auto">
          {allItems.map((item, idx) => {
            const isActive = activeView === item.key;
            const isBottom = idx >= navItems.length;
            const btn = (
              <motion.button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5
                  transition-[background-color,color] duration-200 ease-out motion-reduce:transition-none"
                style={{
                  backgroundColor: isActive ? t.activeBg : "transparent",
                  color: isActive ? t.activeText : t.text,
                  justifyContent: hovered ? "flex-start" : "center",
                  borderTop: isBottom && idx === navItems.length ? `1px solid ${t.borderColor}` : undefined,
                  marginTop: isBottom && idx === navItems.length ? "0.5rem" : undefined,
                  paddingTop: isBottom && idx === navItems.length ? "0.75rem" : undefined,
                }}
                whileHover={{ x: hovered ? 2 : 0 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.hoverBg; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <motion.span
                  className="inline-flex shrink-0"
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <item.icon size={18} />
                </motion.span>
                <AnimatePresence>
                  {hovered && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
            if (!hovered) {
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </nav>
      </motion.div>
    </TooltipProvider>
  );
}

// ─── THEMED COLLAPSIBLE LAYOUT (used by green-solid & purple-gradient) ───
const themedColors = {
  "green-solid": {
    bg: "hsl(145 60% 32%)",
    gradient: "hsl(145 60% 32%)",
    text: "hsla(0, 0%, 100%, 0.85)",
    activeText: "hsl(0 0% 100%)",
    activeBg: "hsl(145 55% 26%)",
    hoverBg: "hsla(145, 50%, 28%, 1)",
    borderColor: "hsla(145, 40%, 40%, 0.3)",
    accentColor: "hsl(145 60% 42%)",
    logoAccent: "hsl(0 0% 100%)",
    ctaBg: "hsl(145 55% 26%)",
    ctaText: "hsl(0 0% 100%)",
    sectionHeader: "hsla(0, 0%, 100%, 0.5)",
  },
  "purple-gradient": {
    bg: "linear-gradient(180deg, hsl(270 40% 35%), hsl(270 45% 20%))",
    gradient: "linear-gradient(180deg, hsl(270 40% 35%), hsl(270 45% 20%))",
    text: "hsla(0, 0%, 100%, 0.75)",
    activeText: "hsl(0 0% 100%)",
    activeBg: "hsl(25 90% 55%)",
    hoverBg: "hsla(270, 35%, 40%, 1)",
    borderColor: "hsla(270, 30%, 45%, 0.3)",
    accentColor: "hsl(25 90% 55%)",
    logoAccent: "hsl(25 90% 55%)",
    ctaBg: "linear-gradient(135deg, hsl(270 40% 45%), hsl(270 50% 35%))",
    ctaText: "hsl(0 0% 100%)",
    sectionHeader: "hsla(0, 0%, 100%, 0.45)",
  },
};

function ThemedCollapsibleLayout({ activeView, onViewChange, variant }: { activeView: string; onViewChange: (v: string) => void; variant: "green-solid" | "purple-gradient" }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));
  const c = themedColors[variant];

  return (
    <aside className="hidden h-screen w-60 flex-col py-5 md:flex" style={{ background: c.gradient }}>
      {/* Logo */}
      <div className="mb-6 px-5 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: c.logoAccent, color: variant === "green-solid" ? c.bg : "hsl(270 40% 25%)" }}>
          OG
        </div>
        <h1 className="text-base font-bold tracking-tight" style={{ color: c.activeText }}>
          only<span style={{ color: c.logoAccent, opacity: variant === "green-solid" ? 0.9 : 1 }}>good</span>
        </h1>
      </div>

      {/* Section header */}
      <div className="px-5 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: c.sectionHeader }}>
          Navigation
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const hasChildren = !!item.children?.length;
          const isOpen = expanded[item.key];
          const isActive = activeView === item.key && !hasChildren;

          return (
            <div key={item.key + item.label}>
              <motion.button
                onClick={() => hasChildren ? toggle(item.key) : onViewChange(item.key)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                  transition-[background-color,color] duration-200 ease-out motion-reduce:transition-none"
                style={{
                  backgroundColor: isActive ? c.activeBg : "transparent",
                  color: isActive ? c.activeText : c.text,
                }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = c.hoverBg; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <motion.span
                  className="inline-flex shrink-0"
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <item.icon size={17} style={{ opacity: isActive ? 1 : 0.8 }} />
                </motion.span>
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  <motion.span
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence initial={false}>
                {hasChildren && isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    {item.children!.map((child, i) => (
                      <motion.button
                        key={child.label + i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        onClick={() => onViewChange(child.key)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs
                          transition-[background-color,opacity] duration-200 ease-out motion-reduce:transition-none"
                        style={{ paddingLeft: "2.5rem", color: c.text, opacity: 0.75 }}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.backgroundColor = c.hoverBg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <motion.span
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: c.text, opacity: 0.4 }}
                          whileHover={{ scale: 1.5 }}
                        />
                        {child.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pt-3" style={{ borderTop: `1px solid ${c.borderColor}` }}>
        {bottomItems.map((item) => {
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive ? c.activeBg : "transparent",
                color: isActive ? c.activeText : c.text,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = c.hoverBg; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <item.icon size={17} style={{ opacity: isActive ? 1 : 0.8 }} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* User avatar */}
      <div className="px-4 pt-3 mt-2" style={{ borderTop: `1px solid ${c.borderColor}` }}>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: c.accentColor, color: c.activeText }}>
            DU
          </div>
          <span className="text-xs font-medium" style={{ color: c.text }}>Demo User</span>
        </div>
      </div>
    </aside>
  );
}

// ─── DRAWER LAYOUT (icon strip + sliding submenu panel) ───
function DrawerLayout({ activeView, onViewChange }: { activeView: string; onViewChange: (v: string) => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const allIconItems = [...navItems, ...bottomItems];

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpenSection(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleIconClick = (item: NavItem) => {
    if (item.children?.length) {
      setOpenSection(openSection === item.key ? null : item.key);
    } else {
      setOpenSection(null);
      onViewChange(item.key);
    }
  };

  const activeSection = allIconItems.find((i) => i.key === openSection);

  return (
    <div ref={drawerRef} className="flex h-screen relative" style={{ zIndex: 40 }}>
      {/* Icon Strip */}
      <div
        className="flex h-full w-14 flex-col items-center py-4 shrink-0"
        style={{ backgroundColor: "hsl(0 0% 100%)", borderRight: "1px solid hsl(0 0% 90%)" }}
      >
        {/* Logo */}
        <motion.div
          className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: "hsl(145 60% 36%)" }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Leaf size={18} style={{ color: "white" }} />
        </motion.div>

        {/* Main nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          <TooltipProvider delayDuration={200}>
            {navItems.map((item) => {
              const isActive = activeView === item.key || openSection === item.key;
              return (
                <Tooltip key={item.key + item.label}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleIconClick(item)}
                      className="relative flex h-10 w-10 items-center justify-center rounded-xl
                        transition-[background-color,color] duration-200 ease-out motion-reduce:transition-none"
                      style={{
                        backgroundColor: isActive ? "hsl(145 55% 92%)" : "transparent",
                        color: isActive ? "hsl(145 60% 32%)" : "hsl(220 10% 50%)",
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "hsl(0 0% 95%)"; } }}
                      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; } }}
                    >
                      <item.icon size={20} />
                      {item.badge && (
                        <motion.span
                          className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                          style={{ backgroundColor: "hsl(145 60% 36%)", color: "white" }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>

        {/* Bottom icons */}
        <div className="flex flex-col items-center gap-1 pt-2" style={{ borderTop: "1px solid hsl(0 0% 90%)" }}>
          <TooltipProvider delayDuration={200}>
            {/* Toggle for dark mode indicator */}
            <div className="mb-1 h-5 w-5 rounded-full" style={{ backgroundColor: "hsl(210 70% 50%)", border: "2px solid hsl(210 60% 70%)" }} />

            {bottomItems.map((item) => {
              const isActive = activeView === item.key;
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { setOpenSection(null); onViewChange(item.key); }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150"
                      style={{
                        backgroundColor: isActive ? "hsl(145 55% 92%)" : "transparent",
                        color: isActive ? "hsl(145 60% 32%)" : "hsl(220 10% 50%)",
                      }}
                      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "hsl(0 0% 95%)"; } }}
                      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; } }}
                    >
                      <item.icon size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}

            {/* User avatar */}
            <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: "hsl(145 60% 36%)", color: "white" }}>
              DU
            </div>

            {/* Logout */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150"
                  style={{ color: "hsl(220 10% 50%)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "hsl(0 0% 95%)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <LogOut size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Sliding Submenu Drawer */}
      <AnimatePresence>
        {activeSection && activeSection.children && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="h-full overflow-hidden shrink-0"
            style={{ backgroundColor: "hsl(145 60% 36%)" }}
          >
            <div className="flex h-full w-[220px] flex-col py-5">
              {/* Section header */}
              <div className="px-5 mb-1">
                <h2 className="text-base font-bold" style={{ color: "white" }}>{activeSection.label}</h2>
              </div>

              {/* Divider */}
              <div className="mx-5 my-3 h-px" style={{ backgroundColor: "hsla(0, 0%, 100%, 0.2)" }} />

              {/* Submenu items */}
              <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
                {activeSection.children!.map((child, i) => {
                  const ChildIcon = child.icon;
                  const isChildActive = i === 0; // First item active by default for demo
                  return (
                    <motion.button
                      key={child.label + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      onClick={() => { onViewChange(child.key); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                        transition-[background-color,color] duration-200 ease-out motion-reduce:transition-none"
                      style={{
                        backgroundColor: isChildActive ? "hsla(0, 0%, 100%, 0.15)" : "transparent",
                        color: isChildActive ? "white" : "hsla(0, 0%, 100%, 0.8)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChildActive) {
                          e.currentTarget.style.backgroundColor = "hsla(0, 0%, 100%, 0.1)";
                          e.currentTarget.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isChildActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "hsla(0, 0%, 100%, 0.8)";
                        }
                      }}
                    >
                      {ChildIcon && <ChildIcon size={16} />}
                      {child.label}
                      {child.label === "Dashboard" && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold"
                          style={{ backgroundColor: "hsla(0, 0%, 100%, 0.2)", color: "white" }}>
                          1
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="mx-5 my-3 h-px" style={{ backgroundColor: "hsla(0, 0%, 100%, 0.2)" }} />

              {/* CTA Button */}
              <div className="px-3">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: "hsl(145 55% 28%)",
                    color: "white",
                    border: "1px solid hsla(0, 0%, 100%, 0.15)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "hsl(145 50% 24%)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "hsl(145 55% 28%)"; }}
                >
                  <Plus size={16} />
                  Add New Data
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarInner({ activeView, onViewChange, onAfterNavigate }: { activeView: string; onViewChange: (v: string) => void; onAfterNavigate?: () => void }) {
  const { sidebarTheme, sidebarLayout } = useSidebarTheme();
  const t = sidebarThemes[sidebarTheme];

  const handleViewChange = (v: string) => {
    onViewChange(v);
    onAfterNavigate?.();
  };

  if (sidebarLayout === "drawer") {
    return <DrawerLayout activeView={activeView} onViewChange={handleViewChange} />;
  }

  if (sidebarLayout === "green-solid" || sidebarLayout === "purple-gradient") {
    return <ThemedCollapsibleLayout activeView={activeView} onViewChange={handleViewChange} variant={sidebarLayout} />;
  }

  if (sidebarLayout === "compact") {
    return (
      <div className="flex h-full flex-col py-6" style={{ background: t.gradient }}>
        <CompactLayout activeView={activeView} onViewChange={handleViewChange} t={t} />
      </div>
    );
  }

  const LayoutComponent = sidebarLayout === "collapsible" ? CollapsibleLayout
    : sidebarLayout === "icon-based" ? IconBasedLayout
    : DefaultLayout;

  return (
    <div className="flex h-full w-full flex-col py-6" style={{ background: t.gradient }}>
      <div className="mb-8 px-6 flex items-center gap-2">
        <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: t.text }}>
          only<span style={{ color: t.logoAccent }} className="neon-text">good</span>
        </h1>
        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: t.liveDot }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.liveDot }} />
          Live
        </span>
      </div>
      <LayoutComponent activeView={activeView} onViewChange={handleViewChange} t={t} />
    </div>
  );
}

export default function DashboardSidebar({ activeView, onViewChange, mobileOpen, onMobileOpenChange }: DashboardSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={!!mobileOpen} onOpenChange={(o) => onMobileOpenChange?.(o)}>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-border [&>button]:z-50">
          <SidebarInner
            activeView={activeView}
            onViewChange={onViewChange}
            onAfterNavigate={() => onMobileOpenChange?.(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop — keep existing widths/visibility
  const { sidebarLayout } = useSidebarTheme();
  const widthClass = sidebarLayout === "compact" ? "" : sidebarLayout === "drawer" ? "" : "w-60";
  return (
    <aside className={`hidden h-screen flex-col md:flex shrink-0 ${widthClass}`}>
      <SidebarInner activeView={activeView} onViewChange={onViewChange} />
    </aside>
  );
}
