import { motion } from "framer-motion";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import ThemeToggle from "@/components/ThemeToggle";
import ESGScoreOverview from "./ESGScoreOverview";
import EmissionTrends from "./EmissionTrends";
import SustainabilityGoals from "./SustainabilityGoals";
import SupplyChainIntelligence from "./SupplyChainIntelligence";
import CarbonCostSimulator from "./CarbonCostSimulator";
import GlobalImpactMap from "./GlobalImpactMap";
import RiskInsightFeed from "./RiskInsightFeed";
import AttentionPanel from "./AttentionPanel";
import QuickActions from "./QuickActions";
import ESGRadarChart from "./ESGRadarChart";
import InvestorReadyScore from "./InvestorReadyScore";
import RegulatoryDeadlineTracker from "./RegulatoryDeadlineTracker";
import BenchmarkVsIndustry from "./Benchmarkvsindustry";
import PeerComparison from "./PeerComparison";
import AssetCompare from "./AssetCompare";
import ESGEntityPanel from "./ESGEntityPanel";


interface HomePageProps {
  onNavigate: (view: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex-1 overflow-auto intelligence-grid">
      {/* Top bar */}
      <header className="hidden md:flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md px-6 py-3 relative z-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>🏠</span>
          <span>/</span>
          <span className="text-foreground font-medium">Command Center</span>
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

      {/* Page header */}
      <div className="px-6 pt-6 pb-2 relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">
            ESG <span className="neon-text text-primary">Command Center</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time intelligence across your sustainability program</p>
        </motion.div>
      </div>

      {/* Main grid — Command Center layout */}
      <div className="px-6 py-4 space-y-4 relative z-10">

        {/* ── NEW: Row 0 — Asset Compare + ESG Entities ── */}
          <AssetCompare />
          <ESGEntityPanel />

        {/* Row 1: Score + Trends + Goals */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ESGScoreOverview />
          <EmissionTrends />
          <SustainabilityGoals />
        </div>

        {/* Row 2: Supply Chain + Carbon Simulator + Radar */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SupplyChainIntelligence />
          <CarbonCostSimulator />
          <ESGRadarChart />
        </div>

        {/* Row 3: Map */}
        <GlobalImpactMap />

        {/* Row 4: Risks + Attention + Quick Actions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RiskInsightFeed />
          <AttentionPanel />
          <QuickActions />
        </div>

        {/* Row 5: Investor-Ready Score + Regulatory Deadlines */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InvestorReadyScore />
          <RegulatoryDeadlineTracker />
        </div>

        {/* Row 6: Benchmark vs Industry + Peer Comparison */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BenchmarkVsIndustry />
          <PeerComparison />
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}