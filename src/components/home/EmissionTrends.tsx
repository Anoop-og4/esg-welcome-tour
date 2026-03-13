import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingDown, Activity } from "lucide-react";

const data = [
  { month: "Jan", co2: 1340 }, { month: "Feb", co2: 1280 }, { month: "Mar", co2: 1350 },
  { month: "Apr", co2: 1220 }, { month: "May", co2: 1180 }, { month: "Jun", co2: 1150 },
  { month: "Jul", co2: 1090 }, { month: "Aug", co2: 1050 }, { month: "Sep", co2: 1020 },
  { month: "Oct", co2: 980 }, { month: "Nov", co2: 950 }, { month: "Dec", co2: 920 },
];

const stats = [
  { label: "Peak", value: "1,350", sub: "Mar" },
  { label: "Current", value: "920", sub: "Dec" },
  { label: "Target", value: "800", sub: "FY26" },
];

export default function EmissionTrends() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card glow-border p-5 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-cyan/10">
            <Activity size={14} className="text-neon-cyan" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-foreground">Emission Trends</h2>
            <p className="text-[10px] text-muted-foreground">12-month CO₂ trajectory</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          <TrendingDown size={12} /> -31%
        </span>
      </div>

      <div className="flex gap-3 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 rounded-lg bg-secondary/50 px-2.5 py-1.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emissionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(180 80% 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(180 80% 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: "hsl(215 14% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215 14% 55%)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(220 22% 11%)", border: "1px solid hsl(220 18% 18%)", borderRadius: 8, fontSize: 11, color: "hsl(210 20% 92%)" }}
              labelStyle={{ color: "hsl(215 14% 55%)" }}
            />
            <Area
              type="monotone"
              dataKey="co2"
              stroke="hsl(180 80% 55%)"
              strokeWidth={2}
              fill="url(#emissionGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(180 80% 55%)", stroke: "hsl(220 25% 6%)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
