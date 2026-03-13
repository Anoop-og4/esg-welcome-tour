import { motion } from "framer-motion";
import { AlertCircle, Clock, CheckCircle2, ChevronRight } from "lucide-react";

const regulations = [
  {
    name: "CSRD Reporting",
    framework: "EU",
    deadline: "2025-03-31",
    daysLeft: 14,
    completion: 68,
    status: "critical",
    description: "3 sections incomplete",
  },
  {
    name: "BRSR Core",
    framework: "SEBI",
    deadline: "2025-05-30",
    daysLeft: 74,
    completion: 45,
    status: "warning",
    description: "Supply chain data pending",
  },
  {
    name: "TCFD Disclosure",
    framework: "Global",
    deadline: "2025-06-30",
    daysLeft: 105,
    completion: 80,
    status: "ok",
    description: "On track",
  },
  {
    name: "SEC Climate Rule",
    framework: "US",
    deadline: "2025-09-15",
    daysLeft: 182,
    completion: 30,
    status: "ok",
    description: "Early stage",
  },
  {
    name: "GRI Standards",
    framework: "Global",
    deadline: "2025-12-31",
    daysLeft: 290,
    completion: 20,
    status: "ok",
    description: "Planning phase",
  },
];

const statusConfig = {
  critical: { color: "hsl(var(--destructive))", bg: "bg-destructive/10", label: "Critical", icon: AlertCircle },
  warning: { color: "hsl(var(--warning))", bg: "bg-warning/10", label: "Warning", icon: Clock },
  ok: { color: "hsl(var(--neon-green))", bg: "bg-primary/10", label: "On Track", icon: CheckCircle2 },
};

export default function RegulatoryDeadlineTracker() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card glow-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Regulatory Deadlines</h2>
          <p className="text-xs text-muted-foreground">Compliance calendar & completion status</p>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">
          <AlertCircle size={10} /> 1 Critical
        </span>
      </div>

      <div className="space-y-2">
        {regulations.map((reg, i) => {
          const cfg = statusConfig[reg.status as keyof typeof statusConfig];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={reg.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="group flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2.5 hover:bg-secondary/40 transition-all cursor-pointer"
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                <Icon size={13} style={{ color: cfg.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">{reg.name}</span>
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border" style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}10` }}>
                    {reg.framework}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-secondary/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${reg.completion}%` }}
                      transition={{ delay: 0.6 + i * 0.07, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: cfg.color }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{reg.completion}%</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold" style={{ color: cfg.color }}>{reg.daysLeft}d</div>
                <div className="text-[9px] text-muted-foreground">left</div>
              </div>

              <ChevronRight size={12} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}