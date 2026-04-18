import { Menu } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";

interface MobileTopBarProps {
  onOpenSidebar: () => void;
  onNavigate: (view: string) => void;
}

export default function MobileTopBar({ onOpenSidebar, onNavigate }: MobileTopBarProps) {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/80 backdrop-blur-md px-3 py-2">
      <button
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted active:scale-95"
      >
        <Menu size={20} />
      </button>

      <h1 className="font-display text-base font-bold tracking-tight text-foreground">
        only<span className="text-primary neon-text">good</span>
      </h1>

      <div className="ml-auto flex items-center gap-1.5">
        <GlobalSearch onNavigate={onNavigate} />
        <ThemeToggle />
        <NotificationPanel />
      </div>
    </header>
  );
}
