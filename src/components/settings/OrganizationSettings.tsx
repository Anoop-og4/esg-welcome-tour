import { motion } from "framer-motion";
import { Settings, Check, Monitor, LayoutList } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { useSidebarTheme, sidebarThemes, SidebarTheme, sidebarLayouts, SidebarLayout } from "@/components/SidebarThemeProvider";

interface OrganizationSettingsProps {
  onNavigate: (view: string) => void;
}

const themeOrder: SidebarTheme[] = ["dark-intelligence", "light-green", "light-blue", "purple"];
const layoutOrder: SidebarLayout[] = ["default", "collapsible", "icon-based", "compact", "green-solid", "purple-gradient", "drawer"];

function SidebarPreviewCard({ theme, isActive, onClick }: { theme: SidebarTheme; isActive: boolean; onClick: () => void }) {
  const t = sidebarThemes[theme];

  return (
    <button
      onClick={onClick}
      className={`relative group rounded-xl border-2 p-1.5 transition-all duration-300 ${
        isActive
          ? "border-primary shadow-[0_0_20px_hsl(142_70%_45%/0.2)] scale-[1.02]"
          : "border-border/50 hover:border-border hover:shadow-md"
      }`}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Check size={14} strokeWidth={3} />
        </div>
      )}

      {/* Mini sidebar preview */}
      <div className="flex h-44 w-full overflow-hidden rounded-lg">
        {/* Sidebar preview */}
        <div
          className="w-16 flex flex-col gap-1.5 p-2 shrink-0"
          style={{ background: t.bg }}
        >
          {/* Logo area */}
          <div className="flex items-center gap-1 mb-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.logoAccent }} />
            <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: t.text, opacity: 0.5 }} />
          </div>

          {/* Nav items */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1"
              style={{
                backgroundColor: i === 0 ? t.activeBg : "transparent",
              }}
            >
              <div
                className="h-2 w-2 rounded-sm shrink-0"
                style={{
                  backgroundColor: i === 0 ? t.activeText : t.text,
                  opacity: i === 0 ? 1 : 0.5,
                }}
              />
              <div
                className="h-1 w-7 rounded-full"
                style={{
                  backgroundColor: i === 0 ? t.activeText : t.text,
                  opacity: i === 0 ? 1 : 0.4,
                }}
              />
            </div>
          ))}
        </div>

        {/* Content area preview */}
        <div className="flex-1 bg-background/80 p-2">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-1.5 w-12 rounded-full bg-foreground/20" />
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
          {/* Content blocks */}
          <div className="grid grid-cols-3 gap-1 mb-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 rounded bg-muted/50" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="h-12 rounded bg-muted/30" />
            <div className="h-12 rounded bg-muted/30" />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2 px-1 pb-1">
        <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
          {t.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
          {t.description}
        </p>
      </div>
    </button>
  );
}

function LayoutPreviewCard({ layout, isActive, onClick }: { layout: SidebarLayout; isActive: boolean; onClick: () => void }) {
  const l = sidebarLayouts[layout];
  return (
    <button
      onClick={onClick}
      className={`relative group rounded-xl border-2 p-4 transition-all duration-300 text-left ${
        isActive
          ? "border-primary shadow-[0_0_20px_hsl(142_70%_45%/0.2)] scale-[1.02]"
          : "border-border/50 hover:border-border hover:shadow-md"
      }`}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Check size={14} strokeWidth={3} />
        </div>
      )}
      <div className="text-2xl mb-2">{l.icon}</div>
      <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{l.label}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-tight">{l.description}</p>
    </button>
  );
}

export default function OrganizationSettings({ onNavigate }: OrganizationSettingsProps) {
  const { sidebarTheme, setSidebarTheme, sidebarLayout, setSidebarLayout } = useSidebarTheme();

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md px-6 py-3 relative z-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>⚙️</span>
          <span>/</span>
          <span className="text-foreground font-medium">Organization Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <GlobalSearch onNavigate={onNavigate} />
          <ThemeToggle />
          <NotificationPanel />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-glow-sm">
            DO
          </div>
        </div>
      </header>

      <div className="px-6 pt-6 pb-2 relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Organization Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your platform preferences</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sidebar Preferences Section */}
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card glow-border p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Monitor size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sidebar Preferences</h2>
              <p className="text-sm text-muted-foreground">Choose your preferred sidebar layout and color scheme</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {themeOrder.map((theme) => (
              <SidebarPreviewCard
                key={theme}
                theme={theme}
                isActive={sidebarTheme === theme}
                onClick={() => setSidebarTheme(theme)}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
            <span className="text-primary">💡</span>
            Your sidebar preference is saved automatically and will persist across sessions.
          </div>
        </motion.div>

        {/* Sidebar Layout Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card glow-border p-6 mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutList size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sidebar Layout</h2>
              <p className="text-sm text-muted-foreground">Choose your preferred navigation structure and interaction style</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {layoutOrder.map((layout) => (
              <LayoutPreviewCard
                key={layout}
                layout={layout}
                isActive={sidebarLayout === layout}
                onClick={() => setSidebarLayout(layout)}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
            <span className="text-primary">💡</span>
            Layout style only affects structure and interaction — colors remain the same.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
