import { motion } from "framer-motion";
import { Target, Flame, Trash2, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Goal {
  label: string;
  target: string;
  progress: number;
  icon: LucideIcon;
  color: string;
  trend: string;
}

const goals: Goal[] = [
  { label: "Net Zero by 2040", target: "Target: Carbon Neutral", progress: 38, icon: Target, color: "var(--neon-green)", trend: "+5% YoY" },
  { label: "Emission Reduction", target: "30% reduction by 2030", progress: 62, icon: Flame, color: "var(--neon-green)", trend: "+8% YoY" },
  { label: "Waste Reduction", target: "Zero waste to landfill", progress: 67, icon: Trash2, color: "var(--warning)", trend: "+12% YoY" },
  { label: "Water Efficiency", target: "40% reduction by 2030", progress: 51, icon: Droplets, color: "var(--neon-cyan)", trend: "+3% YoY" },
];

export default function SustainabilityGoals() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card glow-border p-6"
    >
      <h2 className="font-display text-lg font-bold text-foreground mb-1">Sustainability Goals</h2>
      <p className="text-xs text-muted-foreground mb-5">Progress toward company targets</p>

      <div className="space-y-5">
        {goals.map((goal, idx) => (
          <motion.div
            key={goal.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.08 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `hsl(${goal.color} / 0.12)` }}
              >
                <goal.icon size={16} style={{ color: `hsl(${goal.color})` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{goal.label}</span>
                  <span className="text-sm font-bold text-foreground">{goal.progress}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{goal.target}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-secondary/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `hsl(${goal.color})`, boxShadow: `0 0 8px hsl(${goal.color} / 0.4)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 + idx * 0.1 }}
                />
              </div>
              <span className="text-[10px] font-medium text-primary whitespace-nowrap">{goal.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
