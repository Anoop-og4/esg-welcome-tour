import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Target, Globe2, BarChart3 } from "lucide-react";
import NewsInsights from "./NewsInsights";
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

interface HomePageProps {
  onNavigate: (view: string) => void;
}

const kpis = [
  { label: "ESG Score", value: "78", delta: "+3.2", trend: "up", hint: "vs last quarter" },
  { label: "Total Emissions", value: "271.8K", unit: "tCO₂e", delta: "-4.1%", trend: "down", hint: "YoY" },
  { label: "Goals On Track", value: "12", unit: "/ 18", delta: "67%", trend: "up", hint: "completion" },
  { label: "Open Risks", value: "5", delta: "2 high", trend: "warn", hint: "needs review" },
  { label: "Compliance", value: "94%", delta: "CSRD ready", trend: "up", hint: "frameworks" },
];

type TabKey = "performance" | "operations" | "intelligence" | "benchmark";

const tabs: { key: TabKey; label: string; icon: typeof TrendingUp }[] = [
  { key: "performance", label: "Performance", icon: TrendingUp },
  { key: "operations", label: "Operations", icon: Globe2 },
  { key: "intelligence", label: "Risk & Action", icon: AlertTriangle },
  { key: "benchmark", label: "Benchmark", icon: BarChart3 },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [tab, setTab] = useState<TabKey>("performance");

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

      <div className="px-6 py-6 space-y-5 relative z-10 max-w-[1600px] mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-3"
        >
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles size={12} className="text-primary" />
              <span>ESG Command Center</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-1">
              Good morning, <span className="text-primary neon-text">Daniel</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your sustainability program at a glance — live data across 5 regions, 18 active goals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("goals")}
              className="rounded-lg border border-border bg-secondary/40 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors"
            >
              Open Goals
            </button>
            <button
              onClick={() => onNavigate("audit")}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Review Audit Trail
            </button>
          </div>
        </motion.div>

        {/* KPI strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
              className="glass-card glow-border p-4 group cursor-default"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{k.label}</p>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="font-display text-2xl font-bold text-foreground">{k.value}</span>
                {k.unit && <span className="text-xs text-muted-foreground">{k.unit}</span>}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-[11px] font-semibold ${
                    k.trend === "up" ? "text-success" : k.trend === "down" ? "text-info" : "text-warning"
                  }`}
                >
                  {k.delta}
                </span>
                <span className="text-[10px] text-muted-foreground">{k.hint}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary focus: Score + Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <ESGScoreOverview />
          </div>
          <div className="lg:col-span-2">
            <EmissionTrends />
          </div>
        </div>

        {/* News & Insights */}
        <NewsInsights />

        {/* Tabbed secondary section */}
        <div className="glass-card glow-border overflow-hidden">
          <div className="flex items-center gap-1 border-b border-border/60 px-2 pt-2 overflow-x-auto">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                  {active && (
                    <motion.span
                      layoutId="home-tab-indicator"
                      className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {tab === "performance" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SustainabilityGoals />
                    <ESGRadarChart />
                  </div>
                )}
                {tab === "operations" && (
                  <div className="space-y-4">
                    <GlobalImpactMap />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <SupplyChainIntelligence />
                      <CarbonCostSimulator />
                    </div>
                  </div>
                )}
                {tab === "intelligence" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <AttentionPanel />
                    <RiskInsightFeed />
                    <QuickActions />
                  </div>
                )}
                {tab === "benchmark" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <InvestorReadyScore />
                      <RegulatoryDeadlineTracker />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <BenchmarkVsIndustry />
                      <PeerComparison />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
