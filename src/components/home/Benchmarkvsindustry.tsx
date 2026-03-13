import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const benchmarks = [
  { label: "Carbon Intensity", yours: 78, industry: 61, unit: "tCO₂/M$", higherIsBetter: false },
  { label: "Renewable Energy", yours: 54, industry: 42, unit: "%", higherIsBetter: true },
  { label: "Water Usage", yours: 38, industry: 45, unit: "kL/unit", higherIsBetter: false },
  { label: "Waste Recycled", yours: 67, industry: 55, unit: "%", higherIsBetter: true },
  { label: "Social Score", yours: 65, industry: 70, unit: "/100", higherIsBetter: true },
];

export default function BenchmarkVsIndustry() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card glow-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Benchmark vs Industry</h2>
          <p className="text-xs text-muted-foreground">Your performance vs sector average</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-primary">Top 32%</div>
          <div className="text-[9px] text-muted-foreground">in your sector</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" /> You</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-secondary" /> Industry Avg</span>
      </div>

      <div className="space-y-3">
        {benchmarks.map((b, i) => {
          const isAhead = b.higherIsBetter ? b.yours > b.industry : b.yours < b.industry;
          const isSame = b.yours === b.industry;
          const TrendIcon = isSame ? Minus : isAhead ? TrendingUp : TrendingDown;
          const trendColor = isSame ? "text-muted-foreground" : isAhead ? "text-primary" : "text-destructive";
          const maxVal = Math.max(b.yours, b.industry) * 1.2;

          return (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.07 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{b.label}</span>
                <div className="flex items-center gap-1.5">
                  <TrendIcon size={11} className={trendColor} />
                  <span className="font-semibold text-foreground">{b.yours}{b.unit}</span>
                  <span className="text-muted-foreground/60">vs {b.industry}{b.unit}</span>
                </div>
              </div>
              <div className="relative h-5 rounded-md bg-secondary/30 overflow-hidden">
                {/* Industry avg bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.industry / maxVal) * 100}%` }}
                  transition={{ delay: 0.55 + i * 0.07, duration: 0.5 }}
                  className="absolute top-1 bottom-1 left-0 rounded-sm bg-secondary/80"
                />
                {/* Your bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.yours / maxVal) * 100}%` }}
                  transition={{ delay: 0.65 + i * 0.07, duration: 0.6 }}
                  className="absolute top-1 bottom-1 left-0 rounded-sm"
                  style={{
                    background: isAhead
                      ? "linear-gradient(90deg, hsl(var(--neon-green)/0.6), hsl(var(--neon-green)))"
                      : "linear-gradient(90deg, hsl(var(--destructive)/0.6), hsl(var(--destructive)))",
                    boxShadow: isAhead ? "0 0 8px hsl(var(--neon-green)/0.4)" : "0 0 8px hsl(var(--destructive)/0.4)",
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 text-[11px] text-primary">
        💡 You outperform industry avg in 3 of 5 metrics. Focus on <span className="font-semibold">Social Score</span> to move into top 20%.
      </div>
    </motion.div>
  );
}