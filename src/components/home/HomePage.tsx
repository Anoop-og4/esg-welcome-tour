import { motion } from "framer-motion";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import ESGScoreOverview from "./ESGScoreOverview";
import ESGRadarChart from "./ESGRadarChart";
import RiskInsightFeed from "./RiskInsightFeed";
import SustainabilityGoals from "./SustainabilityGoals";
import GlobalImpactMap from "./GlobalImpactMap";
import AttentionPanel from "./AttentionPanel";
import QuickActions from "./QuickActions";

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex-1 overflow-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>🏠</span>
          <span>/</span>
          <span className="text-foreground font-medium">Command Center</span>
        </div>
        <div className="flex items-center gap-3">
          <GlobalSearch onNavigate={onNavigate} />
          <NotificationPanel />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            DO
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="px-6 pt-6 pb-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">ESG Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Insights, priorities, and actions across your sustainability program</p>
        </motion.div>
      </div>

      {/* Main grid */}
      <div className="px-6 py-4 space-y-4">
        {/* Row 1: Score + Radar */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ESGScoreOverview />
          </div>
          <div className="lg:col-span-2">
            <ESGRadarChart />
          </div>
        </div>

        {/* Row 2: Risks + Goals */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RiskInsightFeed />
          <SustainabilityGoals />
        </div>

        {/* Row 3: Map */}
        <GlobalImpactMap />

        {/* Row 4: Attention + Quick Actions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AttentionPanel />
          <QuickActions />
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
