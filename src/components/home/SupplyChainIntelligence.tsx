import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Network, ShieldCheck, ShieldAlert, Shield } from "lucide-react";

const distribution = [
  { name: "Compliant", value: 42, color: "hsl(142 70% 45%)" },
  { name: "Moderate", value: 28, color: "hsl(45 90% 55%)" },
  { name: "High Risk", value: 12, color: "hsl(0 72% 55%)" },
  { name: "Unassessed", value: 18, color: "hsl(220 18% 30%)" },
];

const suppliers = [
  { name: "EcoTech Materials", score: 82, status: "compliant" as const },
  { name: "Nordic Renewables", score: 91, status: "compliant" as const },
  { name: "Pacific Minerals", score: 54, status: "risk" as const },
  { name: "Sahara Logistics", score: 71, status: "moderate" as const },
  { name: "Rhine Chemicals", score: 63, status: "moderate" as const },
];

const statusConfig = {
  compliant: { icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10", label: "Compliant", glow: "shadow-glow-sm" },
  moderate: { icon: Shield, color: "text-warning", bg: "bg-warning/10", label: "Warning", glow: "" },
  risk: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", label: "Risk", glow: "" },
};

export default function SupplyChainIntelligence() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card glow-border p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-violet/10">
          <Network size={14} className="text-neon-violet" />
        </div>
        <div>
          <h2 className="font-display text-sm font-bold text-foreground">Supply Chain Intelligence</h2>
          <p className="text-[10px] text-muted-foreground">ESG compliance across supplier network</p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Donut chart */}
        <div className="w-[130px] h-[130px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(220 25% 6%)"
              >
                {distribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(220 22% 11%)", border: "1px solid hsl(220 18% 18%)", borderRadius: 8, fontSize: 11, color: "hsl(210 20% 92%)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier list */}
        <div className="flex-1 space-y-1.5 overflow-hidden">
          {suppliers.map((s, i) => {
            const cfg = statusConfig[s.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-2 rounded-lg bg-secondary/30 px-2.5 py-1.5 cursor-pointer transition-all hover:bg-secondary/50 group"
              >
                <StatusIcon size={13} className={cfg.color} />
                <span className="text-xs font-medium text-foreground truncate flex-1">{s.name}</span>
                <span className={`text-xs font-bold ${s.score >= 80 ? 'text-primary' : s.score >= 65 ? 'text-warning' : 'text-destructive'}`}>
                  {s.score}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
