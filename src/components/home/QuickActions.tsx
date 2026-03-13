import { motion } from "framer-motion";
import { Plus, Droplets, Upload, BarChart3, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const actions: QuickAction[] = [
  { label: "Add Emission Data", description: "Log Scope 1, 2, 3 emissions", icon: Plus, color: "var(--neon-green)" },
  { label: "Add Water Data", description: "Report water consumption", icon: Droplets, color: "var(--neon-cyan)" },
  { label: "Complete Scope 3", description: "Fill supply chain data gaps", icon: BarChart3, color: "var(--warning)" },
  { label: "Upload ESG Report", description: "Submit documents & evidence", icon: Upload, color: "var(--neon-violet)" },
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card glow-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Zap size={15} className="text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Quick Actions</h2>
          <p className="text-xs text-muted-foreground">Common tasks to keep your ESG data current</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, idx) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + idx * 0.06 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3 text-left transition-all hover:border-primary/30 hover:bg-secondary/50 hover:shadow-glow-sm group"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-110"
              style={{ background: `hsl(${action.color} / 0.12)` }}
            >
              <action.icon size={16} style={{ color: `hsl(${action.color})` }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{action.label}</p>
              <p className="text-[10px] text-muted-foreground">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
