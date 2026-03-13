import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown, Clock, ShieldAlert, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Insight {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  icon: LucideIcon;
  time: string;
}

const insights: Insight[] = [
  { id: "i1", title: "Scope 1 emissions up 12%", description: "Carbon emissions increased in APAC manufacturing facilities vs last quarter.", severity: "high", icon: TrendingUp, time: "2h ago" },
  { id: "i2", title: "Missing Scope 3 data", description: "Supply chain emission data incomplete for 4 tier-2 suppliers.", severity: "high", icon: AlertTriangle, time: "5h ago" },
  { id: "i3", title: "Water usage reduced 8%", description: "EMEA facilities achieved water reduction target ahead of schedule.", severity: "low", icon: Droplets, time: "1d ago" },
  { id: "i4", title: "CSRD deadline in 14 days", description: "3 reporting sections still require completion before submission.", severity: "medium", icon: Clock, time: "1d ago" },
  { id: "i5", title: "Supply chain risk detected", description: "Tier-2 supplier flagged for labor practice concerns in SEA region.", severity: "high", icon: ShieldAlert, time: "2d ago" },
  { id: "i6", title: "Waste diversion rate improving", description: "Overall waste diversion rate improved to 67% from 58% last year.", severity: "low", icon: TrendingDown, time: "3d ago" },
];

const severityStyles = {
  high: "border-l-destructive bg-destructive/5",
  medium: "border-l-warning bg-warning/5",
  low: "border-l-primary bg-primary/5",
};

const severityDot = {
  high: "bg-destructive animate-pulse",
  medium: "bg-warning",
  low: "bg-primary",
};

export default function RiskInsightFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card glow-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Risk & Insights</h2>
          <p className="text-xs text-muted-foreground">AI-powered alerts and observations</p>
        </div>
        <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive shadow-[0_0_10px_hsl(0_72%_55%/0.2)]">
          {insights.filter((i) => i.severity === "high").length} critical
        </span>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.06 }}
            className={`flex items-start gap-3 rounded-lg border-l-[3px] p-3 cursor-pointer transition-all hover:bg-secondary/40 ${severityStyles[insight.severity]}`}
          >
            <div className="mt-0.5">
              <insight.icon size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${severityDot[insight.severity]}`} />
                <p className="text-sm font-semibold text-foreground truncate">{insight.title}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{insight.description}</p>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{insight.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
