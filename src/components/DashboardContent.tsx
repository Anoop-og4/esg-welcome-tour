import { Leaf } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";
import EnvironmentDashboard from "@/components/dashboard/EnvironmentDashboard";

interface DashboardContentProps {
  onNavigate: (view: string) => void;
}

export default function DashboardContent({ onNavigate }: DashboardContentProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <header className="hidden shrink-0 items-center justify-between border-b border-border bg-card/90 px-6 py-3 backdrop-blur-md md:flex">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf size={16} className="text-primary" />
          <span>/</span>
          <span>Environment</span>
          <span>/</span>
          <span className="text-foreground font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <GlobalSearch onNavigate={onNavigate} />
          <ThemeToggle />
          <NotificationPanel />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              DO
            </div>
          </div>
        </div>
      </header>

      <EnvironmentDashboard />
    </div>
  );
}
